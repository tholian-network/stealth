
import { Emitter } from '../Emitter.mjs';



const Cache = function(client) {

	this.client = client;
	Emitter.call(this);

};


Cache.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = Object.isObject(payload)      ? payload  : null;
		callback = Function.isFunction(callback) ? callback : null;


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

		payload  = Object.isObject(payload)      ? payload  : null;
		callback = Function.isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {
			callback(false);
		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Cache };

