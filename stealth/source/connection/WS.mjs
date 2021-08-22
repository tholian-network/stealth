
import crypto from 'crypto';
import net    from 'net';

import { Buffer, Emitter, isBoolean, isBuffer, isFunction, isNumber, isObject } from '../../extern/base.mjs';
import { HTTP                                                                 } from '../../source/connection/HTTP.mjs';
import { HTTP as HANDSHAKE                                                    } from '../../source/packet/HTTP.mjs';
import { WS as PACKET                                                         } from '../../source/packet/WS.mjs';
import { IP                                                                   } from '../../source/parser/IP.mjs';
import { URL                                                                  } from '../../source/parser/URL.mjs';



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

		let response = HANDSHAKE.decode(null, data);
		if (response !== null) {

			let connection_header = (response.headers['connection'] || '').toLowerCase();
			let upgrade_header    = (response.headers['upgrade'] || '').toLowerCase();

			if (connection_header.includes('upgrade') === true && upgrade_header.includes('websocket') === true) {

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

		}

	});


	let handshake_request = HANDSHAKE.encode(null, {
		headers: {
			'@method':                'GET',
			'@url':                   '/',
			'Connection':             'Upgrade',
			'Host':                   hostname + ':' + url.port,
			'Origin':                 url.link,
			'Upgrade':                'websocket',
			'Sec-WebSocket-Key':      nonce.toString('base64'),
			'Sec-WebSocket-Version':  13
		},
		payload: null
	});

	if (handshake_request !== null) {
		connection.socket.write(handshake_request);
	}

};

const ondata = function(connection, url, chunk) {

	connection.fragment = Buffer.concat([ connection.fragment, chunk ]);


	let frame = PACKET.decode(connection, connection.fragment);
	if (frame !== null) {

		url.headers = frame.headers;
		url.payload = frame.payload;

		if (frame.overflow !== null) {
			connection.fragment = frame.overflow;
		} else {
			connection.fragment = Buffer.alloc(0);
		}


		if (
			(
				frame.headers['@operator'] === 0x00
				|| frame.headers['@operator'] === 0x01
				|| frame.headers['@operator'] === 0x02
			) && frame.headers['@transfer']['length'] === Infinity
		) {

			if (frame.headers['@operator'] === 0x00) {
				connection.framestack.push(frame);
			} else if (frame.headers['@operator'] === 0x01) {
				connection.framestack = [ frame ];
			} else if (frame.headers['@operator'] === 0x02) {
				connection.framestack = [ frame ];
			}

		} else if (
			frame.headers['@operator'] === 0x00
			&& frame.headers['@transfer']['length'] !== Infinity
		) {

			let first = connection.framestack[0] || null;
			if (
				first !== null
				&& isObject(first) === true
				&& isObject(first.headers) === true
				&& first.headers['@operator'] !== 0x00
				&& isBuffer(first.payload) === true
			) {

				let headers = first.headers;
				let payload = first.payload;

				connection.framestack.push(frame);
				connection.framestack.slice(1).forEach((frame) => {

					if (isBuffer(frame.payload) === true) {
						payload = Buffer.concat([ payload, frame.payload ]);
					}

				});

				headers['@transfer']['length'] = payload.length;
				headers['@transfer']['range']  = [ 0, payload.length ];

				connection.framestack = [];

				if (connection.type === 'client') {
					connection.emit('response', [{ headers: headers, payload: payload }]);
				} else if (connection.type === 'server') {
					connection.emit('request', [{ headers: headers, payload: payload }]);
				}

			} else {

				connection.framestack = [];

			}

		} else if (
			(
				frame.headers['@operator'] === 0x01
				|| frame.headers['@operator'] === 0x02
			)
			&& frame.headers['@transfer']['length'] !== Infinity
		) {

			if (connection.type === 'client') {
				connection.emit('response', [ frame ]);
			} else if (connection.type === 'server') {
				connection.emit('request', [ frame ]);
			}

		} else if (frame.headers['@operator'] === 0x08) {

			if (connection.type === 'client') {

				if (frame.headers['@status'] === 1000) {
					connection.disconnect();
				} else if (frame.headers['@status'] === 1002) {
					connection.emit('error', [{ type: 'connection', cause: 'headers' }]);
				} else {
					connection.disconnect();
				}

			} else if (connection.type === 'server') {

				if (frame.headers['@status'] === 1000) {
					connection.disconnect();
				} else if (frame.headers['@status'] === 1002) {
					connection.emit('error', [{ type: 'connection', cause: 'headers' }]);
				} else {
					connection.disconnect();
				}

			}

		} else if (frame.headers['@operator'] === 0x09) {

			if (connection.type === 'server') {

				WS.send(connection, {
					headers: {
						'@operator': 0x0a,
						'@status':   null,
						'@type':     'response'
					},
					payload: null
				});

			}

		} else if (frame.headers['@operator'] === 0x0a) {

			// Do Nothing

		}

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

	connection.type = 'server';

	connection.socket.on('data', (fragment) => {
		ondata(connection, url, fragment);
	});


	let nonce = url.headers['sec-websocket-key'] || '';
	if (nonce !== '') {

		let hash   = crypto.createHash('sha1').update(nonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('hex');
		let accept = Buffer.from(hash, 'hex');

		let handshake_response = HANDSHAKE.encode(null, {
			headers: {
				'@status':               101,
				'Connection':            'Upgrade',
				'Upgrade':               'WebSocket',
				'Sec-WebSocket-Accept':  accept.toString('base64'),
				'Sec-WebSocket-Version': 13

			},
			payload: null
		});

		if (handshake_response !== null) {
			connection.socket.resume();
			connection.socket.write(handshake_response);
		}

	} else {

		connection.socket.resume();

	}


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
		&& (url.headers['sec-websocket-key'] || '') !== ''
	) {
		return true;
	}

	return false;

};

const Connection = function(socket) {

	socket = isSocket(socket) ? socket : null;


	this.fragment   = Buffer.alloc(0);
	this.framestack = [];
	this.interval   = null;
	this.socket     = socket;
	this.type       = null;


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

	// TODO: Rewrite ping() method into interval that uses WS.send() directly
	// without that Buffer crap
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


		if (connection !== null && buffer !== null) {

			let data = PACKET.decode(connection, buffer);
			if (data !== null) {

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
		data       = isObject(data)           ? data       : { headers: {}, payload: null };
		callback   = isFunction(callback)     ? callback   : null;


		if (connection !== null && connection.socket !== null) {

			let buffer = PACKET.encode(connection, {
				headers: data.headers || {},
				payload: data.payload || null
			});

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

					let request = HANDSHAKE.decode(null, data);
					if (isUpgrade(request) === true) {
						WS.upgrade(connection, request);
					} else {
						connection.disconnect();
					}

				});

			}

			return connection;

		}


		return null;

	}

};


export { WS };

