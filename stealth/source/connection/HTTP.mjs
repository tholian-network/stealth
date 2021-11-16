
import net  from 'net';

import { Buffer, Emitter, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                                                  } from '../../source/parser/IP.mjs';
import { URL                                                                 } from '../../source/parser/URL.mjs';
import { HTTP as PACKET                                                      } from '../../source/packet/HTTP.mjs';



const EMPTYLINE = Buffer.from('\r\n\r\n', 'utf8');



const onconnect = function(connection, url) {

	if (url.payload !== null) {

		if (isNumber(url.headers['@status']) === true && url.headers['@status'] === 206) {

			let encoding = 'identity';
			let from     = 0;

			if (isBuffer(url.payload) === true) {
				from = url.payload.length;
			}

			if (isObject(url.headers['@transfer']) === true) {

				if (isString(url.headers['@transfer']['encoding']) === true) {
					encoding = url.headers['@transfer']['encoding'];
				}

			}

			url.headers = {
				'@transfer': {
					'encoding': encoding,
					'length':   null,
					'range':    [ from, Infinity ],
				},
				'@method':         'GET',
				'@url':            URL.render(url),
				'accept-encoding': encoding
			};

			url.payload = null;

		}

	}


	let timeout = Date.now() + 5000;

	connection.type = 'client';

	connection.socket.on('data', (fragment) => {

		ondata(connection, url, fragment);
		timeout = Date.now();

	});

	connection.interval = setInterval(() => {

		if (url.payload === null && (Date.now() - timeout) > 1000) {
			ondisconnect(connection, url);
		}

	}, 1000);

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const ondata = function(connection, url, chunk) {

	connection.fragment = Buffer.concat([ connection.fragment, chunk ]);


	let header_index = connection.fragment.indexOf(EMPTYLINE);
	if (header_index !== -1) {

		let frame = PACKET.decode(connection, connection.fragment);
		if (frame !== null) {

			url.headers = frame.headers;
			url.payload = frame.payload;

			if (connection.type === 'client') {

				if (
					frame.headers['@status'] === 100
					|| frame.headers['@status'] === 101
					|| frame.headers['@status'] === 204
					|| frame.headers['@status'] === 304
				) {

					if (frame.overflow !== null) {
						connection.fragment = frame.overflow;
					} else {
						connection.fragment = Buffer.alloc(0);
					}

					connection.emit('response', [{
						headers: frame.headers,
						payload: frame.payload
					}]);

				} else if (frame.headers['@status'] >= 400 && frame.headers['@status'] <= 599) {

					connection.socket.end();

				} else if (frame.headers['@transfer']['length'] !== Infinity) {

					if (frame.payload !== null) {

						if (frame.overflow !== null) {
							connection.fragment = frame.overflow;
						} else {
							connection.fragment = Buffer.alloc(0);
						}

						connection.emit('response', [{
							headers: frame.headers,
							payload: frame.payload
						}]);

					} else {

						let bytes   = connection.fragment.length - header_index - 4;
						let partial = connection.fragment.slice(connection.fragment.indexOf(EMPTYLINE) + 4);

						connection.emit('progress', [{
							headers: frame.headers,
							payload: partial
						}, {
							bytes: bytes,
							total: frame.headers['@transfer']['length']
						}]);

					}

				} else {

					// Unknown payload size, wait for timeout

				}

			} else if (connection.type === 'server') {

				if (frame.headers['@transfer']['length'] !== Infinity) {

					if (frame.payload !== null) {

						if (frame.overflow !== null) {
							connection.fragment = frame.overflow;
						} else {
							connection.fragment = Buffer.alloc(0);
						}

						connection.emit('request', [{
							headers: frame.headers,
							payload: frame.payload
						}]);

					} else {

						let bytes   = connection.fragment.length - header_index - 4;
						let partial = connection.fragment.slice(connection.fragment.indexOf(EMPTYLINE) + 4);

						connection.emit('progress', [{
							headers: frame.headers,
							payload: partial
						}, {
							bytes: bytes,
							total: frame.headers['@transfer']['length']
						}]);

					}

				} else {

					// Assume that Frames without Content-Length don't submit a payload
					if (frame.overflow !== null) {
						connection.fragment = frame.overflow;
					} else {
						connection.fragment = Buffer.alloc(0);
					}

					connection.emit('request', [{
						headers: frame.headers,
						payload: frame.payload
					}]);

				}

			}

		}

	}

};

const ondisconnect = function(connection, url) {

	if (
		url.headers === null
		|| (
			url.headers !== null
			&& isObject(url.headers['@transfer']) === true
			&& url.headers['@transfer']['length'] === Infinity
			&& url.payload === null
		)
	) {

		let frame = PACKET.decode(connection, connection.fragment);
		if (frame !== null) {

			url.headers = frame.headers;
			url.payload = frame.payload;

			if (frame.overflow !== null) {
				connection.fragment = frame.overflow;
			} else {
				connection.fragment = Buffer.alloc(0);
			}

		} else {

			url.headers = {};
			url.payload = null;

		}

	}


	if (connection.type === 'client') {

		let code = url.headers['@status'] || 500;
		if (code === 200) {

			if (url.payload !== null) {

				connection.emit('response', [{
					headers: url.headers,
					payload: url.payload
				}]);

			} else {

				connection.emit('error', [{ type: 'connection', cause: 'payload' }]);

			}

		} else if (code === 204 || code === 205) {

			connection.emit('error', [{ code: code, type: 'connection', cause: 'headers' }]);

		} else if (code === 206) {

			if (
				url.headers !== null
				&& url.payload !== null
			) {

				if (
					url.headers['@transfer']['length'] !== Infinity
					&& url.headers['@transfer']['length'] === url.payload.length
				) {

					connection.emit('response', [{
						headers: url.headers,
						payload: url.payload
					}]);

				} else {

					connection.emit('progress', [{
						headers: url.headers,
						payload: url.payload
					}, {
						bytes: url.payload.length,
						total: url.headers['@transfer']['length']
					}]);

				}

			}

		} else if (code === 301 || code === 302 || code === 307 || code === 308) {

			let location = URL.parse(url.headers['location']);

			if (URL.isURL(location) === true) {

				connection.emit('redirect', [{
					headers: { 'location': location.link },
					payload: null
				}]);

			} else {
				connection.emit('error', [{ code: code, type: 'connection', cause: 'headers' }]);
			}

		} else if (code >= 100 && code <= 599) {
			connection.emit('error', [{ code: code, type: 'connection', cause: 'headers' }]);
		} else {
			connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
		}

	} else if (connection.type === 'server') {

		let check = (url.headers['@url'] || '');
		if (check !== '') {
			// Do Nothing
		} else {
			connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
		}

	}


	connection.disconnect();

};

const onupgrade = function(connection, url) {

	connection.type = 'server';

	connection.socket.on('data', (fragment) => {
		ondata(connection, url, fragment);
	});

	connection.socket.resume();


	setTimeout(() => {
		connection.emit('@connect');
	}, 0);


	if (isObject(url.headers['@transfer']) === true) {

		setTimeout(() => {

			if (url.headers['@transfer']['length'] !== Infinity) {

				if (url.payload !== null) {

					connection.emit('request', [{
						headers: url.headers,
						payload: url.payload
					}]);

				}

			} else {

				connection.emit('request', [{
					headers: url.headers,
					payload: url.payload
				}]);

			}

		}, 0);

	}

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
		&& (isBuffer(url.payload) === true || url.payload === null)
	) {
		return true;
	}

	return false;

};

