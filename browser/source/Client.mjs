
import { Buffer, Emitter, isFunction, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                     } from '../source/ENVIRONMENT.mjs';
import { Beacon                                          } from '../source/client/service/Beacon.mjs';
import { Blocker                                         } from '../source/client/service/Blocker.mjs';
import { Cache                                           } from '../source/client/service/Cache.mjs';
import { Host                                            } from '../source/client/service/Host.mjs';
import { Mode                                            } from '../source/client/service/Mode.mjs';
import { Peer                                            } from '../source/client/service/Peer.mjs';
import { Policy                                          } from '../source/client/service/Policy.mjs';
import { Redirect                                        } from '../source/client/service/Redirect.mjs';
import { Session                                         } from '../source/client/service/Session.mjs';
import { Settings                                        } from '../source/client/service/Settings.mjs';
import { Task                                            } from '../source/client/service/Task.mjs';
import { URL                                             } from '../source/parser/URL.mjs';



const isArrayBuffer = function(obj) {
	return Object.prototype.toString.call(obj) === '[object ArrayBuffer]';
};

const isEvent = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Event]';
};

const isErrorEvent = function(obj) {
	return Object.prototype.toString.call(obj) === '[object ErrorEvent]';
};

const isBrowser = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Browser]';
};

export const isClient = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Client]';
};

const toResponse = function(data) {

	let response = null;

	if (isArrayBuffer(data) === true) {

		try {
			response = JSON.parse(Buffer.from(data));
		} catch (err) {
			response = null;
		}

	} else if (isString(data) === true) {

		try {
			response = JSON.parse(Buffer.from(data, 'utf8'));
		} catch (err) {
			response = null;
		}

	}

	if (response !== null) {

		// Special case: Deserialize Buffer instances
		if (
			isObject(response) === true
			&& isObject(response.headers) === true
			&& isObject(response.payload) === true
		) {

			let tmp_headers = response.payload.headers || null;
			let tmp_payload = response.payload.payload || null;

			if (tmp_headers !== null && tmp_payload !== null) {

				if (tmp_payload.type === 'Buffer') {
					response.payload.payload = Buffer.from(tmp_payload.data);
				}

			}

		}

	}

	return response;

};



const Client = function(settings, browser) {

	browser = isBrowser(browser) ? browser : null;


	this._settings = Object.freeze(Object.assign({
		host: null
	}, settings));


	this.browser  = browser;
	this.services = {};
	this.stealth  = null; // API compatibility
	this.url      = null;

	this.__state = {
		connected: false,
		socket:    null
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
	this.services['task']     = new Task(this);


	Emitter.call(this);

};


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
			url:      URL.render(this.url)
		};

		Object.keys(this.services).forEach((service) => {
			data.services[service] = this.services[service].toJSON();
		});

		if (this.__state.connected === true) {
			data.state.connected = true;
		}

		if (this.__state.socket !== null) {
			data.state.connection = {
				'type': 'Connection',
				'data': {
					local:  this.__state.socket[Symbol.for('local')]  || null,
					remote: this.__state.socket[Symbol.for('remote')] || null
				}
			};
		}

		return {
			'type': 'Client',
			'data': data
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			let host  = isString(this._settings.host) ? this._settings.host : ENVIRONMENT.hostname;
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


			if (host !== ENVIRONMENT.hostname) {

				let check = hosts.find((ip) => ip.scope === 'private') || null;
				if (check === null) {

					if (ENVIRONMENT.secure === true) {
						url = URL.parse('wss://' + ENVIRONMENT.hostname + ':65432');
					} else {
						url = URL.parse('ws://' + ENVIRONMENT.hostname + ':65432');
					}

				}

			}


			let server = null;

			if (url.domain !== null) {

				if (url.subdomain !== null) {
					server = url.subdomain + '.' + url.domain;
				} else {
					server = url.domain;
				}

			} else if (url.host !== null) {
				server = url.host;
			}


			this.url = url;


			let socket = null;

			try {
				socket = new WebSocket(url.protocol + '://' + server + ':' + url.port, [ 'stealth' ]);
			} catch (err) {
				socket = null;
			}


			if (socket !== null) {

				socket[Symbol.for('local')]  = ENVIRONMENT.hostname;
				socket[Symbol.for('remote')] = server;
				socket.binaryType            = 'arraybuffer';

				socket.onmessage = (e) => {

					let response = toResponse(e.data);

					if (
						isObject(response) === true
						&& isObject(response.headers) === true
						&& response.payload !== undefined
					) {

						let event   = response.headers['event']   || null;
						let service = response.headers['service'] || null;
						let method  = response.headers['method']  || null;

						if (isString(service) === true && isString(event) === true) {

							let instance = this.services[service] || null;
							if (instance !== null && instance.has(event) === true) {

								let request = instance.emit(event, [ response.payload ]);
								if (request !== null) {
									this.send(request);
								}

							}

						} else if (isString(service) === true && isString(method) === true) {

							let instance = this.services[service] || null;
							if (instance !== null && isFunction(instance[method]) === true) {

								instance[method](response.payload, (request) => {

									if (request !== null) {
										this.send(request);
									}

								});

							}

						}

					}

				};

				socket.onclose = () => {
					this.disconnect();
				};

				socket.ontimeout = () => {
					this.disconnect();
				};

				socket.onerror = (event) => {

					if (isErrorEvent(event) === true) {

						this.__state.connected = false;
						this.__state.socket    = null;

						this.emit('disconnect');

					} else if (isEvent(event) === true) {

						this.__state.connected = false;
						this.__state.socket    = null;

						this.emit('disconnect');

					} else {

						let result = this.disconnect();
						if (result === false) {
							this.emit('disconnect');
						}

					}

				};

				socket.onopen = () => {

					this.__state.connected = true;
					this.__state.socket    = socket;

					this.emit('connect');

				};

				return true;

			}

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			let socket = this.__state.socket || null;
			if (socket !== null) {
				socket.close();
			}

			this.__state.connected = false;
			this.__state.socket    = null;

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

			let payload = null;
			let socket  = this.__state.socket;

			try {

				let buffer = Buffer.from(JSON.stringify(data, null, '\t'), 'utf8');

				payload = new Uint8Array(buffer.length);

				for (let b = 0, bl = buffer.length; b < bl; b++) {
					payload[b] = buffer[b];
				}

			} catch (err) {
				payload = null;
			}

			if (socket !== null && payload !== null) {

				let result = false;

				try {
					socket.send(payload);
					result = true;
				} catch (err) {
					result = false;
				}

				return result;

			}

		}


		return false;

	}

});


export { Client };

