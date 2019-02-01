
import { Emitter } from '../Emitter.mjs';



const Host = function(browser, client) {

	Emitter.call(this);


	this.browser = browser;
	this.client  = client || browser.client;

};


Host.prototype = Object.assign({}, Emitter.prototype, {

	read: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			this.once('read', host => {
				callback(host);
			});

			this.client.send({
				headers: {
					service: 'host',
					method:  'read'
				},
				payload: ref
			});

		} else if (callback !== null) {
			callback(null);
		}

	},

	refresh: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			this.once('refresh', host => {
				callback(host);
			});

			this.client.send({
				headers: {
					service: 'host',
					method:  'refresh'
				},
				payload: ref
			});

		} else if (callback !== null) {
			callback(null);
		}

	},

	remove: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			this.once('remove', data => {

				if (data !== null) {
					callback(data.result || false);
				} else {
					callback(false);
				}

			});

			this.client.send({
				headers: {
					service: 'host',
					method:  'remove'
				},
				payload: ref
			});

		} else if (callback !== null) {
			callback(false);
		}

	},

	save: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			this.once('save', data => {

				if (data !== null) {
					callback(data.result || false);
				} else {
					callback(false);
				}

			});

			this.client.send({
				headers: {
					service: 'host',
					method:  'save'
				},
				payload: ref
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Host };

