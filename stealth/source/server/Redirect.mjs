
import { Emitter, isFunction, isObject, isString } from '../../extern/base.mjs';
import { URL                                     } from '../parser/URL.mjs';



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

const toPath = function(payload) {

	let path = null;

	if (isString(payload.path)) {
		path = payload.path;
	}

	return path;

};



const Redirect = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Redirect.isRedirect = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isString(payload.path) === true
		&& isString(payload.location) === true
	) {

		let ref = URL.parse(payload.location);
		if (ref.protocol === 'https' || ref.protocol === 'http') {

			if (ref.domain !== null || ref.host !== null) {
				return true;
			}

		}

	}


	return false;

};


Redirect.toRedirect = function(payload) {

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

		if (domain !== null && isString(payload.path) && isString(payload.location)) {

			let ref = URL.parse(payload.location);
			if (
				(ref.domain !== null || ref.host !== null)
				&& (ref.protocol === 'https' || ref.protocol === 'http')
			) {

				return {
					domain:   domain,
					path:     payload.path,
					location: payload.location
				};

			} else if (payload.location.startsWith('/')) {

				return {
					domain:   domain,
					path:     payload.path,
					location: payload.location
				};

			}

		}

	}


	return null;

};


Redirect.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let redirect = null;
		let domain   = toDomain(payload);
		let path     = toPath(payload);
		if (domain !== null && path !== null) {
			redirect = this.stealth.settings.redirects.find((r) => r.domain === domain && r.path === path) || null;
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'redirect',
					event:   'read'
				},
				payload: redirect
			});

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let redirect = null;
		let domain   = toDomain(payload);
		let path     = toPath(payload);
		if (domain !== null && path !== null) {
			redirect = this.stealth.settings.redirects.find((r) => r.domain === domain && r.path === path) || null;
		}

		if (redirect !== null) {
			this.stealth.settings.redirects.remove(redirect);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'redirect',
					event:   'remove'
				},
				payload: (domain !== null && path !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let redirect_old = null;
		let redirect_new = Redirect.toRedirect(payload);

		let domain = toDomain(payload);
		let path   = toPath(payload);
		if (domain !== null && path !== null) {
			redirect_old = this.stealth.settings.redirects.find((r) => r.domain === domain && r.path === path) || null;
		}

		if (redirect_new !== null) {

			if (redirect_old !== null) {

				redirect_old.location = redirect_new.location;

			} else {
				this.stealth.settings.redirects.push(redirect_new);
			}

			this.stealth.settings.save();

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'redirect',
					event:   'save'
				},
				payload: (redirect_new !== null)
			});

		}

	}

});


export { Redirect };

