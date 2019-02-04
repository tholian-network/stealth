
import { Emitter } from '../Emitter.mjs';



const Peer = function(browser, client) {

	Emitter.call(this);


	this.browser = browser;
	this.client  = client || browser.client;

};


Peer.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('read', response => callback(response));

			this.client.send({
				headers: {
					service: 'peer',
					method:  'read'
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
					service: 'peer',
					method:  'remove'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
		}

	},

	save: function(payload, callback) {

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('save', result => callback(result));

			this.client.send({
				headers: {
					service: 'peer',
					method:  'save'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Peer };

