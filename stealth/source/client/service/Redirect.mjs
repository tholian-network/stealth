
import { Emitter, isFunction, isObject } from '../../../extern/base.mjs';



const Redirect = function(client) {

	this.client = client;
	Emitter.call(this);

};


Redirect.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Redirect Service',
			'data': data
		};

	},

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('read', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'redirect',
					method:  'read'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(null);
		}

	},

	remove: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('remove', (result) => callback(result));

			this.client.send({
				headers: {
					service: 'redirect',
					method:  'remove'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('save', (result) => callback(result));

			this.client.send({
				headers: {
					service: 'redirect',
					method:  'save'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Redirect };

