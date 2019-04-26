
import tls from 'tls';

import { isFunction, isObject } from '../POLYFILLS.mjs';

import { Emitter } from '../Emitter.mjs';
import { WS      } from './WS.mjs';
import { onconnect, ondata, onend, onerror } from './WS.mjs';



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


	if (options.all === true) {
		callback(null, results);
	} else {
		callback(null, results[0].address, results[0].family);
	}

};



const WSS = {

	connect: function(ref, buffer, emitter) {

		ref     = isObject(ref)     ? ref     : null;
		buffer  = isObject(buffer)  ? buffer  : {};
		emitter = isObject(emitter) ? emitter : new Emitter();


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


				let socket = tls.connect({
					host:           hostname,
					port:           ref.port || 443,
					ALPNProtocols:  [ 'http/1.1', 'http/1.0' ],
					secureProtocol: 'TLS_method',
					servername:     hostname,
					lookup:         lookup.bind(ref),
					socket:         emitter.socket || null
				}, () => {

					if (socket.authorized === true) {

						onconnect(socket, ref, buffer, emitter);
						emitter.socket = socket;

					} else {

						emitter.socket = null;
						emitter.emit('error', [{ type: 'request', cause: 'socket-trust' }]);

					}

				});

				socket.on('data', (fragment) => {
					ondata(socket, ref, buffer, emitter, fragment);
				});

				socket.on('timeout', () => {

					if (emitter.socket !== null) {

						emitter.socket = null;

						if (buffer !== null && buffer.partial === true) {
							emitter.emit('timeout', [{
								headers: ref.headers,
								payload: buffer.payload
							}]);
						} else {
							emitter.emit('timeout', [ null ]);
						}

					}

				});

				socket.on('error', (err) => {

					if (emitter.socket !== null) {

						emitter.socket = null;

						let code = (err.code || '');
						if (code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
							emitter.emit('error', [{ type: 'request', cause: 'socket-trust' }]);
						} else if (code === 'ERR_TLS_HANDSHAKE_TIMEOUT') {
							emitter.emit('timeout', [ null ]);
						} else if (code.startsWith('ERR_TLS')) {
							emitter.emit('error', [{ type: 'request', cause: 'socket-trust' }]);
						} else {
							onerror(socket, ref, buffer, emitter);
						}

					}

				});

				socket.on('end', () => {

					if (emitter.socket !== null) {

						onend(socket, ref, buffer, emitter);
						emitter.socket = null;

					}

				});

				return emitter;

			} else {

				emitter.socket = null;
				emitter.emit('error', [{ type: 'host' }]);

				return null;

			}

		} else {

			emitter.socket = null;
			emitter.emit('error', [{ type: 'request' }]);

			return null;

		}

	},

	receive: WS.receive,

	send:    WS.send

};


export { WSS };

