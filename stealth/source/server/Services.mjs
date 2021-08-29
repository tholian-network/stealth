
import net from 'net';

import { console, isBuffer, isFunction } from '../../extern/base.mjs';
import { isStealth                     } from '../../source/Stealth.mjs';
import { WS                            } from '../../source/connection/WS.mjs';
import { HTTP as PACKET                } from '../../source/packet/HTTP.mjs';
import { Beacon                        } from '../../source/server/service/Beacon.mjs';
import { Blocker                       } from '../../source/server/service/Blocker.mjs';
import { Cache                         } from '../../source/server/service/Cache.mjs';
import { Host                          } from '../../source/server/service/Host.mjs';
import { Mode                          } from '../../source/server/service/Mode.mjs';
import { Peer                          } from '../../source/server/service/Peer.mjs';
import { Policy                        } from '../../source/server/service/Policy.mjs';
import { Redirect                      } from '../../source/server/service/Redirect.mjs';
import { Session                       } from '../../source/server/service/Session.mjs';
import { Settings                      } from '../../source/server/service/Settings.mjs';



export const isServices = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Services]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};



const Services = function(stealth) {

	stealth = isStealth(stealth) ? stealth : null;


	if (stealth !== null) {

		this.stealth     = stealth;

		this['beacon']   = new Beacon(stealth);
		this['blocker']  = new Blocker(stealth);
		this['cache']    = new Cache(stealth);
		this['host']     = new Host(stealth);
		this['mode']     = new Mode(stealth);
		this['peer']     = new Peer(stealth);
		this['policy']   = new Policy(stealth);
		this['redirect'] = new Redirect(stealth);
		this['session']  = new Session(stealth);
		this['settings'] = new Settings(stealth);

	} else {

		this.stealth     = null;

		this['beacon']   = null;
		this['blocker']  = null;
		this['cache']    = null;
		this['host']     = null;
		this['mode']     = null;
		this['peer']     = null;
		this['policy']   = null;
		this['redirect'] = null;
		this['session']  = null;
		this['settings'] = null;

	}

};


Services.prototype = {

	[Symbol.toStringTag]: 'Services',

	toJSON: function() {

		let data = {
			'beacon':   null,
			'blocker':  null,
			'cache':    null,
			'host':     null,
			'mode':     null,
			'peer':     null,
			'policy':   null,
			'redirect': null,
			'session':  null,
			'settings': null
		};


		if (this['beacon'] !== null) {
			data['beacon'] = this['beacon'].toJSON();
		}

		if (this['blocker'] !== null) {
			data['blocker'] = this['blocker'].toJSON();
		}

		if (this['cache'] !== null) {
			data['cache'] = this['cache'].toJSON();
		}

		if (this['host'] !== null) {
			data['host'] = this['host'].toJSON();
		}

		if (this['mode'] !== null) {
			data['mode'] = this['mode'].toJSON();
		}

		if (this['peer'] !== null) {
			data['peer'] = this['peer'].toJSON();
		}

		if (this['policy'] !== null) {
			data['policy'] = this['policy'].toJSON();
		}

		if (this['redirect'] !== null) {
			data['redirect'] = this['redirect'].toJSON();
		}

		if (this['session'] !== null) {
			data['session'] = this['session'].toJSON();
		}

		if (this['settings'] !== null) {
			data['settings'] = this['settings'].toJSON();
		}


		return {
			'type': 'Services',
			'data': data
		};

	},

	can: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (PACKET.isPacket(buffer) === true) {

				let packet = PACKET.decode(null, buffer);
				if (packet !== null) {

					if (
						packet.headers['@method'] === 'GET'
						&& (packet.headers['connection'] || '').toLowerCase() === 'upgrade'
						&& (packet.headers['upgrade'] || '').toLowerCase() === 'websocket'
					) {
						return true;
					}

				}

			}

		}


		return false;

	},

	upgrade: function(buffer, socket) {

		buffer = isBuffer(buffer) ? buffer : null;
		socket = isSocket(socket) ? socket : null;


		let packet = PACKET.decode(null, buffer);
		if (packet !== null) {

			if (this.stealth !== null) {
				packet.headers['@debug'] = this.stealth._settings.debug;
			}


			let connection = WS.upgrade(socket, packet);
			if (connection !== null) {

				connection.once('@connect', () => {

					if (this.stealth !== null) {
						connection.session = this.stealth.track(null, packet.headers);
					}

					if (this.stealth !== null && this.stealth._settings.debug === true) {
						console.log('Services: Client "' + connection.toJSON().remote + '" connected.');
					}

				});

				connection.once('error', () => {

					if (this.stealth !== null) {
						this.stealth.untrack(connection.session);
						connection.session = null;
					}

				});

				connection.on('request', (request) => {

					let event   = request.headers.event   || null;
					let method  = request.headers.method  || null;
					let service = request.headers.service || null;

					if (service !== null && service !== 'stealth' && event !== null) {

						let instance = this[service] || null;
						if (instance !== null && instance.has(event) === true) {

							let response = instance.emit(event, [ request.payload, connection.session ]);
							if (response !== null) {
								WS.send(connection, response);
							}

							if (response !== null && response._warn_ === true) {

								let session = connection.session || null;
								if (session !== null) {
									session.warn(service, method, null);
								}

							}

						}

					} else if (service !== null && service !== 'stealth' && method !== null) {

						let instance = this[service] || null;
						if (instance !== null && isFunction(instance[method]) === true) {

							instance[method](request.payload, (response) => {

								if (response !== null) {
									WS.send(connection, response);
								}

								if (response !== null && response._warn_ === true) {

									let session = connection.session || null;
									if (session !== null) {
										session.warn(service, method, null);
									}

								}

							}, connection.session);

						}

					}

				});

				connection.once('@disconnect', () => {

					if (this.stealth !== null && this.stealth._settings.debug === true) {
						console.log('Proxy: Client "' + connection.toJSON().remote + '" disconnected.');
					}

					if (this.stealth !== null) {
						this.stealth.untrack(connection.session);
						connection.session = null;
					}

				});

				return connection;

			} else {

				socket.end();

			}

		} else {

			socket.end();

		}


		return null;

	}

};


export { Services };

