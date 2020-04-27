
import { Emitter, isFunction, isObject, isString } from '../../extern/base.mjs';
import { isSession                               } from '../Session.mjs';
import { URL                                     } from '../parser/URL.mjs';



const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain    = isString(payload.domain)    ? payload.domain    : null;
		payload.subdomain = isString(payload.subdomain) ? payload.subdomain : null;

		return payload;

	}


	return null;

};



const Session = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Session.prototype = Object.assign({}, Emitter.prototype, {

	download: function(payload, callback) {

		payload  = URL.isURL(payload)   ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null && callback !== null) {

			let request = this.stealth.open(URL.render(payload));
			if (request !== null) {

				request.on('error', () => {

					callback({
						headers: {
							service: 'session',
							event:   'download'
						},
						payload: null
					});

				});

				request.on('redirect', (response) => {

					callback({
						headers: {
							service: 'session',
							event:   'download'
						},
						payload: response
					});

				});

				request.on('response', (response) => {

					callback({
						headers: {
							service: 'session',
							event:   'download'
						},
						payload: response
					});

				});

			} else {

				callback({
					headers: {
						service: 'session',
						event:   'download'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'session',
					event:   'download'
				},
				payload: null
			});

		}

	},

	query: function(payload, callback, session) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;
		session  = isSession(session)   ? session             : null;


		if (payload !== null && callback !== null && session !== null) {

			let sessions = [];
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					sessions = settings.sessions.filter((s) => s.domain === payload.subdomain + '.' + payload.domain);
				} else if (payload.domain === '*') {
					sessions = settings.sessions;
				} else {
					sessions = settings.sessions.filter((s) => s.domain === payload.domain);
				}

			}


			let check = settings.sessions.find((s) => s.domain === session.domain) || null;
			if (check === null) {
				settings.sessions.push(session);
			}


			callback({
				headers: {
					service: 'session',
					event:   'query'
				},
				payload: sessions.map((s) => s.toJSON())
			});

		} else if (callback !== null && session !== null) {

			let settings = this.stealth.settings;

			let check = settings.sessions.find((s) => s.domain === session.domain) || null;
			if (check === null) {
				settings.sessions.push(session);
			}


			callback({
				headers: {
					service: 'session',
					event:   'query'
				},
				payload: settings.sessions.map((s) => s.toJSON())
			});

		} else if (callback !== null) {

			let settings = this.stealth.settings;

			callback({
				headers: {
					service: 'session',
					event:   'query'
				},
				payload: settings.sessions.map((s) => s.toJSON())
			});

		}

	},

	read: function(payload, callback, session) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;
		session  = isSession(session)   ? session             : null;


		if (callback !== null && session !== null) {

			let settings = this.stealth.settings;

			let check = settings.sessions.find((s) => s.domain === session.domain) || null;
			if (check === null) {
				settings.sessions.push(session);
			}


			callback({
				headers: {
					service: 'session',
					event:   'read'
				},
				payload: session.toJSON()
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

