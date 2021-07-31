
import net from 'net';

import { Buffer, Emitter, isArray, isBoolean, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DNSS                                                                                    } from '../../source/connection/DNSS.mjs';
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

								if (url.protocol === 'dnss') {

									protocol = 'dnss';
									tunnel   = DNSS.connect(url, connection);

								} else if (url.protocol === 'https') {

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

									connection.emit('error', [{ type: 'connection', cause: 'socket-proxy' }]);

								}

							}, 100);

						} else if (response.headers['@status'] === 'error-blocked') {
							connection.emit('error', [{ code: 403 }]);
						} else if (response.headers['@status'] === 'error-network' || response.headers['@status'] === 'error-host' || response.headers['@status'] === 'error-connection') {
							connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
						} else {
							connection.emit('error', [{ type: 'connection' }]);
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
				connection.emit('error', [{ type: 'connection', cause: 'socket-proxy' }]);
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
							ondisconnect(connection, url);
						}

					});

					socket.on('error', () => {

						if (connection.socket !== null) {
							ondisconnect(connection, url);
						}

					});

					socket.on('end', () => {

						if (connection.socket !== null) {
							ondisconnect(connection, url);
						}

					});

					return connection;

				} else {

					connection.socket = null;
					connection.emit('error', [{ type: 'connection' }]);

					return null;

				}

			} else if (hosts.length > 0 && hosts[0].scope === 'private') {

				if (url.protocol === 'dnss') {

					return DNSS.connect(url, connection);

				} else if (url.protocol === 'https') {

					return HTTPS.connect(url, connection);

				} else if (url.protocol === 'http') {

					return HTTP.connect(url, connection);

				} else if (url.protocol === 'wss') {

					return WSS.connect(url, connection);

				} else if (url.protocol === 'ws') {

					return WS.connect(url, connection);

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

			if (connection.protocol === 'socks') {

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

			} else if (connection.protocol === 'dnss') {

				return DNSS.receive(connection, buffer, callback);

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

			} else if (connection.tunnel !== null) {

				if (connection.protocol === 'dnss') {

					return DNSS.send(connection.tunnel, data, callback);

				} else if (connection.protocol === 'https') {

					return HTTPS.send(connection.tunnel, data, callback);

				} else if (connection.protocol === 'http') {

					return HTTP.send(connection.tunnel, data, callback);

				} else if (connection.protocol === 'wss') {

					return WSS.send(connection.tunnel, data, callback);

				} else if (connection.protocol === 'ws') {

					return WS.send(connection.tunnel, data, callback);

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
						ondisconnect(connection, url);
					}

				});

				connection.socket.on('error', () => {

					if (connection.socket !== null) {
						ondisconnect(connection, url);
					}

				});

				connection.socket.on('end', () => {

					if (connection.socket !== null) {
						ondisconnect(connection, url);
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

