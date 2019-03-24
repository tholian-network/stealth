
import { Buffer, isArray, isFunction, isNumber, isObject, isString } from './POLYFILLS.mjs';

import { Emitter  } from './Emitter.mjs';
import { Cache    } from './client/Cache.mjs';
import { Filter   } from './client/Filter.mjs';
import { Host     } from './client/Host.mjs';
import { Mode     } from './client/Mode.mjs';
import { Peer     } from './client/Peer.mjs';
import { Redirect } from './client/Redirect.mjs';
import { Settings } from './client/Settings.mjs';



const _settingsify = function(payload) {

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

		let data = _settingsify(response);
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

			if (/:/g.test(host)) {
				this.__socket = new WebSocket('ws://[' + host + ']:' + port, [ 'stealth' ]);
			} else {
				this.__socket = new WebSocket('ws://' + host + ':' + port, [ 'stealth' ]);
			}


			this.__socket.onmessage = (e) => {

				let request = null;

				if (isString(e.data)) {

					try {
						request = JSON.parse(e.data);
					} catch (err) {
						request = null;
					}

				}

				if (request !== null) {

					// XXX: Special case: Deserialize Buffer instances
					if (isObject(request.payload) === true) {

						let tmp_headers = request.payload.headers || null;
						let tmp_payload = request.payload.payload || null;

						if (tmp_headers !== null && tmp_payload !== null) {

							if (tmp_payload.type === 'Buffer') {
								request.payload.payload = Buffer.from(tmp_payload.data);
							}

						}

					}


					let event   = request.headers.event   || null;
					let service = request.headers.service || null;
					let session = request.headers.session || null;
					let method  = request.headers.method  || null;

					if (session !== null) {
						this.emit('session', [ session ]);
					}

					if (service !== null && event !== null) {

						let instance = this.services[service] || null;
						if (instance !== null) {
							let response = instance.emit(event, [ request.payload ]);
							if (response !== null) {
								this.__socket.send(JSON.stringify(response, null, '\t'));
							}
						} else {
							let response = this.emit('request', [ request ]);
							if (response !== null) {
								this.__socket.send(JSON.stringify(response, null, '\t'));
							}
						}

					} else if (service !== null && method !== null) {

						let instance = this.services[service] || null;
						if (instance !== null && isFunction(instance[method])) {
							instance[method](request.payload, (response) => {
								if (response !== null) {
									this.__socket.send(JSON.stringify(response, null, '\t'));
								}
							});
						} else {
							let response = this.emit('request', [ request ]);
							if (response !== null) {
								this.__socket.send(JSON.stringify(response, null, '\t'));
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
				this.emit('session', [ null ]);
			};


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

				this.__socket.send(JSON.stringify(data, null, '\t'));

				return true;

			}

		}


		return false;

	}

});


export { Client };

