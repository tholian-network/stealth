
import { Emitter }  from './Emitter.mjs';
import { Settings } from './service/Settings.mjs';



const Peer = function(browser, settings) {

	Emitter.call(this);


	this.host = settings.host || null;
	this.port = settings.port || null;

	this.services = {
		settings: new Settings(browser)
	};

	this.__socket = null;

};


Peer.prototype = Object.assign({}, Emitter.prototype, {

	connect: function(callback) {

		callback = callback instanceof Function ? callback : null;


		if (this.__socket !== null) {

			if (callback !== null) {
				callback(true);
			}

			return true;

		}


		let host = this.host;
		let port = this.port;

		if (host !== null && port !== null) {

			if (/:/g.test(host)) {
				this.__socket = new WebSocket('ws://[' + host + ']:' + port, [ 'stealth' ]);
			} else {
				this.__socket = new WebSocket('ws://' + host + ':' + port, [ 'stealth' ]);
			}


			this.__socket.onmessage = e => {

				let data = null;

				if (typeof e.data === 'string') {

					try {
						data = JSON.parse(e.data);
					} catch (err) {
						data = null;
					}

				}

				if (data !== null) {

					let service = data.service || null;
					let method  = data.method  || null;
					let payload = data.payload || null;

					if (service !== null && method !== null) {

						let instance = this.services[service] || null;
						if (instance !== null) {
							instance.emit(method, [ payload ]);
						}

					}

				}

			};

			this.__socket.ontimeout = _ => {
				if (this.__socket !== null) {
					this.__socket.close();
					this.__socket = null;
				}
			};

			this.__socket.onerror = _ => {
				if (this.__socket !== null) {
					this.__socket.close();
					this.__socket = null;
				}
			};

			this.__socket.onopen = _ => {
				if (callback !== null) {
					callback(true);
				}
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

		callback = callback instanceof Function ? callback : null;


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

	send: function(service, method, payload) {

		service = typeof service === 'string' ? service : null;
		method  = typeof method === 'string'  ? method  : null;
		payload = payload instanceof Object   ? payload : null;


		if (service !== null && method !== null) {

			if (this.__socket !== null) {

				this.__socket.send(JSON.stringify({
					service: service,
					method:  method,
					payload: payload
				}, null, '\t'));

				return true;

			}

		}


		return false;

	}

});


export { Peer };

