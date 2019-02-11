
import { Emitter } from '../Emitter.mjs';



const _responsify = function(payload) {

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


const Settings = function(browser, client) {

	Emitter.call(this);


	this.browser = browser;
	this.client  = client || browser.client;

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = Object.isObject(payload)      ? payload  : null;
		callback = Function.isFunction(callback) ? callback : null;


		if (callback !== null) {

			this.once('read', response => {

				response = Object.isObject(response) ? _responsify(response) : null;


				let settings = this.browser.settings;

				if (response !== null) {

					if (response.internet !== null) {
						settings.internet = response.internet;
					}

					if (response.filters !== null) {
						settings.filters = response.filters;
					}

					if (response.hosts !== null) {
						settings.hosts = response.hosts;
					}

					if (response.modes !== null) {
						settings.modes = response.modes;
					}

					if (response.peers !== null) {
						settings.peers = response.peers;
					}

				}

				callback(settings);

			});

			this.client.send({
				headers: {
					service: 'settings',
					method:  'read'
				},
				payload: null
			});

		}

	},

	save: function(payload, callback) {

		payload  = Object.isObject(payload)      ? payload  : null;
		callback = Function.isFunction(callback) ? callback : null;


		if (callback !== null) {

			this.once('save', result => callback(result));

			this.client.send({
				headers: {
					service: 'settings',
					method:  'save'
				},
				payload: this.browser.settings
			});

		}

	},

	set: function(payload, callback) {

		payload  = Object.isObject(payload)      ? payload  : null;
		callback = Function.isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('set', result => callback(result));

			this.client.send({
				headers: {
					service: 'settings',
					method:  'set'
				},
				payload: {
					config: payload.config || null
				}
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Settings };

