
import { Buffer, Emitter, isFunction, isObject, isString } from '../../../extern/base.mjs';



const proxify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain    = isString(payload.domain)      ? payload.domain    : null;
		payload.subdomain = isString(payload.subdomain)   ? payload.subdomain : null;
		payload.host      = isString(payload.host)        ? payload.host      : null;
		payload.payload   = payload.payload !== undefined ? payload.payload   : null;


		if (isObject(payload.headers) === true) {

			payload.headers = Object.assign({}, raw.headers);

			payload.headers.service = isString(payload.headers.service) ? payload.headers.service : null;
			payload.headers.method  = isString(payload.headers.method)  ? payload.headers.method  : null;
			payload.headers.event   = isString(payload.headers.event)   ? payload.headers.event   : null;


			if (payload.headers.service !== null) {

				if (payload.headers.service === 'peer' && payload.headers.method === 'proxy') {
					return null;
				}

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

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Peer Service',
			'data': data
		};

	},

	info: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (callback !== null) {

			this.once('info', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'peer',
					method:  'info'
				},
				payload: payload
			});

		}

	},

	proxy: function(payload, callback) {

		payload  = isObject(payload)    ? proxify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null && callback !== null) {

			this.once('proxy', (response) => {

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

	refresh: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('refresh', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'peer',
					method:  'refresh'
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

