
import { Emitter, isArray, isFunction, isObject, isString } from '../../extern/base.mjs';



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



const Policy = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Policy.isPolicy = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.policies) === true
	) {

		let check = payload.policies.filter((policy) => {

			if (
				isObject(policy) === true
				&& isString(policy.path) === true
				&& (isString(policy.query) === true || policy.query === null)
			) {
				return true;
			}

			return false;

		});

		if (check.length === payload.policies.length) {
			return true;
		}

	}


	return false;

};


Policy.toPolicy = function(payload) {

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

		if (domain !== null && isArray(payload.policies) === true) {

			let check = payload.policies.filter((policy) => {

				if (
					isObject(policy) === true
					&& isString(policy.path) === true
					&& (isString(policy.query) === true || policy.query === null)
				) {
					return true;
				}

				return false;

			});

			if (check.length === payload.policies.length) {

				return {
					domain:   domain,
					policies: payload.policies.map((policy) => ({
						path:  policy.path,
						query: isString(policy.query) ? policy.query : null
					}))
				};

			}

		}

	}


	return null;

};


Policy.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Policy Service',
			'data': data
		};

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let policy = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			policy = this.stealth.settings.policies.find((p) => p.domain === domain) || null;
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'policy',
					event:   'read'
				},
				payload: policy
			});

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let policy = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			policy = this.stealth.settings.policies.find((p) => p.domain === domain) || null;
		}

		if (policy !== null) {
			this.stealth.settings.policies.remove(policy);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'policy',
					event:   'remove'
				},
				payload: (policy !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let policy_old = null;
		let policy_new = Policy.toPolicy(payload);

		let domain = toDomain(payload);
		if (domain !== null) {
			policy_old = this.stealth.settings.policies.find((p) => p.domain === domain) || null;
		}

		if (policy_new !== null) {

			if (policy_old !== null) {
				policy_old.policies = policy_new.policies;
			} else {
				this.stealth.settings.policies.push(policy_new);
			}

			this.stealth.settings.save();

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'policy',
					event:   'save'
				},
				payload: (policy_new !== null)
			});

		}

	}

});


export { Policy };

