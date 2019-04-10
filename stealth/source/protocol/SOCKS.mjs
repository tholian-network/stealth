
import net from 'net';

import { isObject } from '../POLYFILLS.mjs';

import { Emitter } from '../Emitter.mjs';
import { HTTPS   } from './HTTPS.mjs';
import { HTTP    } from './HTTP.mjs';



const SOCKS = {

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

			if (hosts.length > 0 && hosts[0].scope === 'public') {

				let proxy  = ref.proxy || { host: '127.0.0.1', port: 1080 };
				let socket = net.connect({
					host: proxy.host || '127.0.0.1',
					port: proxy.port || 1080
				}, () => {

					emitter.socket = socket;

					socket.once('data', (response) => {

						if (response.length === 2) {

							let version = response[0];
							let auth    = response[1];

							if (version === 0x05 && auth === 0x00) {

								let host = hosts[0];
								let blob = [
									0x05, // SOCKS v5
									0x01, // TCP/IP connection
									0x00  // reserved
								];

								if (host.type === 'v4') {

									// ipv4
									blob.push(0x01);
									host.ip.split('.').forEach((v) => {
										blob.push(parseInt(v, 10));
									});

									// port
									blob.push(ref.port >>> 8);
									blob.push(ref.port & 0xff);

								} else if (host.type === 'v6') {

									// ipv6
									blob.push(0x04);
									host.ip.split(':').forEach((v) => {
										blob.push(parseInt(v.substr(0, 2), 16));
										blob.push(parseInt(v.substr(2, 2), 16));
									});

									// port
									blob.push(ref.port >>> 8);
									blob.push(ref.port & 0xff);

								} else if (ref.domain !== null) {

									// domain name
									blob.push(0x03);

									if (ref.subdomain !== null) {

										let tmp = Buffer.from(ref.subdomain + '.' + ref.domain, 'utf8');

										blob.push(tmp.length);

										for (let t = 0, tl = tmp.length; t < tl; t++) {
											blob.push(tmp[t]);
										}

									} else {

										let tmp = Buffer.from(ref.domain, 'utf8');

										blob.push(tmp.length);

										for (let t = 0, tl = tmp.length; t < tl; t++) {
											blob.push(tmp[t]);
										}

									}

									// port
									blob.push(ref.port >>> 8);
									blob.push(ref.port & 0xff);

								}


								if (blob.length > 3) {

									socket.once('data', (response) => {

										if (response.length === 3) {

											let version = response[0];
											let message = response[1];
											let reserve = response[2];

											if (version === 0x05 && message === 0x00 && reserve === 0x00) {
												emitter.emit('@connect', [ socket ]);
											} else if (version === 0x05) {

												if (message === 0x03 || message === 0x04) {
													emitter.emit('timeout', [ null ]);
												} else if (message === 0x02 || message === 0x05) {
													emitter.emit('error', [{ type: 'request', cause: 'socket-stability' }]);
												} else {
													emitter.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
												}

											} else {
												emitter.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
											}

										} else {
											emitter.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
										}

									});

									socket.write(Buffer.from(blob));

								} else {
									emitter.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
								}

							} else {
								emitter.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
							}

						} else {
							emitter.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
						}

					});

					socket.write(Buffer.from([
						0x05, // SOCKS v5
						0x01, // auth(s) length
						0x00  // No auth
					]));

				});

				emitter.on('@connect', () => {

					if (ref.protocol === 'https') {
						HTTPS.connect(ref, buffer, emitter);
					} else if (ref.protocol === 'http') {
						HTTP.connect(ref, buffer, emitter);
					}

				});

				return emitter;

			} else if (hosts.length > 0 && hosts[0].scope === 'private') {

				if (ref.protocol === 'https') {
					return HTTPS.connect(ref, buffer, emitter);
				} else if (ref.protocol === 'http') {
					return HTTP.connect(ref, buffer, emitter);
				} else {

					emitter.socket = null;
					emitter.emit('error', [{ type: 'request' }]);

					return null;

				}

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

	receive: HTTP.receive,

	send:    HTTP.send

};


export { SOCKS };

