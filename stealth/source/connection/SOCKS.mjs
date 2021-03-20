
import net from 'net';

import { Buffer, Emitter, isArray, isBoolean, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { HTTP                                                                                    } from '../../source/connection/HTTP.mjs';
import { HTTPS                                                                                   } from '../../source/connection/HTTPS.mjs';
import { WS                                                                                      } from '../../source/connection/WS.mjs';
import { WSS                                                                                     } from '../../source/connection/WSS.mjs';
import { IP                                                                                      } from '../../source/parser/IP.mjs';
import { URL                                                                                     } from '../../source/parser/URL.mjs';



const isPayload = function(payload) {

	if (
		isObject(payload) === true
		&& (isString(payload.domain) === true || isString(payload.host) === true)
		&& isNumber(payload.port) === true
		&& isArray(payload.hosts) === true
	) {

		let check = payload.hosts.filter((ip) => IP.isIP(ip) === true);
		if (check.length === payload.hosts.length) {
			return true;
		}

	}


	return false;

};

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

const encode_payload = function(payload) {

	payload = isPayload(payload) ? payload : null;


	if (payload !== null) {

		if (IP.isIP(payload.hosts[0]) === true) {

			let data = [];
			let host = IP.sort(payload.hosts)[0];
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

			data.push(payload.port >>> 8);
			data.push(payload.port & 0xff);

			return data;

		} else if (payload.domain !== null) {

			let data = [];

			if (payload.subdomain !== null) {

				let tmp = Buffer.from(payload.subdomain + '.' + payload.domain, 'utf8');

				data.push(0x03);
				data.push(tmp.length);
				tmp.forEach((v) => {
					data.push(v);
				});

			} else {

				let tmp = Buffer.from(payload.domain, 'utf8');

				data.push(0x03);
				data.push(tmp.length);
				tmp.forEach((v) => {
					data.push(v);
				});

			}

			data.push(payload.port >>> 8);
			data.push(payload.port & 0xff);

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

	if (isPayload(data.payload) === false) {
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
		let raw_domain = buffer.slice(2, 2 + length);
		let raw_port   = buffer.slice(2 + length, 2 + length + 2);

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

				chunk.headers['auth'] = Array.from(methods).map((v) => {

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

const onconnect = function(connection, url) {

	connection.socket.once('data', (data) => {

		SOCKS.receive(connection, data, (response) => {

			if (response.headers['@version'] === 5 && response.headers['auth'] === 'none') {

				connection.socket.once('data', (data) => {

					SOCKS.receive(connection, data, (response) => {

						if (response.headers['@status'] === 'success') {

							let protocol = null;
							let tunnel   = null;

							try {

								if (url.protocol === 'https') {
									protocol = 'https';
									tunnel   = HTTPS.connect(url, connection);
								} else if (url.protocol === 'http') {
									protocol = 'http';
									tunnel   = HTTP.connect(url, connection);
								} else if (url.protocol === 'wss') {
									protocol = 'wss';
									tunnel   = WSS.connect(url, connection);
								} else if (url.protocol === 'ws') {
									protocol = 'ws';
									tunnel   = WS.connect(url, connection);
								}

							} catch (err) {
								protocol = null;
								tunnel   = null;
							}

							setTimeout(() => {

								if (protocol !== null && tunnel !== null) {

									connection.protocol = protocol;
									connection.tunnel   = tunnel;

									connection.emit('@tunnel', [ tunnel ]);

								} else {

									connection.protocol = null;
									connection.tunnel   = null;

									connection.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);

								}

							}, 100);

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
					payload: url
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

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const ondata = function(connection, url, chunk) {

	if (connection.protocol === 'socks') {

		if (connection.type === 'client') {

			SOCKS.receive(connection, chunk, (frame) => {

				if (frame !== null) {
					connection.emit('response', [ frame, connection.protocol ]);
				}

			});

		} else if (connection.type === 'server') {

			SOCKS.receive(connection, chunk, (frame) => {

				if (frame !== null) {
					connection.emit('request', [ frame, connection.protocol ]);
				}

			});

		}

	}

};

const ondisconnect = function(connection) {

	connection.disconnect();

};

const onupgrade = function(connection, url) {

	connection.socket.once('data', (data) => {

		SOCKS.receive(connection, data, (response) => {

			if (response.headers['@method'] === 'connect' && isPayload(response.payload) === true) {

				if (connection.has('@connect-tunnel') === true) {

					connection.emit('@connect-tunnel', [ response, (status, reply, socket) => {

						status = isString(status) ? status : null;
						reply  = isPayload(reply) ? reply  : null;
						socket = isSocket(socket) ? socket : null;


						if (connection.socket !== null) {

							if (status === 'success') {

								SOCKS.send(connection, {
									headers: {
										'@status': 'success'
									},
									payload: reply
								});

								if (socket !== null) {

									socket.pipe(connection.socket);
									connection.socket.pipe(socket);

								} else {

									connection.socket.on('data', (fragment) => {
										ondata(connection, url, fragment);
									});

								}

								setTimeout(() => {
									connection.emit('@tunnel', [ null ]);
								}, 0);

							} else if (status !== null && ERRORS.includes(status) === true) {

								SOCKS.send(connection, {
									headers: {
										'@status': status
									},
									payload: null
								});

								setTimeout(() => {
									connection.disconnect();
								}, 0);

							} else {

								SOCKS.send(connection, {
									headers: {
										'@status': 'error'
									},
									payload: null
								});

								setTimeout(() => {
									connection.disconnect();
								}, 0);

							}

						} else {

							setTimeout(() => {
								connection.disconnect();
							}, 0);

						}

					}]);

				} else {

					SOCKS.send(connection, {
						headers: {
							'@status': 'success'
						},
						payload: URL.parse('127.0.0.1:65432')
					});

					connection.socket.on('data', (fragment) => {
						ondata(connection, url, fragment);
					});

					setTimeout(() => {
						connection.emit('@tunnel', [ null ]);
					}, 0);

				}

			} else {

				SOCKS.send(connection, {
					headers: {
						'@status': 'error-method'
					},
					payload: null
				});

				setTimeout(() => {
					connection.disconnect();
				}, 0);

			}

		});

	});


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
		&& (url.headers['auth'] || []).includes('none') === true
	) {
		return true;
	}

	return false;

};

const Connection = function(socket) {

	this.socket   = socket || null;
	this.protocol = 'socks';
	this.tunnel   = null;
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



const SOCKS = {

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0 && hosts[0].scope === 'public') {

				let proxy = url.proxy || null;
				if (proxy === null) {

					proxy = { host: null, port: null };

					if (url.protocol === 'socks') {
						proxy.host   = '127.0.0.1';
						proxy.port   = url.port || 1080;
						url.port     = 443;
						url.protocol = 'https';
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
							onconnect(connection, url);

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
						onconnect(connection, url);
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
					// 	ondata(connection, url, fragment);
					// });

					socket.on('timeout', () => {

						if (connection.socket !== null) {

							connection.socket = null;
							connection.emit('timeout', [ null ]);

						}

					});

					socket.on('error', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					socket.on('end', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					return connection;

				} else {

					connection.socket = null;
					connection.emit('error', [{ type: 'request' }]);

					return null;

				}

			} else if (hosts.length > 0 && hosts[0].scope === 'private') {

				if (url.protocol === 'https') {
					return HTTPS.connect(url, connection);
				} else if (url.protocol === 'http') {
					return HTTP.connect(url, connection);
				} else if (url.protocol === 'wss') {
					return WSS.connect(url, connection);
				} else if (url.protocol === 'ws') {
					return WS.connect(url, connection);
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


		if (connection !== null && buffer !== null) {

			if (connection.protocol === 'socks') {

				let data = decode(connection, buffer);

				if (callback !== null) {

					callback({
						headers: data.headers,
						payload: data.payload
					});

				}

			} else if (connection.protocol === 'https') {

				HTTPS.receive(connection, buffer, callback);

			} else if (connection.protocol === 'http') {

				HTTP.receive(connection, buffer, callback);

			} else if (connection.protocol === 'wss') {

				WSS.receive(connection, buffer, callback);

			} else if (connection.protocol === 'ws') {

				WS.receive(connection, buffer, callback);

			} else {

				if (callback !== null) {
					callback(null);
				}

			}

		} else if (buffer !== null) {

			let data = decode({ type: 'server' }, buffer);

			if (callback !== null) {

				callback({
					headers: data.headers,
					payload: data.payload
				});

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

			if (connection.protocol === 'socks') {

				let buffer  = null;
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

					buffer = encode(connection, {
						headers: headers,
						payload: payload
					});

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

			} else if (connection.tunnel !== null) {

				if (connection.protocol === 'https') {

					HTTPS.send(connection.tunnel, data, callback);

				} else if (connection.protocol === 'http') {

					HTTP.send(connection.tunnel, data, callback);

				} else if (connection.protocol === 'wss') {

					WSS.send(connection.tunnel, data, callback);

				} else if (connection.protocol === 'ws') {

					WS.send(connection.tunnel, data, callback);

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

				connection.type = 'server';

				connection.socket.once('data', (data) => {

					SOCKS.receive(connection, data, (request) => {

						if (isUpgrade(request) === true) {
							SOCKS.upgrade(connection, request);
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


export { SOCKS };

