
import { Emitter, isFunction, isObject, isString } from '../../../extern/base.mjs';



const toDomain = function(payload) {

	let domain = null;

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host) === true) {
			domain = payload.host;
		}

	}

	return domain;

};



const Blocker = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


/*
 * {
 *   "domain": "ads.example.com"
 * }
 */

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

	if (isObject(payload) === true) {

		let domain = null;

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host) === true) {
			domain = payload.host;
		}

		if (domain !== null) {

			return {
				domain: domain
			};

		}

	}


	return null;

};


Blocker.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Blocker Service',
			'data': data
		};

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let blocker = null;
		let domain  = toDomain(payload);
		if (domain !== null) {
			blocker = this.stealth.settings.blockers.find((b) => b.domain === domain) || null;
		}

		// Ensure that subdomains are matched, too
		if (blocker === null) {
			blocker = this.stealth.settings.blockers.find((b) => domain.endsWith('.' + b.domain)) || null;
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

