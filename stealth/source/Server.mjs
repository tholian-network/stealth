
import dgram from 'dgram';
import net   from 'net';

import { console, Emitter, isNumber, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                    } from '../source/ENVIRONMENT.mjs';
import { isStealth                                      } from '../source/Stealth.mjs';
import { IP                                             } from '../source/parser/IP.mjs';
import { Services                                       } from '../source/server/Services.mjs';
import { Proxy                                          } from '../source/server/Proxy.mjs';
import { Router                                         } from '../source/server/Router.mjs';
import { Webproxy                                       } from '../source/server/Webproxy.mjs';
import { Webserver                                      } from '../source/server/Webserver.mjs';



export const isServer = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Server]';
};



const toMulticastSocket = function(type, port, address) {

	type    = [ 'udp4', 'udp6' ].includes(type) ? type    : 'udp4';
	port    = isNumber(port)                    ? port    : null;
	address = isString(address)                 ? address : null;


	let socket = dgram.createSocket({
		type:      type,
		reuseAddr: true
	});

	socket.on('listening', () => {
		console.info('Server: ' + type.toUpperCase() + ' Service started on mdns+dns://' + (type === 'udp6' ? '[' + address + ']' : address) + ':' + port + '.');
	});

	socket.on('close', () => {
		console.warn('Server: ' + type.toUpperCase() + ' Service on port ' + port + ' stopped.');
	});

	socket.on('message', (buffer, rinfo) => {

		if (this.router.can(buffer) === true) {

			this.router.upgrade(buffer, socket, {
				host: rinfo.address,
				port: rinfo.port
			});

		}

	});

	if (port !== null) {

		if (address !== null) {

			socket.bind(port, () => {
				socket.addMembership(address);
			});

		} else {
			socket.bind(port);
		}

	}

	return socket;

};



const Server = function(settings, stealth) {

	settings = isObject(settings) ? settings : {};
	stealth  = isStealth(stealth) ? stealth  : null;


	this._settings = Object.freeze(Object.assign({
		host: null
	}, settings));


	this.stealth   = stealth;
	this.services  = new Services(this.stealth);
	this.proxy     = new Proxy(this.services, this.stealth);
	this.router    = new Router(this.services, this.stealth);
	this.webproxy  = new Webproxy(this.services, this.stealth);
	this.webserver = new Webserver(this.services, this.stealth);


	this.__state = {
		connected:   false,
		connections: [],
		sockets:     [],
		server:      null
	};


	Emitter.call(this);

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
				connected:   false,
				connections: []
			}
		};

		if (this.services !== null) {
			data.services = this.services.toJSON().data;
		}

		if (this.__state.connected === true) {
			data.state.connected = this.__state.connected;
		}

		if (this.__state.connections.length > 0) {

			this.__state.connections.forEach((connection) => {
				data.state.connections.push(connection.toJSON());
			});

		}

		return {
			'type': 'Server',
			'data': data
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			let ipv4s = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4');
			let ipv6s = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6');

			if (ipv4s.length > 0) {

				[
					toMulticastSocket.call(this, 'udp4', 5353,  '224.0.0.251'),
					toMulticastSocket.call(this, 'udp4', 65432, '224.0.0.251')
				].forEach((socket) => {
					this.__state.sockets.push(socket);
				});

			}

			if (ipv6s.length > 0) {

				[
					toMulticastSocket.call(this, 'udp6', 5353,  'ff02::fb'),
					toMulticastSocket.call(this, 'udp6', 65432, 'ff02::fb')
				].forEach((socket) => {
					this.__state.sockets.push(socket);
				});

			}


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

					} else if (this.proxy.can(buffer) === true) {

						this.proxy.upgrade(buffer, socket);

					} else if (this.services.can(buffer) === true) {

						this.services.upgrade(buffer, socket);

					} else if (this.webproxy.can(buffer) === true) {

						this.webproxy.upgrade(buffer, socket);

					} else if (this.webserver.can(buffer) === true) {

						this.webserver.upgrade(buffer, socket);

					} else {

						// Probably a port scan
						socket.write('💻 They\'re trashing our rights! They\'re trashing the flow of data! Hack the planet! 🌍');
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

				let host = 'localhost';

				if (isString(this._settings.host) === true) {
					host = this._settings.host;
				}

				console.info('Server: TCP Service started on http+socks+ws://' + host + ':65432.');
				console.info('Server: > http://' + host + ':65432.');

				if (ENVIRONMENT.ips.length > 0) {

					ENVIRONMENT.ips.forEach((ip) => {

						let hostname = null;

						if (ip.type === 'v4') {
							hostname = IP.render(ip);
						} else if (ip.type === 'v6') {
							hostname = '[' + IP.render(ip) + ']';
						}

						if (hostname !== null) {
							console.info('Server: > http://' + hostname + ':65432.');
						}

					});

				}

			});

			this.__state.server.on('close', () => {

				console.warn('Server: TCP Service on port 65432 stopped.');

				this.disconnect();

			});


			let host = null;

			if (isString(this._settings.host) === true) {

				if (this._settings.host !== 'localhost') {
					host = this._settings.host;
				}

			}

			this.__state.connected = true;
			this.emit('connect');

			this.__state.server.listen(65432, host);


			return true;

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connections.length > 0) {

			for (let c = 0, cl = this.__state.connections.length; c < cl; c++) {

				let connection = this.__state.connections[c] || null;
				if (connection !== null) {
					connection.disconnect();
				}

				this.__state.connections.splice(c, 1);
				cl--;
				c--;

			}

		}

		if (this.__state.connected === true) {

			this.__state.connected = false;

			let sockets = this.__state.sockets;
			if (sockets.length > 0) {

				this.__state.sockets = [];

				sockets.forEach((socket) => {
					socket.close();
				});

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


