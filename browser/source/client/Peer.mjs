
import { isFunction, isObject } from '../POLYFILLS.mjs';

import { Emitter } from '../Emitter.mjs';



const proxify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;
		payload.payload   = payload.payload !== undefined         ? payload.payload   : null;


		if (isObject(payload.headers) === true) {

			payload.headers = Object.assign({}, raw.headers);

			payload.headers.service = typeof payload.headers.service === 'string' ? payload.headers.service : null;
			payload.headers.method  = typeof payload.headers.method === 'string'  ? payload.headers.method  : null;
			payload.headers.event   = typeof payload.headers.event === 'string'   ? payload.headers.event   : null;


			if (payload.headers.service !== null && payload.headers.service !== 'peer') {

				if (payload.headers.method !== null || payload.headers.event !== null) {
					return payload;
				}

			}

		}

	}

	return null;

};



const Peer = function(client) {

	this.client = client;
	Emitter.call(this);

};


Peer.prototype = Object.assign({}, Emitter.prototype, {

	proxy: function(payload, callback) {

		payload  = isObject(payload)    ? proxify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null && callback !== null) {

			this.once('proxy', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'peer',
					method:  'proxy'
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

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('remove', (result) => callback(result));

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

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('save', (result) => callback(result));

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

