
import tls from 'tls';

import { isFunction, isObject } from '../POLYFILLS.mjs';



const lookup = function(host, options, callback) {

	options  = isObject(options)    ? options  : {};
	callback = isFunction(callback) ? callback : function() {};


	let results = this.hosts.sort((a, b) => {

		if (a.type === 'v4' && b.type === 'v4') return 0;
		if (a.type === 'v4') return -1;
		if (b.type === 'v4') return  1;

		if (a.scope === 'private' && b.scope === 'private') return 0;
		if (a.scope === 'private') return -1;
		if (b.scope === 'private') return  1;

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


	if (options.all === true) {
		callback(null, results);
	} else {
		callback(null, results[0].address, results[0].family);
	}

};



const TLS = {

	connect: function(ref, buffer, scope) {

		ref    = isObject(ref)    ? ref    : null;
		buffer = isObject(buffer) ? buffer : null;
		scope  = isObject(scope)  ? scope  : this;


		if (ref !== null) {

			let hosts = ref.hosts.sort((a, b) => {

				if (a.type === 'v4' && b.type === 'v4') return 0;
				if (a.type === 'v4') return -1;
				if (b.type === 'v4') return  1;

				if (a.scope === 'private' && b.scope === 'private') return 0;
				if (a.scope === 'private') return -1;
				if (b.scope === 'private') return  1;

				return 0;

			});

			if (hosts.length > 0) {

				let hostname = hosts[0].ip;

				if (ref.host !== null) {

					let check = hosts.find((h) => h.ip === ref.host) || null;
					if (check !== null) {
						hostname = check.ip;
					}

				} else if (ref.domain !== null) {

					if (ref.subdomain !== null) {
						hostname = ref.subdomain + '.' + ref.domain;
					} else {
						hostname = ref.domain;
					}

				}


				let socket = tls.connect({
					host:           hostname,
					port:           ref.port || 443,
					ALPNProtocols:  [ 'http/1.1', 'http/1.0' ],
					secureProtocol: 'TLS_method',
					servername:     hostname,
					lookup:         lookup.bind(ref)
				}, () => {

					if (socket.authorized === true) {

						scope.__socket = socket;
						scope.emit('@connect', [ socket ]);

					} else {

						scope.__socket = null;
						scope.emit('error', [{ type: 'request', cause: 'socket-trust' }]);

					}

				});

				socket.on('timeout', () => {

					if (scope.__socket !== null) {
						scope.__socket = null;


						if (buffer !== null && buffer.partial === true) {
							scope.emit('timeout', [{
								headers: ref.headers,
								payload: buffer.payload
							}]);
						} else {
							scope.emit('timeout', [ null ]);
						}

					}

				});

				socket.on('error', (err) => {

					if (scope.__socket !== null) {
						scope.__socket = null;


						if (err.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
							scope.emit('error', [{ type: 'request', cause: 'socket-trust' }]);
						} else if (err.code === 'ERR_TLS_HANDSHAKE_TIMEOUT') {
							scope.emit('timeout', [ null ]);
						} else if (err.code.startsWith('ERR_TLS')) {
							scope.emit('error', [{ type: 'request', cause: 'socket-trust' }]);
						} else {
							scope.emit('error', [{ type: 'request' }]);
						}

					}

				});

				socket.on('end', () => {

					if (scope.__socket !== null) {
						scope.__socket = null;
						scope.emit('@disconnect', [ socket ]);
					}

				});

				return socket;

			} else {

				scope.__socket = null;
				scope.emit('error', [{ type: 'host' }]);

				return null;

			}

		} else {

			scope.__socket = null;
			scope.emit('error', [{ type: 'request' }]);

			return null;

		}

	}

};


export { TLS };

