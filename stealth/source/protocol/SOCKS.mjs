
import net from 'net';

import { Buffer, Emitter, isObject } from '../../extern/base.mjs';
import { HTTP                      } from './HTTP.mjs';
import { HTTPS                     } from './HTTPS.mjs';
import { WS                        } from './WS.mjs';
import { WSS                       } from './WSS.mjs';



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const Connection = function(socket) {

	this.socket = socket || null;

	Emitter.call(this);

};

Connection.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Connection',

	disconnect: function() {

		if (this.socket !== null) {
			this.socket.destroy();
		}

		this.emit('@disconnect');

	}

});



const SOCKS = {

	connect: function(ref, buffer, connection) {

		ref        = isObject(ref)            ? ref        : null;
		buffer     = isObject(buffer)         ? buffer     : {};
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

			if (hosts.length > 0 && hosts[0].scope === 'public') {

				let proxy = ref.proxy || null;
				if (proxy === null) {

					proxy = { host: null, port: null };

					if (ref.protocol === 'socks') {
						proxy.host   = '127.0.0.1';
						proxy.port   = ref.port || null;
						ref.port     = 443;
						ref.protocol = 'https';
					} else {
						proxy.host   = '127.0.0.1';
						proxy.port   = 1080;
					}

				}


				let socket = net.connect({
					host: proxy.host || '127.0.0.1',
					port: proxy.port || 1080
				}, () => {

					connection.socket = socket;

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

										if (response.length > 3) {

											let version = response[0];
											let message = response[1];
											let reserve = response[2];

											if (version === 0x05 && message === 0x00 && reserve === 0x00) {
												connection.emit('@tunnel');
											} else if (version === 0x05) {

												if (message === 0x03 || message === 0x04) {
													connection.emit('timeout', [ null ]);
												} else if (message === 0x02 || message === 0x05) {
													connection.emit('error', [{ type: 'request', cause: 'socket-stability' }]);
												} else {
													connection.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
												}

											} else {
												connection.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
											}

										} else {
											connection.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
										}

									});

									socket.write(Buffer.from(blob));

								} else {
									connection.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
								}

							} else {
								connection.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
							}

						} else {
							connection.emit('error', [{ type: 'request', cause: 'socket-proxy' }]);
						}

					});

					socket.write(Buffer.from([
						0x05, // SOCKS v5
						0x01, // auth(s) length
						0x00  // No auth
					]));

				});

				connection.on('@tunnel', () => {

					if (ref.protocol === 'https') {
						HTTPS.connect(ref, buffer, connection);
					} else if (ref.protocol === 'http') {
						HTTP.connect(ref, buffer, connection);
					} else if (ref.protocol === 'wss') {
						WSS.connect(ref, buffer, connection);
					} else if (ref.protocol === 'ws') {
						WS.connect(ref, buffer, connection);
					}

				});

				return connection;

			} else if (hosts.length > 0 && hosts[0].scope === 'private') {

				if (ref.protocol === 'https') {
					return HTTPS.connect(ref, buffer, connection);
				} else if (ref.protocol === 'http') {
					return HTTP.connect(ref, buffer, connection);
				} else if (ref.protocol === 'wss') {
					return WSS.connect(ref, buffer, connection);
				} else if (ref.protocol === 'ws') {
					return WS.connect(ref, buffer, connection);
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

	receive:    HTTP.receive,
	send:       HTTP.send

};


export { SOCKS };

