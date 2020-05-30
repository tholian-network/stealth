
import tls from 'tls';

import { Buffer, Emitter, isFunction, isObject } from '../../extern/base.mjs';
import { HTTP                                  } from './HTTP.mjs';
import { onconnect, ondata, onend, onerror     } from './HTTP.mjs';



const lookup = function(host, options, callback) {

	options  = isObject(options)    ? options  : {};
	callback = isFunction(callback) ? callback : function() {};


	let results = this.hosts.sort((a, b) => {

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

	}).filter((ip) => {

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


	// XXX: SNI TLS extension can fire ENETUNREACH errors

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

	this.socket = socket || null;

	this.__fragment = {
		encoding: 'identity',
		headers:  null,
		length:   null,
		mode:     'headers',
		partial:  false,
		payload:  Buffer.from('', 'utf8'),
		start:    0
	};

	Emitter.call(this);

};

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



const HTTPS = {

	connect: function(ref, connection) {

		ref        = isObject(ref)            ? ref        : null;
		connection = isConnection(connection) ? connection : new Connection();


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

			if (hosts.length > 0) {

				let hostname = hosts[0].ip;

				if (ref.host !== null) {

					let check = hosts.find((h) => h.ip === ref.host) || null;
					if (check !== null) {
						hostname = check.ip;
					}

				}

				if (ref.domain !== null) {

					if (ref.subdomain !== null) {
						hostname = ref.subdomain + '.' + ref.domain;
					} else {
						hostname = ref.domain;
					}

				}


				let socket = connection.socket || null;
				if (socket === null) {

					try {

						socket = tls.connect({
							host:           hostname,
							port:           ref.port || 443,
							ALPNProtocols:  [ 'http/1.1', 'http/1.0' ],
							secureProtocol: 'TLS_method',
							servername:     hostname,
							lookup:         lookup.bind(ref)
						}, () => {

							if (socket.authorized === true) {

								connection.socket = socket;
								onconnect(connection, ref);

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
							port:           ref.port || 443,
							ALPNProtocols:  [ 'http/1.1', 'http/1.0' ],
							secureProtocol: 'TLS_method',
							servername:     hostname,
							lookup:         lookup.bind(ref),
							socket:         connection.socket || null
						}, () => {

							if (socket.authorized === true) {

								connection.socket = socket;
								onconnect(connection, ref);

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

					socket.on('data', (fragment) => {
						ondata(connection, ref, fragment);
					});

					socket.on('timeout', () => {

						if (connection.socket !== null) {

							connection.socket = null;

							let fragment = connection.__fragment;
							if (fragment.partial === true) {

								connection.emit('timeout', [{
									headers: ref.headers,
									payload: fragment.payload
								}]);

							} else {
								connection.emit('timeout', [ null ]);
							}

						}

					});

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
								onerror(connection, ref);
							}

						}

					});

					socket.on('end', () => {

						if (connection.socket !== null) {

							onend(connection, ref);
							connection.socket = null;

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
			return connection.disconnect();
		}


		return false;

	},

	receive: HTTP.receive,
	send:    HTTP.send,
	upgrade: HTTP.upgrade

};


export { HTTPS };

