
import { Emitter } from '../Emitter.mjs';



const Site = function(browser, client) {

	Emitter.call(this);


	this.browser = browser;
	this.client  = client || browser.client;

};


Site.prototype = Object.assign({}, Emitter.prototype, {

	read: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			this.once('read', data => {
				callback(data);
			});

			this.client.send({
				headers: {
					service: 'site',
					method:  'read'
				},
				payload: ref
			});

		} else if (callback !== null) {
			callback(null);
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
					service: 'site',
					method:  'save'
				},
				payload: ref
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Site };

