
import net from 'net';

import { Buffer, Emitter, isArray, isBoolean, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { HTTP                                                                          } from './HTTP.mjs';
import { HTTPS                                                                         } from './HTTPS.mjs';
import { WS                                                                            } from './WS.mjs';
import { WSS                                                                           } from './WSS.mjs';
import { IP                                                                            } from '../parser/IP.mjs';
import { URL                                                                           } from '../parser/URL.mjs';



const ERRORS = [
	'error',
	'error-blocked',
	'error-connection',
	'error-host',
	'error-method',
	'error-network'
];

const upgrade_request = (connection) => {

	return encode(connection, {
		headers: {
			'auth': [ 'none' ]
		},
		payload: null
	});

};

const upgrade_response = (connection) => {

	return encode(connection, {
		headers: {
			'auth': 'none'
		}
	});

};

const encode_payload = function(ref) {

	if (URL.isURL(ref) === true) {

		if (IP.isIP(ref.hosts[0]) === true) {

			let data = [];
			let host = ref.hosts.sort((a, b) => {

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

			})[0];

			if (host.type === 'v4') {

				data.push(0x01);
				host.ip.split('.').forEach((v) => {
					data.push(parseInt(v, 10));
				});

			} else if (host.type === 'v6') {

				data.push(0x04);
				host.ip.split(':').forEach((v) => {
					data.push(parseInt(v.substr(0, 2), 16));
					data.push(parseInt(v.substr(2, 2), 16));
				});

			}

			data.push(ref.port >>> 8);
			data.push(ref.port & 0xff);

			return data;

		} else if (ref.domain !== null) {

			let data = [];

			if (ref.subdomain !== null) {

				let tmp = Buffer.from(ref.subdomain + '.' + ref.domain, 'utf8');

				data.push(tmp.length);
				tmp.forEach((v) => {
					data.push(v);
				});

			} else {

				let tmp = Buffer.from(ref.domain, 'utf8');

				data.push(tmp.length);
				tmp.forEach((v) => {
					data.push(v);
				});

			}

			data.push(ref.port >>> 8);
			data.push(ref.port & 0xff);

			return data;

		}

	}


	return null;

};

const encode = function(connection, data) {

	data = isObject(data) ? data : { headers: {}, payload: null };


	if (isObject(data.headers) === false) {
		data.headers = {};
	}

	if (URL.isURL(data.payload) === false) {
		data.payload = URL.parse('0.0.0.0:0');
	}


	let blob = [ 0x05 ];

	if (data.headers['@version'] === 5) {
		blob[0] = 0x05;
	} else if (data.headers['@version'] === 4) {
		blob[0] = 0x04;
	}

	if (connection.type === 'server') {

		if (isString(data.headers['auth']) === true) {

			if (data.headers['auth'] === 'none') {
				blob[1] = 0x00;
			} else if (data.headers['auth'] === 'login') {
				blob[1] = 0x02;
			} else {
				blob[1] = 0xff;
			}

		} else if (isString(data.headers['@status']) === true) {

			if (data.headers['@status'] === 'success') {
				blob[1] = 0x00;
			} else if (data.headers['@status'] === 'error-blocked') {
				blob[1] = 0x02;
			} else if (data.headers['@status'] === 'error-network') {
				blob[1] = 0x03;
			} else if (data.headers['@status'] === 'error-host') {
				blob[1] = 0x04;
			} else if (data.headers['@status'] === 'error-connection') {
				blob[1] = 0x05;
			} else if (data.headers['@status'] === 'error-method') {
				blob[1] = 0x07;
			} else if (data.headers['@status'] === 'error') {
				blob[1] = 0x01;
			}

			let payload = encode_payload(data.payload);
			if (payload !== null) {
				payload.forEach((v) => {
					blob.push(v);
				});
			}

		}

	} else if (connection.type === 'client') {

		if (isArray(data.headers['auth']) === true) {

			let methods = data.headers['auth'].map((v) => {

				if (v === 'none') {
					return 0x00;
				} else if (v === 'login') {
					return 0x02;
				}

				return null;

			}).filter((method) => method !== null);
			let length = methods.length;

			blob[1] = length;
			methods.forEach((v) => {
				blob.push(v);
			});

		} else if (data.headers['@method'] === 'connect') {

			blob[1] = 0x01;
			blob[2] = 0x00;

			let payload = encode_payload(data.payload);
			if (payload !== null) {
				payload.forEach((v) => {
					blob.push(v);
				});
			}

		}

	}


	if (blob.length > 1) {
		return Buffer.from(blob);
	}


	return null;

};

const decode_payload = function(buffer) {

	let payload = null;

	let type = buffer[0];
	if (type === 0x01) {

		let raw_host = buffer.slice(1, 5);
		let raw_port = buffer.slice(5, 7);

		if (raw_host.length === 4 && raw_port.length === 2) {

			let ip = IP.parse([
				raw_host[0],
				raw_host[1],
				raw_host[2],
				raw_host[3]
			].join('.'));
			let port = (raw_port[0] << 8) + (raw_port[1] & 0xff);

			if (IP.isIP(ip) === true && port > 0 && port < 65535) {
				payload = URL.parse(ip.ip + ':' + port);
			}

		}

	} else if (type === 0x03) {

		let length     = buffer[1];
		let raw_domain = buffer.slice(1, 1 + length);
		let raw_port   = buffer.slice(1 + length, 1 + length + 2);

		if (raw_domain.length > 0 && raw_port.length === 2) {

			let domain = Buffer.from(raw_domain).toString('utf8');
			let port   = (raw_port[0] << 8) + (raw_port[1] & 0xff);
			if (domain.length > 0 && port > 0 && port < 65535) {
				payload = URL.parse(domain + ':' + port);
			}

		}

	} else if (type === 0x04) {

		let raw_host = buffer.slice(1, 17);
		let raw_port = buffer.slice(17, 19);

		if (raw_host.length === 16 && raw_port.length === 2) {

			let ip = IP.parse([
				raw_host.slice( 0,  2).toString('hex'),
				raw_host.slice( 2,  4).toString('hex'),
				raw_host.slice( 4,  6).toString('hex'),
				raw_host.slice( 6,  8).toString('hex'),
				raw_host.slice( 8, 10).toString('hex'),
				raw_host.slice(10, 12).toString('hex'),
				raw_host.slice(12, 14).toString('hex'),
				raw_host.slice(14, 16).toString('hex')
			].join(':'));
			let port = (raw_port[0] << 8) + (raw_port[1] & 0xff);

			if (IP.isIP(ip) === true && port > 0 && port < 65535) {
				payload = URL.parse('[' + ip.ip + ']:' + port);
			}

		}

	}

	return payload;

};

const decode = function(connection, buffer) {

	let chunk = {
		headers: {},
		payload: null
	};


	if (buffer[0] === 0x05) {
		chunk.headers['@version'] = 5;
	} else if (buffer[0] === 0x04) {
		chunk.headers['@version'] = 4;
	}


	if (connection.type === 'server') {

		if (buffer.length === 3) {

			let length  = buffer[1];
			let methods = buffer.slice(2, 2 + length);

			if (methods.length === length) {

				chunk.headers['auth'] = methods.map((v) => {

					if (v === 0x00) {
						return 'none';
					} else if (v === 0x02) {
						return 'login';
					} else if (v === 0xff) {
						return 'error';
					}

					return null;

				}).filter((method) => method !== null);

			}

		} else if (buffer.length > 3) {

			let method = buffer[1];
			if (method === 0x01) {
				chunk.headers['@method'] = 'connect';
			} else if (method === 0x02) {
				chunk.headers['@method'] = 'bind';
			}

			let payload = decode_payload(buffer.slice(3));
			if (payload !== null) {
				chunk.payload = payload;
			}

		}

	} else if (connection.type === 'client') {

		if (buffer.length === 2) {

			let auth = buffer[1];
			if (auth === 0x00) {
				chunk.headers['auth'] = 'none';
			} else if (auth === 0x02) {
				chunk.headers['auth'] = 'login';
			} else if (auth === 0xff) {
				chunk.headers['auth'] = 'error';
			}

		} else if (buffer.length > 2) {

			let reply = buffer[1];
			if (reply === 0x00) {
				chunk.headers['@status'] = 'success';
			} else if (reply === 0x01) {
				chunk.headers['@status'] = 'error';
			} else if (reply === 0x02) {
				chunk.headers['@status'] = 'error-blocked';
			} else if (reply === 0x03) {
				chunk.headers['@status'] = 'error-network';
			} else if (reply === 0x04) {
				chunk.headers['@status'] = 'error-host';
			} else if (reply === 0x05) {
				chunk.headers['@status'] = 'error-connection';
			} else if (reply === 0x07) {
				chunk.headers['@status'] = 'error-method';
			}

			if (buffer.length > 3) {

				let payload = decode_payload(buffer.slice(3));
				if (payload !== null) {
					chunk.payload = payload;
				}

			}

		}

	}


	return chunk;

};

const onconnect = function(connection, ref) {

	connection.socket.once('data', (data) => {

		SOCKS.receive(connection, data, (response) => {

			if (response.headers['@version'] === 5 && response.headers['auth'] === 'none') {

				connection.socket.once('data', (data) => {

					SOCKS.receive(connection, data, (response) => {

						if (response.headers['@status'] === 'success') {
							connection.emit('@tunnel', [ response ]);
						} else if (response.headers['@status'] === 'error-blocked') {
							connection.emit('error', [{ code: 403 }]);
						} else if (response.headers['@status'] === 'error-network' || response.headers['@status'] === 'error-host') {
							connection.emit('timeout', [ null ]);
						} else {
							connection.emit('error', [{ type: 'request', cause: 'socket-stability' }]);
						}

					});

				});

				SOCKS.send(connection, {
					headers: {
						'@method': 'connect'
					},
					payload: ref
				});

			} else {
				connection.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
			}

		});

	});

	connection.type = 'client';
	connection.socket.write(upgrade_request(
		connection
	));

};

const ondata = function(connection, ref, chunk) {

	if (connection.protocol === 'socks') {

		if (connection.type === 'client') {

			SOCKS.receive(connection, chunk, (frame) => {

				if (frame !== null) {
					connection.emit('response', [ frame ]);
				}

			});

		} else if (connection.type === 'server') {

			SOCKS.receive(connection, chunk, (frame) => {

				if (frame !== null) {
					connection.emit('request', [ frame ]);
				}

			});

		}

	}

};

const ondisconnect = function(connection) {

	connection.emit('@disconnect');

};

const onupgrade = function(connection /*, ref */) {

	connection.socket.once('data', (data) => {

		SOCKS.receive(connection, data, (response) => {

			if (response.headers['@method'] === 'connect' && URL.isURL(response.payload) === true) {

				if (connection.has('request') === true) {

					connection.emit('request', [ response, (status, reply) => {

						status = isString(status) ? status : null;
						reply  = URL.isURL(reply) ? reply  : null;


						if (status === 'success') {

							SOCKS.send({
								headers: {
									'@status': 'success'
								},
								payload: reply
							});

						} else if (status !== null && ERRORS.includes(status) === true) {

							SOCKS.send({
								headers: {
									'@status': status
								},
								payload: null
							});

						} else {

							SOCKS.send({
								headers: {
									'@status': 'error'
								},
								payload: null
							});

						}

					}]);

				} else {

					SOCKS.send({
						headers: {
							'@status': 'error-blocked'
						},
						payload: null
					});

				}

				// TODO: SOCKS Proxy should connect to host or domain
				// And if forbidden, correctly reply. But how to implement this correctly,
				// so that it can be implemented by the Server and not here!?

			} else {

				SOCKS.send({
					headers: {
						'@status': 'error'
					},
					payload: null
				});

			}

		});

	});

	// TODO: Reflect network flow correctly like onconnect() does
	// this method already sends upgrade_response()
	// -> next request is client's connect request
	// -> next response is server's result after connecting
	// -> afterwards, fire @tunnel event


	connection.type = 'server';
	connection.socket.resume();
	connection.socket.write(upgrade_response(
		connection
	));

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const Connection = function(socket) {

	this.socket   = socket || null;
	this.protocol = 'socks';
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

		if (this.socket !== null) {
			this.socket.destroy();
		}

		this.emit('@disconnect');

	}

});



