
import net from 'net';

import { Emitter, isArray, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DNSH                                                                 } from '../../source/connection/DNSH.mjs';
import { DNSS                                                                 } from '../../source/connection/DNSS.mjs';
import { HTTP                                                                 } from '../../source/connection/HTTP.mjs';
import { HTTPS                                                                } from '../../source/connection/HTTPS.mjs';
import { WS                                                                   } from '../../source/connection/WS.mjs';
import { WSS                                                                  } from '../../source/connection/WSS.mjs';
import { IP                                                                   } from '../../source/parser/IP.mjs';
import { URL                                                                  } from '../../source/parser/URL.mjs';
import { SOCKS as PACKET                                                      } from '../../source/packet/SOCKS.mjs';



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

const isStatus = function(status) {

	if (
		isString(status) === true
		&& isNumber(STATUSES[status]) === true
	) {
		return true;
	}


	return false;

};

const STATUSES = {
	'success':                           0x00,
	'error':                             0x01,
	'error:block':                       0x02,
	'error:network':                     0x03,
	'error:host':                        0x04,
	'error:connection':                  0x05,
	'error:connection:socket-stability': 0x06,
	'error:unsupported-command':         0x07,
	'error:unsupported-address':         0x08
};



const onconnect = function(connection, url) {

	connection.socket.once('data', (data) => {

		let response = PACKET.decode(connection, data);
		if (response !== null && response.headers['@auth'] === 'none') {

			connection.socket.once('data', (data) => {

				let response = PACKET.decode(connection, data);
				if (response !== null) {

					if (response.headers['@status'] === 0x00) {

						if (
							url.hosts.length === 0
							&& isObject(response.payload) === true
							&& IP.isIP(response.payload.hosts[0]) === true
							&& response.payload.hosts[0].ip !== '0.0.0.0'
						) {
							url.hosts.push(response.payload.hosts[0]);
						}


						let protocol = null;
						let tunnel   = null;

						try {

							if (url.protocol === 'dnsh') {

								protocol = 'dnsh';
								tunnel   = DNSH.connect(url, connection);

							} else if (url.protocol === 'dnss') {

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

						if (protocol !== null && tunnel !== null) {

							connection.protocol = protocol;
							connection.tunnel   = tunnel;

						} else {

							connection.protocol = null;
							connection.tunnel   = null;

							connection.emit('error', [{ type: 'connection', cause: 'socket-proxy' }]);

						}

					} else if (response.headers['@status'] === 0x01) {
						connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
					} else if (response.headers['@status'] === 0x02) {
						connection.emit('error', [{ code: 403 }]);
					} else if (response.headers['@status'] === 0x03) {
						connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
					} else if (response.headers['@status'] === 0x04) {
						connection.emit('error', [{ type: 'host' }]);
					} else if (response.headers['@status'] === 0x05) {
						connection.emit('error', [{ type: 'connection' }]);
					} else if (response.headers['@status'] === 0x06) {
						connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
					} else if (response.headers['@status'] === 0x07) {
						connection.emit('error', [{ type: 'connection', cause: 'headers' }]);
					} else if (response.headers['@status'] === 0x08) {
						connection.emit('error', [{ type: 'connection', cause: 'payload' }]);
					} else {
						connection.emit('error', [{ type: 'connection' }]);
					}

				} else {
					connection.emit('error', [{ type: 'connection', cause: 'socket-proxy' }]);
				}

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

	connection.type = 'client';
	connection.socket.write(PACKET.encode(connection, {
		headers: {
			'@auth': [ 'none' ]
		},
		payload: null
	}));

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

	connection.socket.once('data', (fragment) => {

		let request = PACKET.decode(connection, fragment);
		if (request !== null && request.headers['@method'] === 'connect' && isPayload(request.payload) === true) {

			if (connection.has('@connect-tunnel') === true) {

				connection.emit('@connect-tunnel', [ request, (status, address, socket) => {

					status  = isStatus(status)   ? status  : 'error';
					address = isPayload(address) ? address : null;
					socket  = isSocket(socket)   ? socket  : null;


					if (connection.socket !== null) {

						if (status === 'success') {

							SOCKS.send(connection, {
								headers: {
									'@status': 0x00
								},
								payload: address
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
								connection.emit('@connect', [ null ]);
							}, 0);

						} else if (isNumber(STATUSES[status]) === true) {

							SOCKS.send(connection, {
								headers: {
									'@status': STATUSES[status]
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
						'@status': 0x00
					},
					payload: URL.parse('127.0.0.1:65432')
				});

				connection.socket.on('data', (fragment) => {
					ondata(connection, url, fragment);
				});

				setTimeout(() => {
					connection.emit('@connect', [ null ]);
				}, 0);

			}

		} else {

			SOCKS.send(connection, {
				headers: {
					'@status': 0x07
				},
				payload: null
			});

			setTimeout(() => {
				connection.disconnect();
			}, 0);

		}

	});


	connection.type = 'server';
	connection.socket.resume();
	connection.socket.write(PACKET.encode(connection, {
		headers: {
			'@auth': 'none'
		},
		payload: null
	}));

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
		&& (url.headers['@auth'] || []).includes('none') === true
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
			local:    null,
			protocol: null,
			remote:   null,
			events:   blob.data.events,
			journal:  blob.data.journal
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

		if (this.protocol !== null) {
			data.protocol = this.protocol;
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

					connection.socket = net.connect({
						host: proxy.host || '127.0.0.1',
						port: proxy.port || 1080
					}, () => {

						connection.socket.setTimeout(0);
						connection.socket.setNoDelay(true);
						connection.socket.setKeepAlive(true, 0);
						connection.socket.allowHalfOpen = true;

						onconnect(connection, url);

					});

				} catch (err) {
					connection.socket = null;
				}

			} else {

				connection.socket.setTimeout(0);
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
						ondisconnect(connection, url);
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

					}

				});

				connection.socket.on('end', () => {

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

			} else if (connection.protocol === 'dnsh') {

				return DNSH.receive(connection, buffer, callback);

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

				let buffer = PACKET.encode(connection, {
					headers: data.headers || {},
					payload: data.payload || null
				});

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

				if (connection.protocol === 'dnsh') {

					return DNSH.send(connection.tunnel, data, callback);

				} else if (connection.protocol === 'dnss') {

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

