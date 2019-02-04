
import { Emitter } from '../Emitter.mjs';



const Cache = function(browser, client) {

	Emitter.call(this);


	this.browser = browser;
	this.client  = client || browser.client;

};


Cache.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('read', response => callback(response));

			this.client.send({
				headers: {
					service: 'cache',
					method:  'read'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(null);
		}

	},

	save: function(payload, callback) {

		// XXX: Cache is read-only for Stealth Browser
		callback(false);

	}

});


export { Cache };

