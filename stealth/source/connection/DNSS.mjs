
import tls from 'tls';

import { Buffer, Emitter, isBuffer, isFunction, isObject } from '../../extern/base.mjs';
import { IP                                              } from '../../source/parser/IP.mjs';
import { URL                                             } from '../../source/parser/URL.mjs';
import { DNS as PACKET                                   } from '../../source/packet/DNS.mjs';



const lookup = function(host, options, callback) {

	options  = isObject(options)    ? options  : {};
	callback = isFunction(callback) ? callback : function() {};


	let results = IP.sort(this.hosts).filter((ip) => {

		if (options.family === 4) {
			return ip.type === 'v4';
		} else if (options.family === 6) {
			return ip.type === 'v6';
		} else {
			return ip.type !== null;
		}

	}).map((ip) => ({
		address: ip.ip,
		family:  parseInt(ip.type.substr(1), 10)
	}));


	// SNI TLS extension can fire ENETUNREACH errors
	// setTimeout() delegates errors to socket listeners
	// Please don't ask why.

	setTimeout(() => {

		if (options.all === true) {
			callback(null, results);
		} else {
			callback(null, results[0].address, results[0].family);
		}

	}, 0);

};

const onconnect = function(connection, url) {

	let timeout = Date.now() + 1000;

	connection.type = 'client';

	connection.socket.on('data', (fragment) => {

		ondata(connection, url, fragment);
		timeout = Date.now();

	});

	connection.interval = setInterval(() => {

		if ((Date.now() - timeout) > 1000) {
			connection.disconnect();
		}

	}, 1000);

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const ondata = function(connection, url, chunk) {

	connection.fragment = Buffer.concat([ connection.fragment, chunk ]);


	if (connection.fragment.length > 12 + 2) {

		let length = (connection.fragment[0] << 8) + connection.fragment[1];
		if (connection.fragment.length >= length + 2) {

			let buffer          = connection.fragment.slice(2, 2 + length);
			connection.fragment = connection.fragment.slice(2 + length);


			DNSS.receive(connection, buffer, (frame) => {

				if (frame !== null) {

					url.headers = frame.headers;
					url.payload = frame.payload;

					if (frame.headers['@type'] === 'request') {
						connection.emit('request', [ frame ]);
					} else if (frame.headers['@type'] === 'response') {
						connection.emit('response', [ frame ]);
					}

				}

			});

		}

	}

};

const ondisconnect = function(connection, url) {

	if (connection.type === 'client') {

		if (url.headers === null) {
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

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof tls.TLSSocket;
	}

	return false;

};

const isUpgrade = function(url) {

	if (
		isObject(url) === true
		&& isObject(url.headers) === true
	) {
		return true;
	}


	return false;

};

const Connection = function(socket) {

	socket = isSocket(socket) ? socket : null;


	this.fragment = Buffer.alloc(0);
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

	}

});



const DNSS = {

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0) {

				let hostname = hosts[0].ip;
				let domain   = URL.toDomain(url);
				let host     = URL.toHost(url);

				if (domain !== null) {
					hostname = domain;
				} else if (host !== null) {
					hostname = host;
				}


				if (connection.socket === null) {

					try {

						connection.socket = tls.connect({
							host:           hostname,
							port:           url.port || 853,
							ALPNProtocols:  [ 'dns' ],
							secureProtocol: 'TLS_method',
							servername:     hostname,
							lookup:         lookup.bind(url)
						}, () => {

							if (connection.socket.authorized === true) {

								connection.socket.setNoDelay(true);
								connection.socket.setKeepAlive(false, 0);
								connection.socket.allowHalfOpen = false;

								onconnect(connection, url);

							} else {

								connection.socket = null;
								connection.emit('error', [{ type: 'connection', cause: 'socket-trust' }]);

							}

						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					try {

						connection.socket = tls.connect({
							host:           hostname,
							port:           url.port || 853,
							ALPNProtocols:  [ 'dns' ],
							secureProtocol: 'TLS_method',
							servername:     hostname,
							lookup:         lookup.bind(url),
							socket:         connection.socket || null
						}, () => {

							if (connection.socket.authorized === true) {

								connection.socket.setNoDelay(true);
								connection.socket.setKeepAlive(false, 0);
								connection.socket.allowHalfOpen = false;

								onconnect(connection, url);

							} else {

								connection.socket = null;
								connection.emit('error', [{ type: 'connection', cause: 'socket-trust' }]);

							}

						});

					} catch (err) {
						connection.socket = null;
					}

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
							} else if (code.startsWith('ERR_TLS') === true) {
								error = { type: 'connection', cause: 'socket-trust' };
							}

							connection.emit('error', [ error ]);
							connection.disconnect();

						}

					});

					connection.socket.on('end', () => {

						if (connection.socket !== null) {
							connection.disconnect();
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

					connection.socket.write(Buffer.concat([
						Buffer.from([
							(buffer.length >> 8) & 0xff,
							buffer.length        & 0xff
						]),
						buffer
					]));

				} else {

					connection.socket.end(Buffer.concat([
						Buffer.from([
							(buffer.length >> 8) & 0xff,
							buffer.length        & 0xff
						]),
						buffer
					]));

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


export { DNSS };

