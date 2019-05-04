
import { Buffer, isArray, isFunction, isObject, isString } from './POLYFILLS.mjs';

import { Emitter  } from './Emitter.mjs';
import { Cache    } from './client/Cache.mjs';
import { Filter   } from './client/Filter.mjs';
import { Host     } from './client/Host.mjs';
import { Mode     } from './client/Mode.mjs';
import { Peer     } from './client/Peer.mjs';
import { Redirect } from './client/Redirect.mjs';
import { Settings } from './client/Settings.mjs';
import { URL      } from './parser/URL.mjs';

const HOSTNAME = (function(location) {

	let hostname = location.hostname || null;
	if (hostname !== null) {
		return hostname;
	}

	return 'localhost';

})(window.location);



const receive = function(data) {

	let response = null;

	if (isString(data)) {

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
		socket.send(data);
	}

};

const settingsify = function(payload) {

	if (isObject(payload)) {

		payload.internet = isObject(payload.internet) ? payload.internet : null;
		payload.filters  = isArray(payload.filters)   ? payload.filters  : null;
		payload.hosts    = isArray(payload.hosts)     ? payload.hosts    : null;
		payload.modes    = isArray(payload.modes)     ? payload.modes    : null;
		payload.peers    = isArray(payload.peers)     ? payload.peers    : null;

		return payload;

	}

	return null;

};



const Client = function(browser) {

	this.browser = browser;
	Emitter.call(this);


	this.services = {
		cache:    new Cache(this),
		filter:   new Filter(this),
		host:     new Host(this),
		mode:     new Mode(this),
		peer:     new Peer(this),
		redirect: new Redirect(this),
		settings: new Settings(this)
	};

	this.__socket = null;


	this.services.settings.on('read', (response) => {

		let data = settingsify(response);
		if (data !== null) {

			let internet = data.internet || null;
			if (internet !== null) {
				browser.settings.internet = internet;
			}

			let filters = data.filters || null;
			if (filters !== null) {
				browser.settings.filters = filters;
			}

			let hosts = data.hosts || null;
			if (hosts !== null) {
				browser.settings.hosts = hosts;
			}

			let modes = data.modes || null;
			if (modes !== null) {
				browser.settings.modes = modes;
			}

			let peers = data.peers || null;
			if (peers !== null) {
				browser.settings.peers = peers;
			}

		}

	});

};


Client.prototype = Object.assign({}, Emitter.prototype, {

	connect: function(host, callback) {

		host     = isString(host)       ? host     : HOSTNAME;
		callback = isFunction(callback) ? callback : null;


		if (this.__socket !== null) {

			if (callback !== null) {
				callback(true);
			}

			return true;

		}


		if (host !== null) {

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

			if (hosts.length > 0) {

				let check = hosts.find((ip) => ip.scope === 'private') || null;
				if (check === null) {
					ref = URL.parse('wss://' + host + ':65432');
				}


				let host   = hosts[0];
				let server = host.ip;

				if (host.type === 'v6') {
					server = '[' + host.ip + ']';
				}

				this.__socket = new WebSocket(ref.protocol + '://' + server + ':' + ref.port, [ 'stealth' ]);

				this.__socket.onmessage = (e) => {

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
									send(this.__socket, request);
								}

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {
									send(this.__socket, request);
								}

							}

						} else if (service !== null && method !== null) {

							let instance = this.services[service] || null;
							if (instance !== null && isFunction(instance[method])) {

								instance[method](response.payload, (request) => {

									if (request !== null) {
										send(this.__socket, request);
									}

								});

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {
									send(this.__socket, request);
								}

							}

						}

					}

				};

				this.__socket.ontimeout = () => {

					if (this.__socket !== null) {
						this.__socket.close();
						this.__socket = null;
					}

				};

				this.__socket.onerror = () => {

					if (this.__socket !== null) {
						this.__socket.close();
						this.__socket = null;
					}

				};

				this.__socket.onopen = () => {

					if (callback !== null) {
						callback(true);
					}

				};

				this.__socket.onclose = () => {
					this.__socket = null;
				};

				return true;

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	disconnect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.__socket !== null) {

			this.__socket.close();

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

				send(this.__socket, data);

				return true;

			}

		}


		return false;

	}

});


export { Client };

