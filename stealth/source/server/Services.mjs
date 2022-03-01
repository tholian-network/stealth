
import net from 'net';

import { console, Buffer, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { isStealth                                                           } from '../../source/Stealth.mjs';
import { WS                                                                  } from '../../source/connection/WS.mjs';
import { HTTP as PACKET                                                      } from '../../source/packet/HTTP.mjs';
import { IP                                                                  } from '../../source/parser/IP.mjs';
import { Beacon                                                              } from '../../source/server/service/Beacon.mjs';
import { Blocker                                                             } from '../../source/server/service/Blocker.mjs';
import { Cache                                                               } from '../../source/server/service/Cache.mjs';
import { Echo                                                                } from '../../source/server/service/Echo.mjs';
import { Host                                                                } from '../../source/server/service/Host.mjs';
import { Mode                                                                } from '../../source/server/service/Mode.mjs';
import { Peer                                                                } from '../../source/server/service/Peer.mjs';
import { Policy                                                              } from '../../source/server/service/Policy.mjs';
import { Redirect                                                            } from '../../source/server/service/Redirect.mjs';
import { Session                                                             } from '../../source/server/service/Session.mjs';
import { Settings                                                            } from '../../source/server/service/Settings.mjs';
import { Task                                                                } from '../../source/server/service/Task.mjs';



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

		this.stealth = stealth;

		this.__state = {
			connections: {}
		};

		this['beacon']   = new Beacon(stealth);
		this['blocker']  = new Blocker(stealth);
		this['cache']    = new Cache(stealth);
		this['echo']     = new Echo(stealth);
		this['host']     = new Host(stealth);
		this['mode']     = new Mode(stealth);
		this['peer']     = new Peer(stealth);
		this['policy']   = new Policy(stealth);
		this['redirect'] = new Redirect(stealth);
		this['session']  = new Session(stealth);
		this['settings'] = new Settings(stealth);
		this['task']     = new Task(stealth);

	} else {

		this.stealth = null;

		this.__state = {
			connections: {}
		};

		this['beacon']   = null;
		this['blocker']  = null;
		this['cache']    = null;
		this['echo']     = null;
		this['host']     = null;
		this['mode']     = null;
		this['peer']     = null;
		this['policy']   = null;
		this['redirect'] = null;
		this['session']  = null;
		this['settings'] = null;
		this['task']     = null;

	}

};


Services.prototype = {

	[Symbol.toStringTag]: 'Services',

	toJSON: function() {

		let data = {
			'beacon':   null,
			'blocker':  null,
			'cache':    null,
			'echo':     null,
			'host':     null,
			'mode':     null,
			'peer':     null,
			'policy':   null,
			'redirect': null,
			'session':  null,
			'settings': null,
			'task':     null
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

		if (this['echo'] !== null) {
			data['echo'] = this['echo'].toJSON();
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

		if (this['task'] !== null) {
			data['task'] = this['task'].toJSON();
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
						&& isString(packet.headers['connection']) === true
						&& packet.headers['connection'].toLowerCase() === 'upgrade'
						&& isString(packet.headers['upgrade']) === true
						&& packet.headers['upgrade'].toLowerCase() === 'websocket'
						&& isString(packet.headers['sec-websocket-key']) === true
						&& isNumber(packet.headers['sec-websocket-version']) === true
						&& packet.headers['sec-websocket-version'] === 13
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

				let remote = connection.toJSON().data['remote'];

				connection.once('@connect', () => {

					if (this.stealth !== null) {

						connection.session = this.stealth.track(null, remote);

						if (this.stealth._settings.debug === true) {

							let host = IP.render(remote['host']);
							if (host !== null) {

								if (this.__state.connections[host] === undefined) {
									console.log('Services: Client "' + host + '" connected.');
									this.__state.connections[host] = 1;
								} else if (isNumber(this.__state.connections[host]) === true) {
									this.__state.connections[host]++;
								}

							}

						}

					}

				});

				connection.once('error', (err) => {

					if (connection.session !== null) {
						connection.session.warn('Services:error', err);
					}

					connection.off('request');
					connection.disconnect();

				});

				connection.on('request', (frame) => {

					if (
						isObject(frame.headers) === true
						&& frame.headers['@type'] === 'request'
						&& (frame.headers['@operator'] === 0x01 || frame.headers['@operator'] === 0x02)
						&& isBuffer(frame.payload) === true
					) {

						let request = null;

						try {
							request = JSON.parse(frame.payload.toString('utf8'));
						} catch (err) {
							request = null;
						}

						if (
							isObject(request) === true
							&& isObject(request.headers) === true
							&& request.payload !== undefined
						) {

							let event   = request.headers['event']   || null;
							let method  = request.headers['method']  || null;
							let service = request.headers['service'] || null;

							// XXX: Nice try though
							if (service === 'stealth' || service === '__state') {
								service = null;
							}

							if (isString(service) === true && isString(event) === true) {

								let instance = this[service] || null;
								if (instance !== null && instance.has(event) === true) {

									let response = instance.emit(event, [ request.payload, connection.session ]);
									if (response !== null) {

										let payload = null;

										try {
											payload = Buffer.from(JSON.stringify(response, null, '\t'), 'utf8');
										} catch (err) {
											payload = null;
										}

										if (payload !== null) {

											WS.send(connection, {
												headers: {
													'@operator': frame.headers['@operator'],
													'@type':     'response'
												},
												payload: payload
											});

										}

										if (response._warn_ === true) {

											if (connection.session !== null) {
												connection.session.warn('Services:request', {
													service: service,
													method:  method,
													event:   event
												});
											}

										}

									}

								} else {

									if (connection.session !== null) {
										connection.session.warn('Services:request', {
											service: service,
											method:  method,
											event:   event
										});
									}

								}

							} else if (isString(service) === true && isString(method) === true) {

								let instance = this[service] || null;
								if (instance !== null && isFunction(instance[method]) === true) {

									instance[method](request.payload, (response) => {

										if (response !== null) {

											let payload = null;

											try {
												payload = Buffer.from(JSON.stringify(response, null, '\t'), 'utf8');
											} catch (err) {
												payload = null;
											}

											if (payload !== null) {

												WS.send(connection, {
													headers: {
														'@operator': frame.headers['@operator'],
														'@type':     'response'
													},
													payload: payload
												});

											}

											if (response._warn_ === true) {

												if (connection.session !== null) {
													connection.session.warn('Services:request', {
														service: service,
														method:  method,
														event:   event
													});
												}

											}

										}

									}, connection.session);

								} else {

									if (connection.session !== null) {
										connection.session.warn('Services:request', {
											service: service,
											method:  method,
											event:   event
										});
									}

								}

							} else {

								if (connection.session !== null) {
									connection.session.warn('Services:request', {
										service: service,
										method:  method,
										event:   event
									});
								}

								connection.disconnect();

							}

						}

					}

				});

				connection.once('@disconnect', () => {

					if (this.stealth !== null) {

						if (this.stealth._settings.debug === true) {

							let host = IP.render(remote['host']);
							if (host !== null) {

								if (isNumber(this.__state.connections[host]) === true) {
									this.__state.connections[host]--;
								}

								setTimeout(() => {

									if (this.__state.connections[host] === 0) {
										console.log('Services: Client "' + host + '" disconnected.');
										delete this.__state.connections[host];
									}

								}, 60000);

							}

						}

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

