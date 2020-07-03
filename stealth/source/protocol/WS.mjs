
import crypto from 'crypto';
import net    from 'net';

import { Buffer, Emitter, isBoolean, isBuffer, isFunction, isNumber, isObject } from '../../extern/base.mjs';
import { HTTP                                                                 } from './HTTP.mjs';



const upgrade_request = (host, port, nonce) => {

	return Buffer.from([
		'GET / HTTP/1.1',
		'Host: ' + host + ':' + port,
		'Connection: Upgrade',
		'Upgrade: WebSocket',
		'Sec-WebSocket-Key: ' + nonce.toString('base64'),
		'Sec-WebSocket-Protocol: stealth',
		'Sec-WebSocket-Version: 13',
		'',
		''
	].join('\r\n'), 'utf8');

};

const upgrade_response = (nonce) => {

	let hash   = crypto.createHash('sha1').update(nonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('hex');
	let accept = Buffer.from(hash, 'hex');

	return Buffer.from([
		'HTTP/1.1 101 WebSocket Protocol Handshake',
		'Connection: Upgrade',
		'Upgrade: WebSocket',
		'Sec-WebSocket-Accept: ' + accept.toString('base64'),
		'Sec-WebSocket-Protocol: stealth',
		'Sec-WebSocket-Version: 13',
		'',
		''
	].join('\r\n'), 'utf8');

};



const decode_json = function(buffer) {

	let data = null;

	try {
		data = JSON.parse(buffer.toString('utf8'));
	} catch (err) {
		data = null;
	}

	return data;

};

const encode_json = function(data) {

	let buffer = null;

	try {
		let tmp = JSON.stringify(data, null, '\t');
		buffer = Buffer.from(tmp, 'utf8');
	} catch (err) {
		buffer = null;
	}

	return buffer;

};

const decode = function(connection, buffer) {

	if (buffer.length <= 2) {
		return null;
	}


	let chunk = {
		close:    false,
		fragment: false,
		headers:  {},
		payload:  null,
		response: null,
		overflow: null
	};


	let fragment       = connection.fragment;
	let fin            = (buffer[0] & 128) === 128;
	let operator       = (buffer[0] &  15);
	let mask           = (buffer[1] & 128) === 128;
	let mask_data      = Buffer.alloc(4);
	let overflow_data  = null;
	let payload_length = buffer[1] & 127;
	let payload_data   = null;

	if (payload_length <= 125) {

		if (mask === true) {

			mask_data     = buffer.slice(2, 6);
			payload_data  = buffer.slice(6, 6 + payload_length);
			overflow_data = buffer.slice(6 + payload_length);

		} else {

			mask_data     = null;
			payload_data  = buffer.slice(2, 2 + payload_length);
			overflow_data = buffer.slice(2 + payload_length);

		}

	} else if (payload_length === 126) {

		payload_length = (buffer[2] << 8) + buffer[3];

		if (payload_length > buffer.length) {
			chunk.fragment = true;
			return chunk;
		}

		if (mask === true) {

			mask_data     = buffer.slice(4, 8);
			payload_data  = buffer.slice(8, 8 + payload_length);
			overflow_data = buffer.slice(8 + payload_length);

		} else {

			mask_data     = null;
			payload_data  = buffer.slice(4, 4 + payload_length);
			overflow_data = buffer.slice(4 + payload_length);

		}

	} else if (payload_length === 127) {

		let hi = (buffer[2] * 0x1000000) + ((buffer[3] << 16) | (buffer[4] << 8) | buffer[5]);
		let lo = (buffer[6] * 0x1000000) + ((buffer[7] << 16) | (buffer[8] << 8) | buffer[9]);


		payload_length = (hi * 4294967296) + lo;

		if (payload_length > buffer.length) {
			chunk.fragment = true;
			return chunk;
		}

		if (mask === true) {

			mask_data     = buffer.slice(10, 14);
			payload_data  = buffer.slice(14, 14 + payload_length);
			overflow_data = buffer.slice(14 + payload_length);

		} else {

			mask_data     = null;
			payload_data  = buffer.slice(10, 10 + payload_length);
			overflow_data = buffer.slice(10 + payload_length);

		}

	}


	if (mask_data !== null) {
		payload_data = payload_data.map((value, index) => value ^ mask_data[index % 4]);
	}

	if (overflow_data !== null && overflow_data.length > 0) {
		chunk.overflow = overflow_data;
	}


	if (operator === 0x00) {

		// 0x00: Continuation Frame (Fragmentation Packet)

		if (payload_data !== null) {

			let payload = Buffer.alloc(fragment.payload.length + payload_length);

			fragment.payload.copy(payload, 0);
			payload_data.copy(payload, fragment.payload.length);

			fragment.payload = payload;

		}


		if (fin === true) {

			let tmp = decode_json(fragment.payload);
			if (tmp !== null) {

				if (isObject(tmp.headers) === true) {
					chunk.headers = tmp.headers;
				}

				if (isBoolean(tmp.payload) === true) {
					chunk.payload = tmp.payload;
				} else {
					chunk.payload = tmp.payload || null;
				}

			}

			fragment.operator = 0x00;
			fragment.payload  = Buffer.alloc(0);

		}

	} else if (operator === 0x01) {

		// 0x01: Text Frame (possibly fragmented)

		if (fin === true) {

			let tmp = decode_json(payload_data);
			if (tmp !== null) {

				if (isObject(tmp.headers) === true) {
					chunk.headers = tmp.headers;
				}

				if (isBoolean(tmp.payload) === true) {
					chunk.payload = tmp.payload;
				} else {
					chunk.payload = tmp.payload || null;
				}

			}

		} else if (payload_data !== null) {

			let payload = Buffer.alloc(fragment.payload.length + payload_length);

			fragment.payload.copy(payload, 0);
			payload_data.copy(payload, fragment.payload.length);

			fragment.payload  = payload;
			fragment.operator = operator;

		}

	} else if (operator === 0x02) {

		// 0x02: Binary Frame (possibly fragmented)

		let buffer = Buffer.alloc(4);
		let code   = 1002; // protocol error

		buffer[0] = 128 + 0x08; // close
		buffer[1] =   0 + 0x02; // unmasked (client and server)

		buffer[1] = (code >> 8) & 0xff;
		buffer[2] = (code >> 0) & 0xff;

		chunk.close    = true;
		chunk.response = buffer;

	} else if (operator === 0x08) {

		// 0x08: Connection Close Frame

		let buffer = Buffer.alloc(4);
		let code   = 1000; // normal connection close

		buffer[0] = 128 + 0x08; // close
		buffer[1] =   0 + 0x02; // unmasked (client and server)

		buffer[1] = (code >> 8) & 0xff;
		buffer[2] = (code >> 0) & 0xff;

		chunk.close    = true;
		chunk.response = buffer;

	} else if (operator === 0x09) {

		// 0x09: Ping Frame

		let buffer = Buffer.alloc(2);

		buffer[0] = 128 + 0x0a; // fin, pong
		buffer[1] =   0 + 0x00; // unmasked

		chunk.response = buffer;

	} else if (operator === 0x0a) {

		// 0x0a: Pong Frame

		chunk.fragment = true;

	} else {

		let buffer = Buffer.alloc(4);
		let code   = 1002; // protocol error

		buffer[0] = 128 + 0x08; // close
		buffer[1] =   0 + 0x02; // unmasked (client and server)

		buffer[1] = (code >> 8) & 0xff;
		buffer[2] = (code >> 0) & 0xff;

		chunk.close    = true;
		chunk.response = buffer;

	}


	return chunk;

};

const encode = function(connection, data) {

	let buffer         = null;
	let mask           = false;
	let mask_data      = null;
	let payload_data   = null;
	let payload_length = data.length;


	if (connection.type === 'server') {

		mask         = false;
		mask_data    = Buffer.alloc(4);
		payload_data = data.map((value) => value);

	} else {

		mask      = true;
		mask_data = Buffer.alloc(4);

		mask_data[0] = (Math.random() * 0xff) | 0;
		mask_data[1] = (Math.random() * 0xff) | 0;
		mask_data[2] = (Math.random() * 0xff) | 0;
		mask_data[3] = (Math.random() * 0xff) | 0;

		payload_data = data.map((value, index) => value ^ mask_data[index % 4]);

	}


	if (payload_length > 0xffff) {

		// 64 Bit Extended Payload Length

		let lo = (payload_length |  0);
		let hi = (payload_length - lo) / 4294967296;

		buffer = Buffer.alloc((mask === true ? 14 : 10) + payload_length);

		buffer[0] = 128 + 0x01;
		buffer[1] = (mask === true ? 128 : 0) + 127;
		buffer[2] = (hi >> 24) & 0xff;
		buffer[3] = (hi >> 16) & 0xff;
		buffer[4] = (hi >>  8) & 0xff;
		buffer[5] = (hi >>  0) & 0xff;
		buffer[6] = (lo >> 24) & 0xff;
		buffer[7] = (lo >> 16) & 0xff;
		buffer[8] = (lo >>  8) & 0xff;
		buffer[9] = (lo >>  0) & 0xff;

		if (mask === true) {

			mask_data.copy(buffer, 10);
			payload_data.copy(buffer, 14);

		} else {

			payload_data.copy(buffer, 10);

		}

	} else if (payload_length > 125) {

		// 16 Bit Extended Payload Length

		buffer = Buffer.alloc((mask === true ? 8 : 4) + payload_length);

		buffer[0] = 128 + 0x01;
		buffer[1] = (mask === true ? 128 : 0) + 126;
		buffer[2] = (payload_length >> 8) & 0xff;
		buffer[3] = (payload_length >> 0) & 0xff;

		if (mask === true) {
			mask_data.copy(buffer, 4);
			payload_data.copy(buffer, 8);
		} else {
			payload_data.copy(buffer, 4);
		}

	} else {

		// 7 Bit Payload Length

		buffer = Buffer.alloc((mask === true ? 6 : 2) + payload_length);

		buffer[0] = 128 + 0x01;
		buffer[1] = (mask === true ? 128 : 0) + payload_length;

		if (mask === true) {
			mask_data.copy(buffer, 2);
			payload_data.copy(buffer, 6);
		} else {
			payload_data.copy(buffer, 2);
		}

	}

	return buffer;

};



const onconnect = function(connection, ref) {

	let hosts = ref.hosts.sort((a, b) => {

		if (a.scope === 'private' && b.scope === 'private') {

			if (a.type === 'v4' && b.type === 'v4') return 0;
			if (a.type === 'v4') return -1;
			if (b.type === 'v4') return  1;

		}

		if (a.scope === 'private') return -1;
		if (b.scope === 'private') return  1;

		if (a.type === 'v4' && b.type === 'v4') return 0;
		if (a.type === 'v4') return -1;
		if (b.type === 'v4') return  1;

		return 0;

	});


	let hostname = hosts[0].ip;
	let nonce    = Buffer.alloc(16);

	if (ref.domain !== null) {

		if (ref.subdomain !== null) {
			hostname = ref.subdomain + '.' + ref.domain;
		} else {
			hostname = ref.domain;
		}

	}

	for (let n = 0; n < 16; n++) {
		nonce[n] = Math.round(Math.random() * 0xff);
	}


	connection.socket.once('data', (data) => {

		HTTP.receive(connection, data, (response) => {

			let tmp1 = (response.headers['connection'] || '').toLowerCase();
			let tmp2 = (response.headers['upgrade'] || '').toLowerCase();

			if (tmp1.includes('upgrade') && tmp2.includes('websocket')) {

				let accept = response.headers['sec-websocket-accept'] || '';
				let hash   = crypto.createHash('sha1').update(nonce.toString('base64') + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('hex');
				let expect = Buffer.from(hash, 'hex').toString('base64');

				if (accept === expect) {

					connection.type     = 'client';
					connection.interval = setInterval(() => connection.ping(), 60000);
					connection.socket.on('data', (fragment) => {
						ondata(connection, ref, fragment);
					});

					connection.emit('@connect');

				} else {
					connection.emit('error', [{ type: 'request', cause: 'socket-trust' }]);
				}

			} else {
				connection.emit('error', [{ type: 'request' }]);
			}

		});

	});


	connection.socket.write(upgrade_request(
		hostname,
		ref.port || 80,
		nonce
	));

};

const ondata = function(connection, ref, chunk) {

	if (connection.type === 'client') {

		WS.receive(connection, chunk, (frame) => {
			connection.emit('response', [ frame ]);
		});

	} else if (connection.type === 'server') {

		WS.receive(connection, chunk, (frame) => {
			connection.emit('request', [ frame ]);
		});

	}

};

const ondisconnect = function(connection /*, ref */) {

	let fragment = connection.fragment;
	if (fragment.payload.length > 0) {
		connection.emit('error', [{ type: 'request' }]);
	}


	connection.disconnect();

};

const onupgrade = function(connection, ref) {

	let nonce = ref.headers['sec-websocket-key'] || '';

	connection.type = 'server';

	connection.socket.on('data', (fragment) => {
		ondata(connection, ref, fragment);
	});


	connection.socket.resume();
	connection.socket.write(upgrade_response(nonce));

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};

const isUpgrade = function(ref) {

	if (
		isObject(ref) === true
		&& isObject(ref.headers) === true
		&& (ref.headers['connection'] || '').toLowerCase().includes('upgrade') === true
		&& (ref.headers['upgrade'] || '').toLowerCase().includes('websocket') === true
		&& (ref.headers['sec-websocket-protocol'] || '').includes('stealth') === true
		&& (ref.headers['sec-websocket-key'] || '') !== ''
	) {
		return true;
	}

	return false;

};

const Connection = function(socket) {

	socket = isSocket(socket) ? socket : null;


	this.socket   = socket;
	this.fragment = {
		buffer:   null,
		operator: 0x00,
		payload:  Buffer.alloc(0)
	};
	this.interval = null;
	this.type     = null;

	Emitter.call(this);

};


Connection.from = function(json) {

	if (isObject(json) === true) {

		let type = json.type === 'Connection' ? json.type : null;
		let data = isObject(json.data)        ? json.data : null;

		if (type !== null && data !== null) {

			let connection = new Connection();

			return connection;

		}

	} else if (isConnection(json) === true) {

		if ((json instanceof Connection) === true) {

			return json;

		} else {

			let socket     = json.socket || null;
			let connection = new Connection(socket);

			for (let prop in json) {

				if (prop !== 'socket') {
					connection[prop] = json[prop];
				}

			}

			return connection;

		}

	}


	return null;

};


Connection.isConnection = isConnection;


Connection.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Connection',

	toJSON: function() {

		let data = {
			local:  null,
			remote: null
		};

		let socket = this.socket;
		if (socket !== null) {
			data.local  = socket.localAddress  + ':' + socket.localPort;
			data.remote = socket.remoteAddress + ':' + socket.remotePort;
		}


		return {
			'type': 'Connection',
			'data': data
		};

	},

	disconnect: function() {

		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}

		if (this.socket !== null) {

			this.socket.destroy();
			this.socket = null;

			this.emit('@disconnect');

		}

	},

	ping: function() {

		if (this.type === 'client') {

			if (this.socket !== null) {

				this.socket.write(Buffer.from([
					128 + 0x09, // Ping Frame
					128 + 0x00,
					(Math.random() * 0xff) | 0,
					(Math.random() * 0xff) | 0,
					(Math.random() * 0xff) | 0,
					(Math.random() * 0xff) | 0
				]));

			} else if (this.interval !== null) {

				clearInterval(this.interval);
				this.interval = null;

			}

		}

	}

});



