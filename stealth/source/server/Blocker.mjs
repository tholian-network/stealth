
import { Emitter, isFunction, isObject, isString } from '../../extern/base.mjs';



const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain    = isString(payload.domain)    ? payload.domain    : null;
		payload.subdomain = isString(payload.subdomain) ? payload.subdomain : null;
		payload.host      = isString(payload.host)      ? payload.host      : null;


		if (payload.domain !== null || payload.host !== null) {
			return payload;
		}

	}

	return null;

};



const Blocker = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Blocker.isBlocker = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
	) {

		return true;

	}


	return false;

};


Blocker.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let blocker  = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					blocker = settings.blockers.find((b) => (payload.subdomain + '.' + payload.domain).endsWith(b.domain)) || null;
				} else {
					blocker = settings.blockers.find((b) => (payload.domain).endsWith(b.domain)) || null;
				}

			} else if (payload.host !== null) {
				blocker = settings.blockers.find((b) => b.domain === payload.host) || null;
			}


			callback({
				headers: {
					service: 'blocker',
					event:   'read'
				},
				payload: blocker
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'blocker',
					event:   'read'
				},
				payload: null
			});

		}

	}

});


export { Blocker };

