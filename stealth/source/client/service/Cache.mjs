
import { Buffer, Emitter, isFunction, isObject } from '../../../extern/base.mjs';



const Cache = function(client) {

	this.client = client;
	Emitter.call(this);

};


Cache.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Cache Service',
			'data': data
		};

	},

	info: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('info', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'cache',
					method:  'info'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(null);
		}

	},

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('read', (response) => {

				if (isObject(response) === true) {

					if (isObject(response.payload) === true) {

						if (response.payload.type === 'Buffer') {
							response.payload = Buffer.from(response.payload.data);
						}

					}

				}

				callback(response);

			});

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

	remove: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('remove', (result) => callback(result));

			this.client.send({
				headers: {
					service: 'cache',
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
					service: 'cache',
					method:  'save'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Cache };

