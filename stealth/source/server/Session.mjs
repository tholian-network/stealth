
import { isFunction, isObject } from '../POLYFILLS.mjs';

import { Emitter } from '../Emitter.mjs';



const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload)) {

		payload = Object.assign({}, raw);

	}


	return null;

};



const Session = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Session.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback, session) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;
		session  = isObject(session)    ? session             : null;


		if (callback !== null && session !== null) {

			callback({
				headers: {
					service: 'session',
					event:   'read'
				},
				payload: session.toJSON().data
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'session',
					event:   'read'
				},
				payload: null
			});

		}

	}

});


export { Session };

