
import net from 'net';

import { console, Emitter, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                          } from '../source/ENVIRONMENT.mjs';
import { isStealth                            } from '../source/Stealth.mjs';
import { IP                                   } from '../source/parser/IP.mjs';
import { Defender                             } from '../source/server/Defender.mjs';
import { Peerer                               } from '../source/server/Peerer.mjs';
import { Proxy                                } from '../source/server/Proxy.mjs';
import { Router                               } from '../source/server/Router.mjs';
import { Services                             } from '../source/server/Services.mjs';
import { Webproxy                             } from '../source/server/Webproxy.mjs';
import { Webserver                            } from '../source/server/Webserver.mjs';



export const isServer = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Server]';
};

const toHostname = function(ip) {

	let hostname = 'localhost';

	if (IP.isIP(ip) === true) {

		if (ip.type === 'v4') {
			hostname = IP.render(ip);
		} else if (ip.type === 'v6') {
			hostname = '[' + IP.render(ip) + ']';
		}

	}

	return hostname;

};



const Server = function(settings, stealth) {

	settings = isObject(settings) ? settings : {};
	stealth  = isStealth(stealth) ? stealth  : null;


	this._settings = Object.freeze(Object.assign({
		action: null,
		host:   null
	}, settings));


	if (this._settings.action === 'discover') {

		this.stealth   = stealth;
		this.services  = new Services(this.stealth);
		this.peerer    = new Peerer(this.services, this.stealth);
		this.proxy     = null;
		this.router    = new Router(this.services, this.router);
		this.webproxy  = null;
		this.webserver = null;

	} else if (this._settings.action === 'serve') {

		this.stealth   = stealth;
		this.services  = new Services(this.stealth);
		this.defender  = new Defender(this.services, this.stealth);
		this.peerer    = new Peerer(this.services, this.stealth);
		this.proxy     = new Proxy(this.services, this.stealth);
		this.router    = new Router(this.services, this.stealth);
		this.webproxy  = new Webproxy(this.services, this.stealth);
		this.webserver = new Webserver(this.services, this.stealth);

	} else {

		this.stealth   = stealth;
		this.services  = null;
		this.peerer    = null;
		this.proxy     = null;
		this.router    = null;
		this.webproxy  = null;
		this.webserver = null;

	}

	this.__state = {
		connected: false,
		interval:  null,
		server:    null,
	};


	if (this._settings.action === 'discover') {

		this.__state.interval = setInterval(() => {
			this.peerer.discover();
		}, 10 * 1000);

	}


	Emitter.call(this);


	this.on('connect', () => {

		if (this.peerer !== null) {
			this.peerer.connect();
		}

		if (this.router !== null) {
			this.router.connect();
		}

	});

	this.on('disconnect', () => {

		if (this.peerer !== null) {
			this.peerer.disconnect();
		}

		if (this.router !== null) {
			this.router.disconnect();
		}

	});

};


Server.isServer = isServer;


Server.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Server',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:   blob.data.events,
			journal:  blob.data.journal,
			services: {},
			settings: Object.assign({}, this._settings),
			stealth:  null,
			state:    {
				connected: false
			}
		};

		if (this.services !== null) {
			data.services = this.services.toJSON().data;
		}

		if (this.__state.connected === true) {
			data.state.connected = this.__state.connected;
		}

		return {
			'type': 'Server',
			'data': data
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			this.__state.server = new net.Server({
				allowHalfOpen:  true,
				pauseOnConnect: true
			});

			this.__state.server.on('connection', (socket) => {

				socket.once('data', (buffer) => {

					if (
						buffer[0] === 0x16
					) {

						let version = null;

						if (buffer[1] === 0x03 && buffer[2] === 0x00) {
							version = null;  // SSL 3.0 is deprecated
						} else if (buffer[1] === 0x03 && buffer[2] === 0x01) {
							version = '1.0'; // TLS 1.0 is deprecated, but most clients use this header out of fear to crash servers
						} else if (buffer[1] === 0x03 && buffer[2] === 0x02) {
							version = '1.1'; // TLS 1.1 is deprecated
						} else if (buffer[1] === 0x03 && buffer[2] === 0x03) {
							version = '1.2';
						} else if (buffer[1] === 0x03 && buffer[2] === 0x04) {
							version = '1.3';
						}

						// TLS Connection unsupported (as of now)
						if (version !== null) {
							socket.write('🛡️ TLS Version ' + version + ' not yet supported. Stay tuned!');
						}

						socket.end();

					} else if (this.proxy !== null && this.proxy.can(buffer) === true) {

						this.proxy.upgrade(buffer, socket);

					} else if (this.services !== null && this.services.can(buffer) === true) {

						this.services.upgrade(buffer, socket);

					} else if (this.webproxy !== null && this.webproxy.can(buffer) === true) {

						this.webproxy.upgrade(buffer, socket);

					} else if (this.webserver !== null && this.webserver.can(buffer) === true) {

						this.webserver.upgrade(buffer, socket);

					} else if (this.defender !== null && this.defender.can(buffer) === true) {

						this.defender.upgrade(buffer, socket);

					} else {

						// Probably a port scan
						socket.write('💻 They\'re trashing our rights!');
						socket.write('🌊 They\'re trashing the flow of data!');
						socket.write('🌍 Hack the planet!');
						socket.write('\r\n\r\r\r\n');
						socket.write('Calling fgets("/root/.workspace/.garbage")');

						socket.write('%p%s%s%s%s%n\n');
						socket.write('Bye.  لُلُصّبُلُلصّبُررً ॣ ॣh ॣ ॣ 冗');
						socket.write(':(){:|:&};:;\n');
						socket.write('(){0;}; rm -rf /;\n');
						socket.write('() { _; } >_[$($())] { rm -rf /; };\n');
						socket.write('<<< %s(un=\'%s\')=%u;\n');
						socket.write('+++ATH0\n');

						socket.end();

					}

				});

				socket.on('error',   () => socket.end());
				socket.on('close',   () => {});
				socket.on('timeout', () => socket.end());

				socket.resume();

			});

			this.__state.server.on('error', (err) => {

				if (err.code === 'EADDRINUSE') {
					console.error('Server: Another Server is already running!');
				}

				this.disconnect();

			});

			this.__state.server.on('listening', () => {

				let host = isString(this._settings.host) ? this._settings.host : 'localhost';

				console.info('Server: TCP Service for http+socks+ws://' + host + ':65432 started.');
				console.info('Server: > http://' + host + ':65432');

				if (ENVIRONMENT.ips.length > 0) {

					ENVIRONMENT.ips.forEach((ip) => {

						let hostname = toHostname(ip);
						if (hostname !== 'localhost') {
							console.info('Server: > http://' + hostname + ':65432');
						}

					});

				}

			});

			this.__state.server.on('close', () => {

				let host = isString(this._settings.host) ? this._settings.host : 'localhost';
				console.warn('Server: TCP Service for http+socks+ws://' + host + ':65432 stopped.');

				this.disconnect();

			});


			let host = null;

			if (isString(this._settings.host) === true) {

				if (this._settings.host !== 'localhost') {
					host = this._settings.host;
				}

			}

			this.__state.server.listen(65432, host);
			this.__state.connected = true;

			setTimeout(() => {
				this.emit('connect');
			}, 0);


			return true;

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			this.__state.connected = false;


			let interval = this.__state.interval;
			if (interval !== null) {

				this.__state.interval = null;

				clearInterval(interval);

			}

			let server = this.__state.server;
			if (server !== null) {

				this.__state.server = null;

				server.close();

			}

			this.emit('disconnect');

			return true;

		}


		return false;

	}

});


export { Server };


