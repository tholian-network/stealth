
import { Emitter } from '../Emitter.mjs';



const _responsify = function(payload) {

	if (payload instanceof Object) {

		payload.internet = payload.internet instanceof Object ? payload.internet : null;
		payload.filters  = payload.filters  instanceof Array  ? payload.filters  : null;
		payload.hosts    = payload.hosts    instanceof Array  ? payload.hosts    : null;
		payload.peers    = payload.peers    instanceof Array  ? payload.peers    : null;
		payload.sites    = payload.sites    instanceof Array  ? payload.sites    : null;

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

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


		if (callback !== null) {

			this.once('read', response => {

				response = response instanceof Object ? _responsify(response) : null;


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

					if (response.peers !== null) {
						settings.peers = response.peers;
					}

					if (response.sites !== null) {
						settings.sites = response.sites;
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

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


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

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('set', result => callback(result));

			this.client.send({
				headers: {
					service: 'settings',
					method:  'set'
				},
				payload: {
					mode: payload.mode || null
				}
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Settings };

