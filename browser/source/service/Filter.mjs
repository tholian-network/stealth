
import { Emitter } from '../Emitter.mjs';



const Filter = function(browser, client) {

	Emitter.call(this);


	this.browser = browser;
	this.client  = client || browser.client;

};


Filter.prototype = Object.assign({}, Emitter.prototype, {

	query: function(payload, callback) {

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('query', response => callback(response));

			this.client.send({
				headers: {
					service: 'filter',
					method:  'query'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(null);
		}

	},

	remove: function(payload, callback) {

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('remove', result => callback(result));

			this.client.send({
				headers: {
					service: 'filter',
					method:  'remove'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
		}

	},

	save: function(payloads, callback) {

		payloads = payloads instanceof Array      ? payloads : [];
		callback = typeof callback === 'function' ? callback : null;


		if (payloads.length > 0 && callback !== null) {

			this.once('save', result => callback(result));

			this.client.send({
				headers: {
					service: 'filter',
					method:  'save'
				},
				payload: payloads
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Filter };


