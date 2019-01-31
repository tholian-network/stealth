
import { Emitter } from '../Emitter.mjs';



const Settings = function(browser, client) {

	Emitter.call(this);


	this.browser = browser;
	this.client  = client || browser.client;

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	read: function(data, callback) {

		data     = data instanceof Object         ? data     : null;
		callback = typeof callback === 'function' ? callback : null;


		if (callback !== null) {

			this.once('read', data => {

				let settings = this.browser.settings;

				let internet = data.internet || null;
				if (internet !== null) {
					settings.internet = internet;
				}

				let filters = data.filters || null;
				if (filters !== null) {
					settings.filters = filters;
				}

				let hosts = data.hosts || null;
				if (hosts !== null) {
					settings.hosts = hosts;
				}

				let peers = data.peers || null;
				if (peers !== null) {
					settings.peers = peers;
				}

				// TODO: data.plugins

				let sites = data.sites || null;
				if (sites !== null) {
					settings.sites = sites;
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

	save: function(data, callback) {

		data     = data instanceof Object         ? data     : null;
		callback = typeof callback === 'function' ? callback : null;


		if (callback !== null) {

			this.once('save', data => {

				if (data !== null) {
					callback(data.result || false);
				} else {
					callback(false);
				}

			});

			this.client.send({
				headers: {
					service: 'settings',
					method:  'save'
				},
				payload: this.browser.settings
			});

		}

	},

	set: function(data, callback) {

		data     = data instanceof Object         ? data     : null;
		callback = typeof callback === 'function' ? callback : null;


		if (data !== null && callback !== null) {

			this.once('set', data => {

				if (data !== null) {
					callback(data.result || false);
				} else {
					callback(false);
				}

			});

			this.client.send({
				headers: {
					service: 'settings',
					method:  'set'
				},
				payload: {
					mode: data.mode || null
				}
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Settings };

