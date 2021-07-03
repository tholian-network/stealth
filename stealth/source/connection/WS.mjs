
import crypto from 'crypto';
import net    from 'net';

import { console, Buffer, Emitter, isBoolean, isBuffer, isFunction, isNumber, isObject } from '../../extern/base.mjs';
import { HTTP                                                                 } from '../../source/connection/HTTP.mjs';
import { IP                                                                   } from '../../source/parser/IP.mjs';
import { URL                                                                  } from '../../source/parser/URL.mjs';



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

const decode = function(connection, buffer) {

	if (buffer.length < 2) {
		return null;
	}


	let chunk = {
		headers: {
			'@transfer': {
				'encoding': null,
				'length':   null
			}
		},
		payload: null
	};


	let msg_headers      = null;
	let msg_payload      = null;
	let payload_complete = false;


	let fin      = (buffer[0] & 128) === 128;
	let operator = (buffer[0] &  15);
	let mask     = (buffer[1] & 128) === 128;

	// TODO: encoding can be utf8 (text frame) or binary (binary frame)




	if (buffer.length <= 2) {
		return null;
	}

	console.log('decode()');

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

	console.log(fin, operator, mask, payload_length);

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

		console.log(payload_data.toString('utf8'));

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


	console.log(chunk);

	return chunk;

};

const encode = function(connection, data) {

	if (Object.keys(data.headers).length === 0) {
		return null;
	}


	let buffer = null;

	if (isNumber(data.headers['@status']) === true) {

		buffer = Buffer.from([
			128 + 0x08, // close
			0   + 0x02, // unmasked (client and server)
			(data.headers['@status'] >> 8) & 0xff,
			(data.headers['@status'] >> 0) & 0xff
		]);

	} else {

		let is_masked   = false;
		let msg_mask    = Buffer.alloc(4);
		let msg_payload = Buffer.alloc(0);


		if (connection.type === 'client') {

			is_masked   = true;
			msg_mask    = Buffer.alloc(4);
			msg_mask[0] = (Math.random() * 0xff) | 0;
			msg_mask[1] = (Math.random() * 0xff) | 0;
			msg_mask[2] = (Math.random() * 0xff) | 0;
			msg_mask[3] = (Math.random() * 0xff) | 0;


			let payload = null;

			try {
				payload = Buffer.from(JSON.stringify(data, null, '\t'), 'utf8');
			} catch (err) {
				payload = null;
			}

			if (isBuffer(payload) === true) {
				msg_payload = payload.map((value, index) => value ^ msg_mask[index % 4]);
			}

		} else if (connection.type === 'server') {

			is_masked   = false;
			msg_mask    = Buffer.alloc(4);


			let payload = null;

			try {
				payload = Buffer.from(JSON.stringify(data, null, '\t'), 'utf8');
			} catch (err) {
				payload = null;
			}

			if (isBuffer(payload) === true) {
				msg_payload = payload.map((value) => value);
			}

		}


		if (msg_payload.length > 0xffff) {

			// 64 Bit Extended Payload Length

			let lo = (msg_payload.length |  0);
			let hi = (msg_payload.length - lo) / 4294967296;

			buffer = Buffer.alloc((is_masked === true ? 14 : 10) + msg_payload.length);

			buffer[0] = 128 + 0x01;
			buffer[1] = (is_masked === true ? 128 : 0) + 127;
			buffer[2] = (hi >> 24) & 0xff;
			buffer[3] = (hi >> 16) & 0xff;
			buffer[4] = (hi >>  8) & 0xff;
			buffer[5] = (hi >>  0) & 0xff;
			buffer[6] = (lo >> 24) & 0xff;
			buffer[7] = (lo >> 16) & 0xff;
			buffer[8] = (lo >>  8) & 0xff;
			buffer[9] = (lo >>  0) & 0xff;

			if (is_masked === true) {

				msg_mask.copy(buffer, 10);
				msg_payload.copy(buffer, 14);

			} else {

				msg_payload.copy(buffer, 10);

			}

		} else if (msg_payload.length > 125) {

			// 16 Bit Extended Payload Length

			buffer = Buffer.alloc((is_masked === true ? 8 : 4) + msg_payload.length);

			buffer[0] = 128 + 0x01;
			buffer[1] = (is_masked === true ? 128 : 0) + 126;
			buffer[2] = (msg_payload.length >> 8) & 0xff;
			buffer[3] = (msg_payload.length >> 0) & 0xff;

			if (is_masked === true) {

				msg_mask.copy(buffer, 4);
				msg_payload.copy(buffer, 8);

			} else {

				msg_payload.copy(buffer, 4);

			}

		} else {

			// 7 Bit Payload Length

			buffer = Buffer.alloc((is_masked === true ? 6 : 2) + msg_payload.length);

			buffer[0] = 128 + 0x01;
			buffer[1] = (is_masked === true ? 128 : 0) + msg_payload.length;

			if (is_masked === true) {

				msg_mask.copy(buffer, 2);
				msg_payload.copy(buffer, 6);

			} else {

				msg_payload.copy(buffer, 2);

			}

		}

	}


	return buffer;

};



