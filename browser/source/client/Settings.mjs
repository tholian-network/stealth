
import { Emitter } from '../Emitter.mjs';



const Settings = function(client) {

	this.client = client;
	Emitter.call(this);

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = Object.isObject(payload)      ? payload  : null;
		callback = Function.isFunction(callback) ? callback : null;


		if (callback !== null) {

			this.once('read', response => callback(response));

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


		if (payload !== null && callback !== null) {

			this.once('save', result => callback(result));

			this.client.send({
				headers: {
					service: 'settings',
					method:  'save'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
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

