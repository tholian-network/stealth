
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
		response: null
	};


	let fragment       = connection.fragment;
	let fin            = (buffer[0] & 128) === 128;
	let operator       = (buffer[0] &  15);
	let mask           = (buffer[1] & 128) === 128;
	let mask_data      = Buffer.alloc(4);
	let payload_length = buffer[1] & 127;
	let payload_data   = null;


	if (payload_length <= 125) {

		if (mask === true) {
			mask_data    = buffer.slice(2, 6);
			payload_data = buffer.slice(6, 6 + payload_length);
		} else {
			mask_data    = null;
			payload_data = buffer.slice(2, 2 + payload_length);
		}

	} else if (payload_length === 126) {

		payload_length = (buffer[2] << 8) + buffer[3];

		if (payload_length > buffer.length) {
			chunk.fragment = true;
			return chunk;
		}

		if (mask === true) {
			mask_data    = buffer.slice(4, 8);
			payload_data = buffer.slice(8, 8 + payload_length);
		} else {
			mask_data    = null;
			payload_data = buffer.slice(4, 4 + payload_length);
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
			mask_data    = buffer.slice(10, 14);
			payload_data = buffer.slice(14, 14 + payload_length);
		} else {
			mask_data    = null;
			payload_data = buffer.slice(10, 10 + payload_length);
		}

	}


	if (mask_data !== null) {
		payload_data = payload_data.map((value, index) => value ^ mask_data[index % 4]);
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

				if (isObject(tmp.headers)) {
					chunk.headers = tmp.headers;
				}

				if (isBoolean(tmp.payload)) {
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

				if (isObject(tmp.headers)) {
					chunk.headers = tmp.headers;
				}

				if (isBoolean(tmp.payload)) {
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

					connection.interval = setInterval(() => {

						let result = WS.ping(connection);
						if (result === false) {

							if (connection.interval !== null) {
								clearInterval(connection.interval);
								connection.interval = null;
							}

						}

					}, 60000);

					connection.type = 'client';
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

	let fragment = connection.fragment;

	if (fragment.chunk !== null) {
		chunk = Buffer.concat([ fragment.chunk, chunk ]);
		fragment.chunk = null;
	}

	if (connection.type === 'client') {

		WS.receive(connection, chunk, (frame) => {

			if (frame !== null) {
				connection.emit('response', [ frame ]);
			} else {
				fragment.chunk = chunk;
			}

		});

	} else if (connection.type === 'server') {

		WS.receive(connection, chunk, (frame) => {

			if (frame !== null) {
				connection.emit('request', [ frame ]);
			} else {
				fragment.chunk = chunk;
			}

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
	connection.socket.resume();
	connection.socket.write(upgrade_response(nonce));

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const Connection = function(socket) {

	this.socket   = socket || null;
	this.fragment = {
		chunk:    null,
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
		}

		this.emit('@disconnect');

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

				let socket = connection.socket || null;
				if (socket === null) {

					try {

						socket = net.connect({
							host:          hosts[0].ip,
							port:          ref.port || 80,
							allowHalfOpen: true
						}, () => {

							socket.setTimeout(0);
							socket.setNoDelay(true);
							socket.setKeepAlive(true, 0);
							socket.allowHalfOpen = true;

							connection.socket = socket;
							onconnect(connection, ref);

						});

					} catch (err) {
						socket = null;
					}

				} else {

					socket.setTimeout(0);
					socket.setNoDelay(true);
					socket.setKeepAlive(true, 0);
					socket.allowHalfOpen = true;

					setTimeout(() => {
						onconnect(connection, ref);
					}, 0);

				}


				if (socket !== null) {

					socket.removeAllListeners('data');
					socket.removeAllListeners('timeout');
					socket.removeAllListeners('error');
					socket.removeAllListeners('end');

					socket.on('data', (fragment) => {
						ondata(connection, ref, fragment);
					});

					socket.on('timeout', () => {

						if (connection.socket !== null) {

							connection.socket = null;
							connection.emit('timeout', [ null ]);

						}

					});

					socket.on('error', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, ref);
							connection.socket = null;

						}

					});

					socket.on('end', () => {

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

	ping: function(connection) {

		connection = isConnection(connection) ? connection : null;


		if (connection !== null) {

			if (connection.socket !== null) {

				let buffer = Buffer.alloc(6);

				buffer[0] = 128 + 0x09; // ping
				buffer[1] = 128 + 0x00; // masked (client)

				buffer[2] = (Math.random() * 0xff) | 0;
				buffer[3] = (Math.random() * 0xff) | 0;
				buffer[4] = (Math.random() * 0xff) | 0;
				buffer[5] = (Math.random() * 0xff) | 0;

				if (connection.socket.writable === true) {
					return connection.socket.write(buffer);
				}

			}

		}


		return false;

	},

	receive: function(connection, buffer, callback) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;
		callback   = isFunction(callback)     ? callback   : null;


		if (buffer !== null) {

			let data = decode(connection, buffer);
			if (data.close === true) {
				connection.socket.end();
			}

			if (data.response !== null) {

				if (connection.socket !== null) {
					connection.socket.write(data.response);
				}

			} else if (data.fragment === true) {

				if (callback !== null) {
					callback(null);
				} else {
					return null;
				}

			} else {

				// Special case: Deserialize Buffer instances
				if (isObject(data.payload) === true) {

					let tmp_headers = data.payload.headers || null;
					let tmp_payload = data.payload.payload || null;

					if (tmp_headers !== null && tmp_payload !== null) {

						if (tmp_payload.type === 'Buffer') {
							data.payload.payload = Buffer.from(tmp_payload.data);
						}

					}

				}


				if (callback !== null) {

					callback({
						headers: data.headers,
						payload: data.payload
					});

				} else {

					return {
						headers: data.headers,
						payload: data.payload
					};

				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	},

	send: function(connection, data) {

		connection = isConnection(connection) ? connection : null;
		data       = isObject(data)           ? data       : {};


		if (connection !== null) {

			if (connection.socket !== null) {

				let headers = null;
				let payload = null;

				if (isObject(data.headers) === true) {
					headers = data.headers;
				}

				if (isBoolean(data.payload) === true) {
					payload = data.payload;
				} else {
					payload = data.payload || null;
				}


				if (isNumber(headers['@status'])) {

					let buffer = Buffer.alloc(4);
					let code   = headers['@status'];

					buffer[0] = 128 + 0x08; // close
					buffer[1] =   0 + 0x02; // unmasked (client and server)

					buffer[1] = (code >> 8) & 0xff;
					buffer[2] = (code >> 0) & 0xff;

					connection.socket.write(buffer);

				} else {

					let headers_keys = Object.keys(headers).filter((h) => h.startsWith('@') === false);
					if (headers_keys.length > 0 || payload !== null) {

						let tmp = { headers: {}, payload: payload };
						headers_keys.forEach((key) => tmp.headers[key] = headers[key]);

						let data = encode_json(tmp);
						if (data !== null) {

							let buffer = encode(connection, data);
							if (buffer !== null) {
								connection.socket.write(buffer);
							}

						}

					}

				}

				return true;

			}

		}


		return false;

	},

	upgrade: function(socket, ref) {

		ref = isObject(ref) ? ref : { headers: {} };


		let tmp1 = (ref.headers['connection']             || '').toLowerCase();
		let tmp2 = (ref.headers['upgrade']                || '').toLowerCase();
		let tmp3 = (ref.headers['sec-websocket-protocol'] || '').toLowerCase();

		if (tmp1.includes('upgrade') && tmp2.includes('websocket') && tmp3.includes('stealth')) {

			let nonce = ref.headers['sec-websocket-key'] || null;
			if (nonce !== null) {

				socket.setTimeout(0);
				socket.setNoDelay(true);
				socket.setKeepAlive(true, 0);
				socket.allowHalfOpen = true;


				let connection = new Connection(socket);

				socket.removeAllListeners('data');
				socket.removeAllListeners('timeout');
				socket.removeAllListeners('error');
				socket.removeAllListeners('end');

				socket.on('data', (fragment) => {
					ondata(connection, ref, fragment);
				});

				socket.on('timeout', () => {

					if (connection.socket !== null) {

						connection.socket = null;
						connection.emit('timeout', [ null ]);

					}

				});

				socket.on('error', () => {

					if (connection.socket !== null) {

						ondisconnect(connection, ref);
						connection.socket = null;

					}

				});

				socket.on('end', () => {

					if (connection.socket !== null) {

						ondisconnect(connection, ref);
						connection.socket = null;

					}

				});

				onupgrade(connection, ref);

				return connection;

			}

		}


		return null;

	}

};


export { WS };

