
import { Emitter, isFunction, isObject } from '../../extern/base.mjs';



const Blocker = function(client) {

	this.client = client;
	Emitter.call(this);

};


Blocker.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			this.once('read', (response) => callback(response));

			this.client.send({
				headers: {
					service: 'blocker',
					method:  'read'
				},
				payload: payload
			});

		} else if (callback !== null) {
			callback(null);
		}

	}

});


export { Blocker };