const SOCKS = {

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

			if (hosts.length > 0 && hosts[0].scope === 'public') {

				let proxy = ref.proxy || null;
				if (proxy === null) {

					proxy = { host: null, port: null };

					if (ref.protocol === 'socks') {
						proxy.host   = '127.0.0.1';
						proxy.port   = ref.port || null;
						ref.port     = 443;
						ref.protocol = 'https';
					} else {
						proxy.host   = '127.0.0.1';
						proxy.port   = 1080;
					}

				}


				let socket = connection.socket || null;
				if (socket === null) {

					try {

						socket = net.connect({
							host: proxy.host || '127.0.0.1',
							port: proxy.port || 1080
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

					// This is wrong, onconnect() reflects the network
					// flow for connection.type = 'client'
					// socket.on('data', (fragment) => {
					// 	ondata(connection, ref, fragment);
					// });

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

					connection.once('@tunnel', () => {

						if (ref.protocol === 'https') {
							connection.protocol = 'https';
							HTTPS.connect(ref, connection);
						} else if (ref.protocol === 'http') {
							connection.protocol = 'http';
							HTTP.connect(ref, connection);
						} else if (ref.protocol === 'wss') {
							connection.protocol = 'wss';
							WSS.connect(ref, connection);
						} else if (ref.protocol === 'ws') {
							connection.protocol = 'ws';
							WS.connect(ref, connection);
						}

					});

					return connection;

				} else {

					connection.socket = null;
					connection.emit('error', [{ type: 'request' }]);

					return null;

				}

			} else if (hosts.length > 0 && hosts[0].scope === 'private') {

				if (ref.protocol === 'https') {
					return HTTPS.connect(ref, connection);
				} else if (ref.protocol === 'http') {
					return HTTP.connect(ref, connection);
				} else if (ref.protocol === 'wss') {
					return WSS.connect(ref, connection);
				} else if (ref.protocol === 'ws') {
					return WS.connect(ref, connection);
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
			return connection.disconnect();
		}


		return false;

	},

	receive: function(connection, buffer, callback) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;
		callback   = isFunction(callback)     ? callback   : null;


		if (connection !== null && buffer !== null) {

			if (connection.protocol === 'socks') {

				let data = decode(connection, buffer);

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

			} else if (connection.protocol === 'https') {

				return HTTPS.receive(connection, buffer, callback);

			} else if (connection.protocol === 'http') {

				return HTTP.receive(connection, buffer, callback);

			} else if (connection.protocol === 'wss') {

				return WSS.receive(connection, buffer, callback);

			} else if (connection.protocol === 'ws') {

				return WS.receive(connection, buffer, callback);

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

	send: function(connection, data) {

		connection = isConnection(connection) ? connection : null;
		data       = isObject(data)           ? data       : {};


		if (connection !== null) {

			if (connection.protocol === 'socks') {

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


					let headers_keys = Object.keys(headers);
					if (headers_keys.length > 0 || payload !== null) {

						let buffer = encode(connection, data);
						if (buffer !== null) {
							connection.socket.write(buffer);
						}

					}

					return true;

				}

			} else if (connection.protocol === 'https') {

				return HTTPS.send(connection, data);

			} else if (connection.protocol === 'http') {

				return HTTP.send(connection, data);

			} else if (connection.protocol === 'wss') {

				return WSS.send(connection, data);

			} else if (connection.protocol === 'ws') {

				return WS.send(connection, data);

			}

		}


		return false;

	},

	upgrade: function(socket, ref) {

		ref = isObject(ref) ? ref : { headers: {} };


		let auth = ref.headers['auth'] || [];
		if (auth.includes('none')) {

			socket.setTimeout(0);
			socket.setNoDelay(true);
			socket.setKeepAlive(true, 0);
			socket.allowHalfOpen = true;


			let connection = new Connection(socket);

			socket.removeAllListeners('data');
			socket.removeAllListeners('timeout');
			socket.removeAllListeners('error');
			socket.removeAllListeners('end');

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


		return null;

	}

};


export { SOCKS };

