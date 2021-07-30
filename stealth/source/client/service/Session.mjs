
import { Buffer, Emitter, isFunction, isObject } from '../../../extern/base.mjs';



const Session = function(client) {

	this.client = client;
	Emitter.call(this);

};


Session.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Session Service',
			'data': data
		};

	},

	download: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('download', (response) => {

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
					service: 'session',
					method:  'download'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
		}

	},

	query: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('query', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'session',
					method:  'query'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback([]);
		}

	},

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('read', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'session',
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

			this.once('remove', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'session',
					method:  'remove'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(null);
		}

	}

});


export { Session };

