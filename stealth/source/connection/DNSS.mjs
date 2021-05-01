
import net from 'net';
import tls from 'tls';

import { Emitter, isBuffer, isFunction, isObject } from '../../extern/base.mjs';
import { IP                                      } from '../../source/parser/IP.mjs';
import { URL                                     } from '../../source/parser/URL.mjs';



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

	// TODO: Is it possible to receive fragments?

	DNSS.receive(connection, chunk, (frame) => {

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
		return obj instanceof net.Socket;
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

	this.socket = socket || null;
	this.type   = null;


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
								connection.emit('error', [{ type: 'request', cause: 'socket-trust' }]);

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
								connection.emit('error', [{ type: 'request', cause: 'socket-trust' }]);

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
							connection.emit('timeout', [ null ]);
							connection.disconnect();
						}

					});

					connection.socket.on('error', (err) => {

						if (connection.socket !== null) {

							let code  = (err.code || '');
							let error = { type: 'request' };

							if (code.startsWith('ERR_TLS') === true) {
								error = { type: 'request', cause: 'socket-trust' };
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


		if (buffer !== null) {

			let data = decode(connection, buffer);
			if (data !== null) {

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

		} else {

			if (callback !== null) {
				callback(null);
			}

		}

	},

	// TODO: This is wrong!?
	send:    DNS.send,
	upgrade: DNS.upgrade

};
