
import { Emitter, isFunction, isObject, isString } from '../../extern/base.mjs';
import { URL                                     } from '../parser/URL.mjs';



const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain    = isString(payload.domain)    ? payload.domain    : null;
		payload.subdomain = isString(payload.subdomain) ? payload.subdomain : null;
		payload.host      = isString(payload.host)      ? payload.host      : null;
		payload.path      = isString(payload.path)      ? payload.path      : '/';
		payload.location  = isString(payload.location)  ? payload.location  : null;


		if (payload.location !== null) {

			let ref = URL.parse(payload.location);
			if (ref.protocol === 'https' || ref.protocol === 'http') {

				if (ref.domain !== null || ref.host !== null) {
					return payload;
				}

			}

		} else {
			return payload;
		}

	}

	return null;

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


Redirect.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let redirect = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {

					redirect = settings.redirects.find((r) => {
						return r.domain === payload.subdomain + '.' + payload.domain && r.path === payload.path;
					}) || null;

				} else {

					redirect = settings.redirects.find((r) => {
						return r.domain === payload.domain && r.path === payload.path;
					}) || null;

				}

			} else if (payload.host !== null) {

				redirect = settings.redirects.find((r) => {
					return r.host === payload.host && r.path === payload.path;
				}) || null;

			}


			callback({
				headers: {
					service: 'redirect',
					event:   'read'
				},
				payload: redirect
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'redirect',
					event:   'read'
				},
				payload: null
			});

		}

	},

	remove: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let redirect = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {

					redirect = settings.redirects.find((r) => {
						return r.domain === payload.subdomain + '.' + payload.domain && r.path === payload.path;
					}) || null;

				} else {

					redirect = settings.redirects.find((r) => {
						return r.domain === payload.domain && r.path === payload.path;
					}) || null;

				}

			} else if (payload.host !== null) {

				redirect = settings.redirects.find((r) => {
					return r.host === payload.host && r.path === payload.path;
				}) || null;

			}


			if (redirect !== null) {

				let index = settings.redirects.indexOf(redirect);
				if (index !== -1) {
					settings.redirects.splice(index, 1);
				}

				settings.save();

			}


			callback({
				headers: {
					service: 'redirect',
					event:   'remove'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'redirect',
					event:   'remove'
				},
				payload: false
			});

		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && payload.location !== null && callback !== null) {

			let redirect = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {

					redirect = settings.redirects.find((r) => {
						return r.domain === payload.subdomain + '.' + payload.domain && r.path === payload.path;
					}) || null;

				} else {

					redirect = settings.redirects.find((r) => {
						return r.domain === payload.domain && r.path === payload.path;
					}) || null;

				}

			} else if (payload.host !== null) {

				redirect = settings.redirects.find((r) => {
					return r.host === payload.host && r.path === payload.path;
				}) || null;

			}


			if (redirect !== null) {

				if (redirect.location !== payload.location) {

					redirect.location = payload.location;

					settings.save();

				}

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}

				redirect = {
					domain:   payload.domain,
					path:     payload.path,
					location: payload.location
				};

				settings.redirects.push(redirect);
				settings.save();

			} else if (payload.host !== null) {

				redirect = {
					host:     payload.host,
					path:     payload.path,
					location: payload.location
				};

				settings.redirects.push(redirect);
				settings.save();

			}


			callback({
				headers: {
					service: 'redirect',
					event:   'save'
				},
				payload: (redirect !== null)
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'redirect',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Redirect };

