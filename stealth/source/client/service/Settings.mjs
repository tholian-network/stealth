
import { Emitter, isFunction, isObject } from '../../../extern/base.mjs';



const Settings = function(client) {

	this.client = client;
	Emitter.call(this);

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Settings Service',
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
					service: 'settings',
					method:  'info'
				},
				payload: payload
			});

		}

	},

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (callback !== null) {

			this.once('read', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'settings',
					method:  'read'
				},
				payload: payload
			});

		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('save', (result) => callback(result));

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

	}

});


export { Settings };