const Connection = function(socket) {

	socket = isSocket(socket) ? socket : null;


	this.fragment = Buffer.alloc(0);
	this.interval = null;
	this.socket   = socket;
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



const HTTP = {

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0) {

				if (connection.socket === null) {

					try {

						connection.socket = net.connect({
							host: hosts[0].ip,
							port: url.port || 80,
						}, () => {

							connection.socket.setNoDelay(true);
							connection.socket.setKeepAlive(false, 0);
							connection.socket.allowHalfOpen = false;

							onconnect(connection, url);

						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					connection.socket.setNoDelay(true);
					connection.socket.setKeepAlive(false, 0);
					connection.socket.allowHalfOpen = false;

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
		buffer     = Buffer.isBuffer(buffer)  ? buffer     : null;
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

		url = isUpgrade(url) ? Object.assign(URL.parse(), url) : Object.assign(URL.parse(), { headers: {} });


		let connection = null;

		if (isSocket(tunnel) === true) {
			connection = new Connection(tunnel);
		} else if (isConnection(tunnel) === true) {
			connection = Connection.from(tunnel);
		}


		if (connection !== null) {

			connection.socket.setNoDelay(true);
			connection.socket.setKeepAlive(false, 0);
			connection.socket.allowHalfOpen = false;

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

			return connection;

		}


		return null;

	}

};


export { HTTP };

