
import { Emitter, isArray, isFunction, isObject, isString } from '../../../extern/base.mjs';
import { URL                                              } from '../../../source/parser/URL.mjs';



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



const Redirect = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


/*
 * {
 *   "domain":    "example.com",
 *   "redirects": [
 *     {
 *       "path":     "/download.php",
 *       "query":    "id=1337",
 *       "location": "https://example.com/downloads/1337.tar.gz"
 *     }
 *   ]
 * }
 */

Redirect.isRedirect = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.redirects) === true
	) {

		let check = payload.redirects.filter((redirect) => {

			if (
				isObject(redirect) === true
				&& isString(redirect.path) === true
				&& (isString(redirect.query) === true || redirect.query === null)
				&& isString(redirect.location) === true
			) {

				let url = URL.parse(redirect.location);
				if (url.protocol === 'https' || url.protocol === 'http') {
					return true;
				}

			}

			return false;

		});

		if (check.length === payload.redirects.length) {
			return true;
		}

	}


	return false;

};

Redirect.toRedirect = function(payload) {

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

		if (domain !== null && isArray(payload.redirects) === true) {

			let check = payload.redirects.filter((redirect) => {

				if (
					isObject(redirect) === true
					&& isString(redirect.path) === true
					&& (isString(redirect.query) === true || redirect.query === null)
					&& isString(redirect.location) === true
				) {

					let url = URL.parse(redirect.location);
					if (url.protocol === 'https' || url.protocol === 'http') {
						return true;
					}

				}

				return false;

			});

			if (check.length === payload.redirects.length) {

				return {
					domain:    domain,
					redirects: payload.redirects.map((redirect) => ({
						path:     redirect.path,
						query:    redirect.query,
						location: redirect.location
					}))
				};

			}

		}

	}


	return null;

};


Redirect.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Redirect Service',
			'data': data
		};

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let redirect = null;
		let domain   = toDomain(payload);
		if (domain !== null) {
			redirect = this.stealth.settings.redirects.find((r) => r.domain === domain) || null;
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
		if (domain !== null) {
			redirect = this.stealth.settings.redirects.find((r) => r.domain === domain) || null;
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
				payload: (domain !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let redirect_old = null;
		let redirect_new = Redirect.toRedirect(payload);

		let domain = toDomain(payload);
		if (domain !== null) {
			redirect_old = this.stealth.settings.redirects.find((r) => r.domain === domain) || null;
		}

		if (redirect_new !== null) {

			if (redirect_old !== null) {
				redirect_old.redirects = redirect_new.redirects;
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

