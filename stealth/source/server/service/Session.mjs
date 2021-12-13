
import { Emitter, isFunction, isObject, isString } from '../../../extern/base.mjs';
import { isSession                               } from '../../../source/Session.mjs';
import { URL                                     } from '../../../source/parser/URL.mjs';



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

const isTab = function(payload) {
};



const Session = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Session.isSession = isSession;


Session.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Session Service',
			'data': data
		};

	},

	/*
	 * TAB API
	 */

	open: function(payload, callback, local) {

		payload = isTab(payload) ? payload : null;


		if (payload !== null) {

			// TODO: Open Tab with given ID and URL

		} else {

			if (callback !== null) {

				callback({
					headers: {
						service: 'session',
						event:   'open'
					},
					payload: false
				});

			}

		}

	},

	close: function(payload, callback, local) {

		// Close Tab with given ID

	},

	refresh: function(payload, callback, local) {

		// Refresh Tab with given ID, which leads to new Request()
		// via stealth.request()

	},

	navigate: function(payload, callback, local) {

		// Navigate Tab with given ID to given URL and Mode

	},


	/*
	 * SESSION API
	 */

	request__OLD: function(payload, callback) {

		payload  = URL.isURL(payload)   ? payload  : null;
		callback = isFunction(callback) ? callback : null;


		if (payload !== null) {

			let request = this.stealth.request(payload);
			if (request !== null) {

				request.on('error', () => {

					if (callback !== null) {

						callback({
							headers: {
								service: 'session',
								event:   'download'
							},
							payload: null
						});

					}

				});

				request.on('redirect', (response) => {

					if (callback !== null) {

						callback({
							headers: {
								service: 'session',
								event:   'download'
							},
							payload: response
						});

					}

				});

				request.on('response', (response) => {

					if (callback !== null) {

						callback({
							headers: {
								service: 'session',
								event:   'download'
							},
							payload: response
						});

					}

				});

				request.start();

			} else {

				if (callback !== null) {

					callback({
						headers: {
							service: 'session',
							event:   'download'
						},
						payload: null
					});

				}

			}

		} else {

			if (callback !== null) {

				callback({
					headers: {
						service: 'session',
						event:   'download'
					},
					payload: null
				});

			}

		}

	},

	query: function(payload, callback, local) {

		callback = isFunction(callback) ? callback : null;
		local    = isSession(local)     ? local    : null;


		let sessions = [];
		let domain   = toDomain(payload);
		if (domain !== null) {

			if (domain === '*') {
				sessions = this.stealth.settings.sessions;
			} else {
				sessions = this.stealth.settings.sessions.filter((s) => s.domain === domain);
			}

		}

		if (local !== null) {

			if (this.stealth.settings.sessions.includes(local) === false) {
				this.stealth.settings.sessions.push(local);
			}

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'session',
					event:   'query'
				},
				payload: sessions.map((s) => s.toJSON())
			});

		}

	},

	read: function(payload, callback, local) {

		callback = isFunction(callback) ? callback : null;
		local    = isSession(local)     ? local    : null;


		let session = null;
		let domain  = toDomain(payload);
		if (domain !== null) {
			session = this.stealth.settings.sessions.find((s) => s.domain === domain) || null;
		} else {
			session = local;
		}

		if (local !== null) {

			if (this.stealth.settings.sessions.includes(local) === false) {
				this.stealth.settings.sessions.push(local);
			}

		}


		if (session !== null) {

			if (callback !== null) {

				callback({
					headers: {
						service: 'session',
						event:   'read'
					},
					payload: session.toJSON()
				});

			}

		} else {

			if (callback !== null) {

				callback({
					headers: {
						service: 'session',
						event:   'read'
					},
					payload: null
				});

			}

		}

	},

	remove: function(payload, callback, local) {

		callback = isFunction(callback) ? callback : null;


		let session = null;
		let domain  = toDomain(payload);
		if (domain !== null) {
			session = this.stealth.settings.sessions.find((h) => h.domain === domain) || null;
		}

		if (
			session !== null
			&& session !== local
			&& session.domain !== '127.0.0.1'
			&& session.domain !== 'localhost'
		) {
			this.stealth.settings.sessions.remove(session);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'session',
					event:   'remove'
				},
				payload: (domain !== null)
			});

		}

	}

});


export { Session };

