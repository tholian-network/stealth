
import tls from 'tls';

import { Buffer, Emitter, isFunction, isObject } from '../../extern/base.mjs';
import { HTTP                                  } from '../../source/connection/HTTP.mjs';
import { IP                                    } from '../../source/parser/IP.mjs';
import { URL                                   } from '../../source/parser/URL.mjs';



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



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const Connection = function(socket) {

	this.socket   = socket || null;
	this.fragment = {
		encoding: 'identity',
		headers:  null,
		length:   null,
		mode:     'headers',
		partial:  false,
		payload:  Buffer.from('', 'utf8'),
		start:    0
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

		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}

		if (this.socket !== null) {

			this.socket.destroy();
			this.socket = null;

			this.emit('@disconnect');

		}

	}

});



const HTTPS = {

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


				let socket = connection.socket || null;
				if (socket === null) {

					try {

						socket = tls.connect({
							host:           hostname,
							port:           url.port || 443,
							ALPNProtocols:  [ 'http/1.1', 'http/1.0' ],
							secureProtocol: 'TLS_method',
							servername:     hostname,
							lookup:         lookup.bind(url)
						}, () => {

							if (socket.authorized === true) {

								connection.socket = socket;
								HTTP.connect(url, connection);

							} else {

								connection.socket = null;
								connection.emit('error', [{ type: 'request', cause: 'socket-trust' }]);

							}

						});

					} catch (err) {
						socket = null;
					}

				} else {

					try {

						socket = tls.connect({
							host:           hostname,
							port:           url.port || 443,
							ALPNProtocols:  [ 'http/1.1', 'http/1.0' ],
							secureProtocol: 'TLS_method',
							servername:     hostname,
							lookup:         lookup.bind(url),
							socket:         connection.socket || null
						}, () => {

							if (socket.authorized === true) {

								connection.socket = socket;
								HTTP.connect(url, connection);

							} else {

								connection.socket = null;
								connection.emit('error', [{ type: 'request', cause: 'socket-trust' }]);

							}

						});

					} catch (err) {
						socket = null;
					}

				}


				if (socket !== null) {

					socket.removeAllListeners('error');

					socket.on('error', (err) => {

						if (connection.socket !== null) {

							connection.socket = null;

							let code = (err.code || '');
							if (code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
								connection.emit('error', [{ type: 'request', cause: 'socket-trust' }]);
							} else if (code === 'ERR_TLS_HANDSHAKE_TIMEOUT') {
								connection.emit('timeout', [ null ]);
							} else if (code.startsWith('ERR_TLS')) {
								connection.emit('error', [{ type: 'request', cause: 'socket-trust' }]);
							} else {
								HTTP.disconnect(connection, url);
							}

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

	receive: HTTP.receive,
	send:    HTTP.send,
	upgrade: HTTP.upgrade

};


export { HTTPS };

