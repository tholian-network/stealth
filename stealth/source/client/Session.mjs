
import { Emitter, isFunction, isObject } from '../../extern/base.mjs';



const Session = function(client) {

	this.client = client;
	Emitter.call(this);

};


Session.prototype = Object.assign({}, Emitter.prototype, {

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
			callback(null);
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

	download: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('download', (response) => callback(response));

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

	}

});


export { Session };

