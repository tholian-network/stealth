
import { Emitter, isArray, isFunction, isObject, isString } from '../../../extern/base.mjs';



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



const Echo = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


/*
 * {
 *   "domain": "example.com",
 *   "echos":  [{
 *     TODO: Echo Schema
 *   }]
 * }
 */

Echo.isEcho = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.echos) === true
	) {

		let check = payload.echos.filter((echo) => {

			// TODO: Echo Schema Validation

			return true;

		});

		if (check.length === payload.echos.length) {
			return true;
		}

	}


	return false;

};

Echo.toEcho = function(payload) {

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

		if (domain !== null && isArray(payload.echos) === true) {

			let check = payload.echos.filter((echo) => {

				// TODO: Echo Schema Validation

				return true;

			});

			if (check.length === payload.echos.length) {

				return {
					domain: domain,
					echos:  payload.echos.map((echo) => ({
						// TODO: Echo Schema
					}))
				};

			}

		}

	}


	return null;

};


Echo.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Echo Service',
			'data': data
		};

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let echo   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			echo = this.stealth.settings.echos.find((e) => e.domain === domain) || null;
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'echo',
					event:   'read'
				},
				payload: echo
			});

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let echo   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			echo = this.stealth.settings.echos.find((e) => e.domain === domain) || null;
		}

		if (echo !== null) {
			this.stealth.settings.echos.remove(echo);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'echo',
					event:   'remove'
				},
				payload: (echo !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let echo_old = null;
		let echo_new = Echo.toEcho(payload);

		let domain = toDomain(payload);
		if (domain !== null) {
			echo_old = this.stealth.settings.echos.find((e) => e.domain === domain) || null;
		}

		if (echo_new !== null) {

			if (echo_old !== null) {
				echo_old.echos = echo_new.echos;
			} else {
				this.stealth.settings.echos.push(echo_new);
			}

			this.stealth.settings.save();

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'echo',
					event:   'save'
				},
				payload: (echo_new !== null)
			});

		}

	}

});


export { Echo };

