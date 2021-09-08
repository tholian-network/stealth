
import tls from 'tls';

import { Buffer, Emitter, isFunction, isNumber, isObject } from '../../extern/base.mjs';
import { WS                                              } from '../../source/connection/WS.mjs';
import { IP                                              } from '../../source/parser/IP.mjs';
import { URL                                             } from '../../source/parser/URL.mjs';



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
		buffer:   null,
		operator: 0x00,
		payload:  Buffer.alloc(0)
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

			this.socket.destroy();
			this.socket = null;

			this.emit('@disconnect');

		}

	}

});



const WSS = {

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
							ALPNProtocols:  [ 'http/1.1' ],
							secureProtocol: 'TLS_method',
							servername:     hostname,
							lookup:         lookup.bind(url)
						}, () => {

							if (socket.authorized === true) {

								connection.socket = socket;
								WS.connect(url, connection);

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
								WS.connect(url, connection);

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

						let code  = (err.code || '');
						let error = { type: 'request' };

						if (code.startsWith('ERR_TLS') === true) {
							error = { type: 'request', cause: 'socket-trust' };
						}

						connection.emit('error', [ error ]);
						WS.disconnect(connection);

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

	receive: WS.receive,
	send:    WS.send,
	upgrade: WS.upgrade

};


export { WSS };