const WS = {

	connect: function(ref, connection) {

		ref        = isObject(ref)            ? ref                         : null;
		connection = isConnection(connection) ? Connection.from(connection) : new Connection();


		if (ref !== null) {

			let hosts = ref.hosts.sort((a, b) => {

				if (a.scope === 'private' && b.scope === 'private') {

					if (a.type === 'v4' && b.type === 'v4') return 0;
					if (a.type === 'v4') return -1;
					if (b.type === 'v4') return  1;

				}

				if (a.scope === 'private') return -1;
				if (b.scope === 'private') return  1;

				if (a.type === 'v4' && b.type === 'v4') return 0;
				if (a.type === 'v4') return -1;
				if (b.type === 'v4') return  1;

				return 0;

			});

			if (hosts.length > 0) {

				if (connection.socket === null) {

					try {

						connection.socket = net.connect({
							host:          hosts[0].ip,
							port:          ref.port || 80,
							allowHalfOpen: true
						}, () => {

							connection.socket.setNoDelay(true);
							connection.socket.setKeepAlive(true, 0);
							connection.socket.allowHalfOpen = true;

							onconnect(connection, ref);

						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					connection.socket.setNoDelay(true);
					connection.socket.setKeepAlive(true, 0);
					connection.socket.allowHalfOpen = true;

					setTimeout(() => {
						onconnect(connection, ref);
					}, 0);

				}


				if (connection.socket !== null) {

					connection.socket.removeAllListeners('data');
					connection.socket.removeAllListeners('timeout');
					connection.socket.removeAllListeners('error');
					connection.socket.removeAllListeners('end');

					connection.socket.on('timeout', () => {

						if (connection.socket !== null) {

							connection.socket = null;
							connection.emit('timeout', [ null ]);

						}

					});

					connection.socket.on('error', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, ref);
							connection.socket = null;

						}

					});

					connection.socket.on('end', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, ref);
							connection.socket = null;

						}

					});

					return connection;

				} else {

					connection.socket = null;
					connection.emit('error', [{ type: 'request' }]);

					return null;

				}

			} else {

				connection.socket = null;
				connection.emit('error', [{ type: 'host' }]);

				return null;

			}

		} else {

			connection.socket = null;
			connection.emit('error', [{ type: 'request' }]);

			return null;

		}

	},

	disconnect: function(connection) {

		connection = isConnection(connection) ? connection : null;


		if (connection !== null) {

			connection.disconnect();

			return true;

		}


		return false;

	},

	receive: function(connection, buffer, callback) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;
		callback   = isFunction(callback)     ? callback   : null;


		if (buffer !== null) {

			if (connection.fragment.buffer !== null) {
				buffer = Buffer.concat([ connection.fragment.buffer, buffer ]);
				connection.fragment.buffer = null;
			}


			let data = decode(connection, buffer);
			if (data !== null) {

				if (data.close === true) {
					connection.socket.end();
				}

				if (data.response !== null) {

					if (connection.socket !== null) {
						connection.socket.write(data.response);
					}

				} else if (data.fragment === true) {

					connection.fragment.buffer = buffer;

				} else {

					// Special case: Deserialize Buffer instances
					if (isObject(data.payload) === true) {

						if (data.payload.type === 'Buffer') {
							data.payload = Buffer.from(data.payload.data);
						}

					}


					if (callback !== null) {

						callback({
							headers: data.headers,
							payload: data.payload
						});

					}

					// Special case: Network gave us multiple Buffers
					if (data.overflow !== null) {
						WS.receive(connection, data.overflow, callback);
					}

				}

			} else {

				if (callback !== null) {
					callback(null);
				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			}

		}

	},

	send: function(connection, data, callback) {

		connection = isConnection(connection) ? connection : null;
		data       = isObject(data)           ? data       : {};
		callback   = isFunction(callback)     ? callback   : null;


		if (connection !== null && connection.socket !== null) {

			let buffer  = null;
			let headers = null;
			let payload = null;

			if (isObject(data.headers) === true) {
				headers = data.headers;
			} else {
				headers = {};
			}

			if (isBoolean(data.payload) === true) {
				payload = data.payload;
			} else {
				payload = data.payload || null;
			}


			if (isNumber(headers['@status']) === true) {

				buffer = Buffer.from([
					128 + 0x08, // close
					0   + 0x02, // unmasked (client and server)
					(headers['@status'] >> 8) & 0xff,
					(headers['@status'] >> 0) & 0xff
				]);

			} else {

				let headers_keys = Object.keys(headers).filter((h) => h.startsWith('@') === false);
				if (headers_keys.length > 0 || payload !== null) {

					let tmp = { headers: {}, payload: payload };
					headers_keys.forEach((key) => tmp.headers[key] = headers[key]);

					let data = encode_json(tmp);
					if (data !== null) {
						buffer = encode(connection, data);
					}

				}

			}


			if (buffer !== null) {

				connection.socket.write(buffer);

				if (callback !== null) {
					callback(true);
				}

			} else {

				if (callback !== null) {
					callback(false);
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			}

		}

	},

	upgrade: function(tunnel, ref) {

		ref = isUpgrade(ref) ? ref : null;


		let connection = null;

		if (isSocket(tunnel) === true) {
			connection = new Connection(tunnel);
		} else if (isConnection(tunnel) === true) {
			connection = Connection.from(tunnel);
		}


		if (connection !== null) {

			if (ref !== null) {

				connection.socket.setNoDelay(true);
				connection.socket.setKeepAlive(true, 0);
				connection.socket.allowHalfOpen = true;

				connection.socket.removeAllListeners('data');
				connection.socket.removeAllListeners('timeout');
				connection.socket.removeAllListeners('error');
				connection.socket.removeAllListeners('end');

				connection.socket.on('timeout', () => {

					if (connection.socket !== null) {

						connection.socket = null;
						connection.emit('timeout', [ null ]);

					}

				});

				connection.socket.on('error', () => {

					if (connection.socket !== null) {

						ondisconnect(connection, ref);
						connection.socket = null;

					}

				});

				connection.socket.on('end', () => {

					if (connection.socket !== null) {

						ondisconnect(connection, ref);
						connection.socket = null;

					}

				});

				onupgrade(connection, ref);

			} else {

				connection.socket.once('data', (data) => {

					HTTP.receive(null, data, (request) => {

						if (isUpgrade(request) === true) {
							WS.upgrade(connection, request);
						} else {
							connection.disconnect();
						}

					});

				});

			}

			return connection;

		}


		return null;

	}

};


export { WS };

