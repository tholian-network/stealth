
import crypto     from 'crypto';
import net        from 'net';
import { Buffer } from 'buffer';

import { isFunction, isNumber, isObject, isString } from './POLYFILLS.mjs';
import { Emitter                                  } from './Emitter.mjs';
import { Cache                                    } from './client/Cache.mjs';
import { Filter                                   } from './client/Filter.mjs';
import { Host                                     } from './client/Host.mjs';
import { Mode                                     } from './client/Mode.mjs';
import { Peer                                     } from './client/Peer.mjs';
import { Redirect                                 } from './client/Redirect.mjs';
import { Settings                                 } from './client/Settings.mjs';
import { Stash                                    } from './client/Stash.mjs';
import { WS                                       } from './protocol/WS.mjs';



const _upgrade = function(socket, nonce, host, port) {

	let handshake = '';

	for (let n = 0; n < 16; n++) {
		nonce[n] = Math.round(Math.random() * 0xff);
	}

	handshake += 'GET / HTTP/1.1\r\n';
	handshake += 'Host: ' + host + ':' + port + '\r\n';
	handshake += 'Upgrade: WebSocket\r\n';
	handshake += 'Connection: Upgrade\r\n';
	handshake += 'Sec-WebSocket-Key: ' + nonce.toString('base64') + '\r\n';
	handshake += 'Sec-WebSocket-Version: 13\r\n';
	handshake += 'Sec-WebSocket-Protocol: stealth\r\n';
	handshake += '\r\n';


	socket.once('data', (data) => {

		let headers = {};

		data.toString('utf8').split('\r\n').forEach((line) => {

			let index = line.indexOf(':');
			if (index !== -1) {

				let key = line.substr(0, index).trim().toLowerCase();
				let val = line.substr(index + 1, line.length - index - 1).trim();
				if (/connection|upgrade|sec-websocket-version|sec-websocket-origin|sec-websocket-protocol/g.test(key)) {
					headers[key] = val.toLowerCase();
				} else if (key === 'sec-websocket-accept') {
					headers[key] = val;
				}

			}

		});

		if (
			headers['connection'] === 'upgrade'
			&& headers['upgrade'] === 'websocket'
			&& headers['sec-websocket-protocol'] === 'stealth'
		) {

			let accept = headers['sec-websocket-accept'] || '';
			let expect = crypto.createHash('sha1').update(nonce.toString('base64') + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
			if (accept === expect) {
				socket.emit('upgrade');
			} else {
				socket.emit('error');
			}

		} else {
			socket.emit('error');
		}

	});

	socket.write(handshake);

};



const Client = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);


	this.address  = null;
	this.services = {
		cache:    new Cache(this),
		filter:   new Filter(this),
		host:     new Host(this),
		mode:     new Mode(this),
		peer:     new Peer(this),
		redirect: new Redirect(this),
		settings: new Settings(this),
		stash:    new Stash(this)
	};

	this.__socket = null;

};


Client.prototype = Object.assign({}, Emitter.prototype, {

	connect: function(host, port, callback) {

		host     = isString(host)       ? host     : 'localhost';
		port     = isNumber(port)       ? port     : 65432;
		callback = isFunction(callback) ? callback : null;


		if (this.__socket !== null) {

			if (callback !== null) {
				callback(true);
			}

			return true;

		}


		if (host !== null && port !== null) {

			let nonce  = Buffer.alloc(16);
			let socket = new net.Socket({
				readable: true,
				writable: true
			});


			socket.once('connect', () => {

				_upgrade(socket, nonce, host, port);
				this.address = socket.remoteAddress || null;

			});

			socket.once('upgrade', () => {

				socket.__ws_client = true;
				socket.allowHalfOpen = true;
				socket.setTimeout(0);
				socket.setNoDelay(true);
				socket.setKeepAlive(true, 0);
				socket.removeAllListeners('timeout');

				let interval_id = setInterval(() => {

					let result = WS.ping(socket);
					if (result === false) {
						clearInterval(interval_id);
						interval_id = null;
					}

				}, 60000);

				socket.removeAllListeners('data');
				socket.on('data', (blob) => {

					WS.receive(socket, blob, (request) => {

						if (request !== null) {

							let event   = request.headers.event   || null;
							let method  = request.headers.method  || null;
							let session = request.headers.session || null;
							let service = request.headers.service || null;

							if (session !== null) {
								this.emit('session', [ session ]);
							}

							if (service !== null && event !== null) {

								let instance = this.services[service] || null;
								if (instance !== null) {
									let response = instance.emit(event, [ request.payload ]);
									if (response !== null) {
										WS.send(socket, response);
									}
								} else {
									let response = this.emit('request', [ request ]);
									if (response !== null) {
										WS.send(socket, response);
									}
								}

							} else if (service !== null && method !== null) {

								let instance = this.services[service] || null;
								if (instance !== null && Function.isFunction(instance[method])) {
									instance[method](request.payload, (response) => {
										if (response !== null) {
											WS.send(socket, response);
										}
									});
								} else {
									let response = this.emit('request', [ request ]);
									if (response !== null) {
										WS.send(socket, response);
									}
								}

							}

						}

					});

				});

				socket.on('end', () => {
					this.disconnect();
				});

				this.__socket = socket;


				if (callback !== null) {
					callback(true);
				}

			});

			socket.on('error', () => {

				if (callback !== null) {
					callback(false);
					callback = null;
				}

				this.disconnect();
				socket.destroy();

			});

			socket.on('close', () => {

				if (this.__socket !== null) {
					this.emit('session', [ null ]);
				}

			});

			socket.on('timeout', () => {

				if (callback !== null) {
					callback(false);
					callback = null;
				}

				this.disconnect();
				socket.destroy();

			});

			socket.connect({
				host: host,
				port: port
			});


			return true;

		} else {

			if (callback !== null) {
				callback(false);
			}

			return false;

		}

	},

	disconnect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.__socket !== null) {

			this.__socket.end();
			this.__socket = null;

			if (callback !== null) {
				callback(true);
			}

			return true;

		} else {

			if (callback !== null) {
				callback(false);
			}

			return false;

		}

	},

	send: function(data) {

		data = isObject(data) ? data : null;


		if (data !== null) {

			if (this.__socket !== null) {

				WS.send(this.__socket, data);

				return true;

			}

		}


		return false;

	}

});


export { Client };

