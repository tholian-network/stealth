
import { Emitter, isFunction, isObject } from '../../../extern/base.mjs';



const Mode = function(client) {

	this.client = client;
	Emitter.call(this);

};


Mode.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Mode Service',
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
					service: 'mode',
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
					service: 'mode',
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
					service: 'mode',
					method:  'save'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(false);
		}

	}

});


export { Mode };

