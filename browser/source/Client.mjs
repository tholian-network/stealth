
import { Emitter  } from './Emitter.mjs';
import { Cache    } from './service/Cache.mjs';
import { Filter   } from './service/Filter.mjs';
import { Host     } from './service/Host.mjs';
import { Peer     } from './service/Peer.mjs';
import { Settings } from './service/Settings.mjs';
import { Site     } from './service/Site.mjs';



const _update_session = function(session) {

	this.__id = session;

	try {
		document.cookie = 'session=' + session + ';path=/stealth';
	} catch (err) {
		// Do nothing
	}

};



const Client = function(browser) {

	Emitter.call(this);


	this.services = {
		cache:    new Cache(browser, this),
		filter:   new Filter(browser, this),
		host:     new Host(browser, this),
		peer:     new Peer(browser, this),
		settings: new Settings(browser, this),
		site:     new Site(browser, this)
	};

	this.__id     = null;
	this.__socket = null;

};


Client.prototype = Object.assign({}, Emitter.prototype, {

	connect: function(host, port, callback) {

		host     = typeof host === 'string'       ? host     : 'localhost';
		port     = typeof port === 'number'       ? port     : 65432;
		callback = typeof callback === 'function' ? callback : null;


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

				if (typeof e.data === 'string') {

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
						_update_session.call(this, session);
					}

					if (service !== null && event !== null) {

						let instance = this.services[service] || null;
						if (instance !== null) {
							instance.emit(event, [ request.payload ]);
						}

					} else if (service !== null && method !== null) {

						let instance = this.services[service] || null;
						if (instance !== null && typeof instance[method] === 'function') {
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
				_update_session.call(this, null);
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

		callback = typeof callback === 'function' ? callback : null;


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

		data = data instanceof Object ? data : null;


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

