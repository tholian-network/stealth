
import crypto from 'crypto';
import net    from 'net';

import { Buffer, Emitter, isBuffer, isFunction, isNumber, isObject } from '../../extern/base.mjs';
import { HTTP as HANDSHAKE                                         } from '../../source/packet/HTTP.mjs';
import { WS as PACKET                                              } from '../../source/packet/WS.mjs';
import { IP                                                        } from '../../source/parser/IP.mjs';
import { URL                                                       } from '../../source/parser/URL.mjs';



const toWebSocketHash = (nonce) => {
	return Buffer.from(crypto.createHash('sha1').update(nonce.toString('base64') + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('hex'), 'hex').toString('base64');
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

	connection.type = 'client';

	connection.socket.once('data', (data) => {

		let response = HANDSHAKE.decode(null, data);
		if (response !== null) {

			let status_header     = response.headers['@status'] || 400;
			let connection_header = (response.headers['connection'] || '').toLowerCase();
			let upgrade_header    = (response.headers['upgrade'] || '').toLowerCase();

			if (status_header === 101 && connection_header.includes('upgrade') === true && upgrade_header.includes('websocket') === true) {

				let accept = response.headers['sec-websocket-accept'] || '';
				let expect = toWebSocketHash(nonce);

				if (accept === expect) {

					connection.interval = setInterval(() => {

						WS.send(connection, {
							headers: {
								'@operator': 0x09,
								'@type':     'request'
							},
							payload: null
						});

					}, 60000);

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


	let handshake_request = HANDSHAKE.encode(connection, {
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
				connection.emit('response', [{ headers: frame.headers, payload: frame.payload }]);
			} else if (connection.type === 'server') {
				connection.emit('request', [{ headers: frame.headers, payload: frame.payload }]);
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


		// XXX: Client sent more than a single Websocket frame
		if (connection.fragment.length > 0) {
			ondata(connection, url, Buffer.alloc(0));
		}

	}

};

const ondisconnect = function(connection /*, url */) {

	let fragment = connection.fragment;
	if (fragment.length > 0) {
		connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
	}


	connection.disconnect();

};

const onupgrade = function(connection, url) {

	connection.type = 'server';

	connection.socket.on('data', (fragment) => {
		ondata(connection, url, fragment);
	});


	let key = url.headers['sec-websocket-key'] || '';
	if (key !== '') {

		let nonce    = Buffer.from(key, 'base64');
		let accept   = toWebSocketHash(nonce);
		let response = {
			headers: {
				'@status':               101,
				'Connection':            'Upgrade',
				'Upgrade':               'WebSocket',
				'Sec-WebSocket-Accept':  accept,
				'Sec-WebSocket-Version': 13
			},
			payload: null
		};

		if (url.headers['sec-websocket-protocol'] === 'stealth') {
			response.headers['Sec-WebSocket-Protocol'] = 'stealth';
		}

		let buffer = HANDSHAKE.encode(null, response);
		if (buffer !== null) {
			connection.socket.resume();
			connection.socket.write(buffer);
		} else {
			connection.emit('error', [{ type: 'connection' }]);
		}

	} else {

		connection.emit('error', [{ type: 'connection', cause: 'headers' }]);

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

			let local = {
				host: IP.parse(this.socket.localAddress),
				port: this.socket.localPort
			};

			if (
				IP.isIP(local.host) === true
				&& isNumber(local.port) === true
			) {
				data.local = local;
			}

			let remote = {
				host: IP.parse(this.socket.remoteAddress),
				port: this.socket.remotePort
			};

			if (
				IP.isIP(remote.host) === true
				&& isNumber(remote.port) === true
			) {
				data.remote = remote;
			}

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

					connection.socket.on('error', (err) => {

						if (connection.socket !== null) {

							let code  = (err.code || '');
							let error = { type: 'connection' };

							if (code === 'ECONNREFUSED') {
								error = { type: 'connection', cause: 'socket-stability' };
							}

							connection.emit('error', [ error ]);

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

			if (connection.type === 'client') {

				WS.send(connection, {
					headers: {
						'@operator': 0x08,
						'@status':   1000,
						'@type':     'request'
					},
					payload: null
				}, () => {
					connection.disconnect();
				});

			} else if (connection.type === 'server') {

				WS.send(connection, {
					headers: {
						'@operator': 0x08,
						'@status':   1000,
						'@type':     'response'
					},
					payload: null
				}, () => {
					connection.disconnect();
				});

			} else {

				connection.disconnect();

			}


			return true;

		}


		return false;

	},

	receive: function(connection, buffer, callback) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;
		callback   = isFunction(callback)     ? callback   : null;


		if (buffer !== null) {

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

