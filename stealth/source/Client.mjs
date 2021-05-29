
import { Emitter, isFunction, isObject, isString } from '../extern/base.mjs';
import { isStealth                               } from '../source/Stealth.mjs';
import { Beacon                                  } from '../source/client/Beacon.mjs';
import { Blocker                                 } from '../source/client/Blocker.mjs';
import { Cache                                   } from '../source/client/Cache.mjs';
import { Host                                    } from '../source/client/Host.mjs';
import { Mode                                    } from '../source/client/Mode.mjs';
import { Peer                                    } from '../source/client/Peer.mjs';
import { Policy                                  } from '../source/client/Policy.mjs';
import { Redirect                                } from '../source/client/Redirect.mjs';
import { Session                                 } from '../source/client/Session.mjs';
import { Settings                                } from '../source/client/Settings.mjs';
import { URL                                     } from '../source/parser/URL.mjs';
import { WS                                      } from '../source/connection/WS.mjs';
import { WSS                                     } from '../source/connection/WSS.mjs';



export const isClient = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Client]';
};



const Client = function(settings, stealth) {

	settings = isObject(settings) ? settings : {};
	stealth  = isStealth(stealth) ? stealth  : null;


	this._settings = Object.freeze(Object.assign({
		host: null
	}, settings));


	this.address  = null;
	this.browser  = null; // API compatibility
	this.services = {};
	this.stealth  = stealth;
	this.url      = null;

	this.__state = {
		connected:  false,
		connection: null
	};


	this.services['beacon']   = new Beacon(this);
	this.services['blocker']  = new Blocker(this);
	this.services['cache']    = new Cache(this);
	this.services['host']     = new Host(this);
	this.services['mode']     = new Mode(this);
	this.services['peer']     = new Peer(this);
	this.services['policy']   = new Policy(this);
	this.services['redirect'] = new Redirect(this);
	this.services['session']  = new Session(this);
	this.services['settings'] = new Settings(this);


	Emitter.call(this);

};


Client.isClient = isClient;


Client.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Client',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			browser:  null,
			events:   blob.data.events,
			journal:  blob.data.journal,
			settings: Object.assign({}, this._settings),
			services: {},
			state:    {
				connected:  false,
				connection: null
			},
			stealth:  null,
			url:      URL.render(this.url),
		};

		Object.keys(this.services).forEach((service) => {
			data.services[service] = this.services[service].toJSON();
		});

		if (this.__state.connected === true) {
			data.state.connected = true;
		}

		if (this.__state.connection !== null) {
			data.state.connection = this.__state.connection.toJSON();
		}

		return {
			'type': 'Client',
			'data': data
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			let host  = isString(this._settings.host) ? this._settings.host : 'localhost';
			let url   = URL.parse('ws://' + host + ':65432');
			let hosts = url.hosts.sort((a, b) => {

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

				let check = hosts.find((ip) => ip.scope === 'private') || null;
				if (check === null) {
					url = URL.parse('wss://' + host + ':65432');
				}

			}


			this.url = url;


			let connection = null;
			if (url.protocol === 'wss') {
				connection = WSS.connect(this.url);
			} else if (url.protocol === 'ws') {
				connection = WS.connect(this.url);
			}


			if (connection !== null) {

				connection.on('@connect', () => {

					if (connection.socket !== null) {
						this.address = connection.socket.remoteAddress || null;
					}

					this.__state.connected  = true;
					this.__state.connection = connection;

					this.emit('connect');

				});

				connection.on('response', (response) => {

					if (response !== null) {

						let event   = response.headers.event   || null;
						let method  = response.headers.method  || null;
						let service = response.headers.service || null;

						if (service !== null && event !== null) {

							let instance = this.services[service] || null;
							if (instance !== null && instance.has(event) === true) {

								let request = instance.emit(event, [ response.payload ]);
								if (request !== null) {

									if (url.protocol === 'wss') {
										WSS.send(connection, request);
									} else if (url.protocol === 'ws') {
										WS.send(connection, request);
									}

								}

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {

									if (url.protocol === 'wss') {
										WSS.send(connection, request);
									} else if (url.protocol === 'ws') {
										WS.send(connection, request);
									}

								}

							}

						} else if (service !== null && method !== null) {

							let instance = this.services[service] || null;
							if (instance !== null && isFunction(instance[method]) === true) {

								instance[method](response.payload, (request) => {

									if (request !== null) {

										if (url.protocol === 'wss') {
											WSS.send(connection, request);
										} else if (url.protocol === 'ws') {
											WS.send(connection, request);
										}

									}

								});

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {

									if (request !== null) {

										if (url.protocol === 'wss') {
											WSS.send(connection, request);
										} else if (url.protocol === 'ws') {
											WS.send(connection, request);
										}

									}

								}

							}

						}

					}

				});

				connection.on('error', () => {

					let result = this.disconnect();
					if (result === false) {
						this.emit('disconnect');
					}

				});

				connection.on('@disconnect', () => {
					this.disconnect();
				});

				return true;

			}

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			this.__state.connected = false;


			let connection = this.__state.connection || null;
			if (connection !== null) {
				this.__state.connection = null;
				connection.disconnect();
			}


			this.emit('disconnect');

			return true;

		}


		return false;

	},

	is: function(state) {

		state = isString(state) ? state : null;


		if (state === 'connected') {

			if (this.__state.connected === true) {
				return true;
			}

		}


		return false;

	},

	send: function(data) {

		data = isObject(data) ? data : null;


		if (data !== null) {

			let connection = this.__state.connection || null;
			if (connection !== null && this.url !== null) {

				if (this.url.protocol === 'wss') {
					WSS.send(connection, data);
				} else if (this.url.protocol === 'ws') {
					WS.send(connection, data);
				}

				return true;

			}

		}


		return false;

	}

});


export { Client };

