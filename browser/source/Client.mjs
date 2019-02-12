
import { Emitter  } from './Emitter.mjs';
import { Cache    } from './client/Cache.mjs';
import { Filter   } from './client/Filter.mjs';
import { Host     } from './client/Host.mjs';
import { Mode     } from './client/Mode.mjs';
import { Peer     } from './client/Peer.mjs';
import { Settings } from './client/Settings.mjs';



const _settingsify = function(payload) {

	if (Object.isObject(payload)) {

		payload.internet = Object.isObject(payload.internet) ? payload.internet : null;
		payload.filters  = Array.isArray(payload.filters)    ? payload.filters  : null;
		payload.hosts    = Array.isArray(payload.hosts)      ? payload.hosts    : null;
		payload.modes    = Array.isArray(payload.modes)      ? payload.modes    : null;
		payload.peers    = Array.isArray(payload.peers)      ? payload.peers    : null;

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

		host     = String.isString(host)         ? host     : 'localhost';
		port     = Number.isNumber(port)         ? port     : 65432;
		callback = Function.isFunction(callback) ? callback : null;


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


			this.__socket.onmessage = e => {

				let request = null;

				if (String.isString(e.data)) {

					try {
						request = JSON.parse(e.data);
					} catch (err) {
						request = null;
					}

				}

				if (request !== null) {

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
							instance.emit(event, [ request.payload ]);
						}

					} else if (service !== null && method !== null) {

						let instance = this.services[service] || null;
						if (instance !== null && Function.isFunction(instance[method])) {
							instance[method](request.payload, response => {
								if (response !== null) {
									this.__socket.send(JSON.stringify(response, null, '\t'));
								}
							});
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

		callback = Function.isFunction(callback) ? callback : null;


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

		data = Object.isObject(data) ? data : null;


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

