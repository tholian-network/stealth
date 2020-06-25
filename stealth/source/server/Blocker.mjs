
import { Emitter, isFunction, isObject, isString } from '../../extern/base.mjs';



const toDomain = function(payload) {

	let domain = null;

	if (isString(payload.domain)) {

		if (isString(payload.subdomain)) {
			domain = payload.subdomain + '.' + payload.domain;
		} else {
			domain = payload.domain;
		}

	} else if (isString(payload.host)) {
		domain = payload.host;
	}

	return domain;

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


Blocker.toBlocker = function(payload) {

	if (isObject(payload)) {

		let domain = null;

		if (isString(payload.domain)) {

			if (isString(payload.subdomain)) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host)) {
			domain = payload.host;
		}

		if (domain !== null && isObject(payload.mode)) {

			return {
				domain: domain
			};

		}

	}


	return null;

};


Blocker.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let blocker = null;
		let domain  = toDomain(payload);
		if (domain !== null) {
			blocker = this.stealth.settings.blockers.find((b) => b.domain === domain) || null;
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'blocker',
					event:   'read'
				},
				payload: blocker
			});

		}

	}

});


export { Blocker };