const onconnect = function(connection, url) {

	let hosts    = IP.sort(url.hosts);
	let hostname = hosts[0].ip;
	let domain   = URL.toDomain(url);
	let host     = URL.toHost(url);

	if (domain !== null) {
		hostname = domain;
	} else if (host !== null) {
		hostname = host;
	}

	let nonce = Buffer.alloc(16);

	for (let n = 0; n < 16; n++) {
		nonce[n] = Math.round(Math.random() * 0xff);
	}


	connection.socket.once('data', (data) => {

		HTTP.receive(connection, data, (response) => {

			let tmp1 = (response.headers['connection'] || '').toLowerCase();
			let tmp2 = (response.headers['upgrade'] || '').toLowerCase();

			if (tmp1.includes('upgrade') === true && tmp2.includes('websocket') === true) {

				let accept = response.headers['sec-websocket-accept'] || '';
				let hash   = crypto.createHash('sha1').update(nonce.toString('base64') + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('hex');
				let expect = Buffer.from(hash, 'hex').toString('base64');

				if (accept === expect) {

					connection.type     = 'client';
					connection.interval = setInterval(() => connection.ping(), 60000);
					connection.socket.on('data', (fragment) => {
						ondata(connection, url, fragment);
					});

					connection.emit('@connect');

				} else {
					connection.emit('error', [{ type: 'connection', cause: 'socket-trust' }]);
				}

			} else {
				connection.emit('error', [{ type: 'connection' }]);
			}

		});

	});


	connection.socket.write(upgrade_request(
		hostname,
		url.port || 80,
		nonce
	));

};

const ondata = function(connection, url, chunk) {

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

const ondisconnect = function(connection /*, url */) {

	let fragment = connection.fragment;
	if (fragment.payload.length > 0) {
		connection.emit('error', [{ type: 'connection' }]);
	}


	connection.disconnect();

};

const onupgrade = function(connection, url) {

	let nonce = url.headers['sec-websocket-key'] || '';

	connection.type = 'server';

	connection.socket.on('data', (fragment) => {
		ondata(connection, url, fragment);
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

const isUpgrade = function(url) {

	if (
		isObject(url) === true
		&& isObject(url.headers) === true
		&& (url.headers['connection'] || '').toLowerCase().includes('upgrade') === true
		&& (url.headers['upgrade'] || '').toLowerCase().includes('websocket') === true
		&& (url.headers['sec-websocket-protocol'] || '').includes('stealth') === true
		&& (url.headers['sec-websocket-key'] || '') !== ''
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

			Object.keys(connection).forEach((property) => {

				if (
					json[property] === undefined
					|| json[property] === null
				) {
					json[property] = connection[property];
				}

			});

			return json;

		}

	}


	return null;

};


Connection.isConnection = isConnection;


Connection.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Connection',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			local:   null,
			remote:  null,
			events:  blob.data.events,
			journal: blob.data.journal
		};

		if (this.socket !== null) {
			data.local  = this.socket.localAddress  + ':' + this.socket.localPort;
			data.remote = this.socket.remoteAddress + ':' + this.socket.remotePort;
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

			this.socket.removeAllListeners('data');
			this.socket.removeAllListeners('timeout');
			this.socket.removeAllListeners('error');
			this.socket.removeAllListeners('end');

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

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0) {

				if (connection.socket === null) {

					try {

						connection.socket = net.connect({
							host:          hosts[0].ip,
							port:          url.port || 80,
							allowHalfOpen: true
						}, () => {

							connection.socket.setNoDelay(true);
							connection.socket.setKeepAlive(true, 0);
							connection.socket.allowHalfOpen = true;

							onconnect(connection, url);

						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					connection.socket.setNoDelay(true);
					connection.socket.setKeepAlive(true, 0);
					connection.socket.allowHalfOpen = true;

					setTimeout(() => {
						onconnect(connection, url);
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

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					connection.socket.on('end', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					return connection;

				} else {

					connection.socket = null;
					connection.emit('error', [{ type: 'connection' }]);

					return null;

				}

			} else {

				connection.socket = null;
				connection.emit('error', [{ type: 'host' }]);

				return null;

			}

		} else {

			connection.socket = null;
			connection.emit('error', [{ type: 'connection' }]);

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

						// Special case: Network gave us multiple Buffers
						if (data.overflow !== null) {
							WS.receive(connection, data.overflow, callback);
						}

					} else {

						// Special case: Network gave us multiple Buffers
						if (data.overflow !== null) {
							WS.receive(connection, data.overflow);
						}

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

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	},

	send: function(connection, data, callback) {

		connection = isConnection(connection) ? connection : null;
		data       = isObject(data)           ? data       : {};
		callback   = isFunction(callback)     ? callback   : null;


		if (connection !== null && connection.socket !== null) {

			let buffer  = null;
			let headers = {};
			let payload = null;

			if (isObject(data.headers) === true) {
				headers = data.headers;
			}

			if (isBoolean(data.payload) === true) {
				payload = data.payload;
			} else if (isBuffer(data.payload) === true) {
				payload = data.payload;
			} else if (isObject(data.payload) === true) {
				payload = Buffer.from(JSON.stringify(payload, null, '\t'), 'utf8');
			}


			if (headers !== null) {

				buffer = encode(connection, {
					headers: headers,
					payload: payload
				});

			}


			if (buffer !== null) {

				if (connection.type === 'client') {
					connection.socket.write(buffer);
				} else if (connection.type === 'server') {
					connection.socket.write(buffer);
				}

				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	upgrade: function(tunnel, url) {

		url = isUpgrade(url) ? Object.assign(URL.parse(), url) : null;


		let connection = null;

		if (isSocket(tunnel) === true) {
			connection = new Connection(tunnel);
		} else if (isConnection(tunnel) === true) {
			connection = Connection.from(tunnel);
		}


		if (connection !== null) {

			if (url !== null) {

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

						ondisconnect(connection, url);
						connection.socket = null;

					}

				});

				connection.socket.on('end', () => {

					if (connection.socket !== null) {

						ondisconnect(connection, url);
						connection.socket = null;

					}

				});

				onupgrade(connection, url);

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

