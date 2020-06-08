
import { Buffer, Emitter, isFunction, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                     } from './ENVIRONMENT.mjs';
import { Blocker                                         } from './client/Blocker.mjs';
import { Cache                                           } from './client/Cache.mjs';
import { Host                                            } from './client/Host.mjs';
import { Mode                                            } from './client/Mode.mjs';
import { Peer                                            } from './client/Peer.mjs';
import { Redirect                                        } from './client/Redirect.mjs';
import { Session                                         } from './client/Session.mjs';
import { Settings                                        } from './client/Settings.mjs';
import { URL                                             } from './parser/URL.mjs';



const isBrowser = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Browser]';
};

export const isClient = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Client]';
};

const receive = function(data) {

	let response = null;

	if (isString(data) === true) {

		try {
			response = JSON.parse(data);
		} catch (err) {
			response = null;
		}

	}

	return response;

};

const send = function(socket, request) {

	let data = null;

	try {
		data = JSON.stringify(request, null, '\t');
	} catch (err) {
		data = null;
	}

	if (data !== null) {

		let result = false;

		try {
			socket.send(data);
			result = true;
		} catch (err) {
			result = false;
		}

		return result;

	}


	return false;

};



const Client = function(settings, browser) {

	browser = isBrowser(browser) ? browser : null;


	this._settings = Object.freeze(Object.assign({
		host: null
	}, settings));


	this.address  = null;
	this.ref      = null;
	this.browser  = browser;
	this.services = {
		blocker:  new Blocker(this),
		cache:    new Cache(this),
		host:     new Host(this),
		mode:     new Mode(this),
		peer:     new Peer(this),
		redirect: new Redirect(this),
		session:  new Session(this),
		settings: new Settings(this)
	};

	this.__state = {
		connected: false,
		socket:    null
	};


	Emitter.call(this);

};


Client.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Client',

	connect: function() {

		if (this.__state.connected === false) {

			let host  = isString(this._settings.host) ? this._settings.host : ENVIRONMENT.hostname;
			let ref   = URL.parse('ws://' + host + ':65432');
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

			if (ref.domain === ENVIRONMENT.hostname || hosts.length > 0) {

				let server = ref.domain;

				// Ensure same websocket remote address as the iframe requests
				if (ref.domain !== ENVIRONMENT.hostname && hosts.length > 0) {

					let check = hosts.find((ip) => ip.scope === 'private') || null;
					if (check === null) {
						ref = URL.parse('wss://' + ENVIRONMENT.hostname + ':65432');
					}

					let host = hosts[0];
					if (host.type === 'v4') {
						server = host.ip;
					} else if (host.type === 'v6') {
						server = '[' + host.ip + ']';
					}

				}

				this.ref = ref;


				let socket = null;

				socket = new WebSocket(ref.protocol + '://' + server + ':' + ref.port, [ 'stealth' ]);

				socket.onmessage = (e) => {

					let response = receive(e.data);
					if (response !== null) {

						// Special case: Deserialize Buffer instances
						if (isObject(response.payload) === true) {

							let tmp_headers = response.payload.headers || null;
							let tmp_payload = response.payload.payload || null;

							if (tmp_headers !== null && tmp_payload !== null) {

								if (tmp_payload.type === 'Buffer') {
									response.payload.payload = Buffer.from(tmp_payload.data);
								}

							}

						}


						let event   = response.headers.event   || null;
						let service = response.headers.service || null;
						let method  = response.headers.method  || null;

						if (service !== null && event !== null) {

							let instance = this.services[service] || null;
							if (instance !== null) {

								let request = instance.emit(event, [ response.payload ]);
								if (request !== null) {
									send(socket, request);
								}

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {
									send(socket, request);
								}

							}

						} else if (service !== null && method !== null) {

							let instance = this.services[service] || null;
							if (instance !== null && isFunction(instance[method])) {

								instance[method](response.payload, (request) => {

									if (request !== null) {
										send(socket, request);
									}

								});

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {
									send(socket, request);
								}

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

				socket.onerror = () => {
					this.disconnect();
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

			let socket = this.__state.socket;
			if (socket !== null) {
				return send(socket, data);
			}

		}


		return false;

	}

});


export { Client };

