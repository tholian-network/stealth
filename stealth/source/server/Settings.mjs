
import { Emitter, isArray, isBoolean, isFunction, isObject } from '../../extern/base.mjs';



const readify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		if (Object.keys(payload).length > 0) {

			payload = Object.assign({}, raw);

			payload.internet  = isBoolean(payload.internet)  ? payload.internet  : false;
			payload.blockers  = false; // cannot be read
			payload.filters   = isBoolean(payload.filters)   ? payload.filters   : false;
			payload.hosts     = isBoolean(payload.hosts)     ? payload.hosts     : false;
			payload.modes     = isBoolean(payload.modes)     ? payload.modes     : false;
			payload.peers     = isBoolean(payload.peers)     ? payload.peers     : false;
			payload.redirects = isBoolean(payload.redirects) ? payload.redirects : false;
			payload.sessions  = isBoolean(payload.sessions)  ? payload.sessions  : false;

			return payload;

		}

	}

	return null;

};

const saveify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.internet  = isObject(payload.internet) ? payload.internet : {};
		payload.blockers  = []; // blockers cannot be saved
		payload.filters   = isArray(payload.filters)   ? payload.filters  : [];
		payload.hosts     = isArray(payload.hosts)     ? payload.hosts    : [];
		payload.modes     = isArray(payload.modes)     ? payload.modes    : [];
		payload.peers     = isArray(payload.peers)     ? payload.peers    : [];
		payload.redirects = []; // cannot be saved
		payload.sessions  = []; // cannot be saved

		return payload;

	}

	return null;

};



const Settings = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = isObject(payload)    ? readify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null) {

			this.stealth.settings.read(false, (result) => {

				if (callback !== null) {

					if (result === true) {

						let blob = this.stealth.settings.toJSON();
						let data = {
							internet:  null,
							blockers:  null,
							filters:   null,
							hosts:     null,
							modes:     null,
							peers:     null,
							redirects: null,
							sessions:  null
						};


						Object.keys(payload).forEach((key) => {

							if (payload[key] === true) {
								data[key] = blob.data[key] || null;
							}

						});


						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: data
						});

					} else {

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: null
						});

					}

				}

			});

		} else {

			this.stealth.settings.read(false, (result) => {

				if (callback !== null) {

					if (result === true) {

						let blob = this.stealth.settings.toJSON();
						let data = blob.data;

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: data
						});

					} else {

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: null
						});

					}

				}

			});

		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? saveify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null && callback !== null) {

			let settings = this.stealth.settings;

			Object.keys(payload.internet).forEach((key) => {

				if (settings.internet[key] !== undefined) {
					settings.internet[key] = payload.internet[key];
				}

			});

			payload.filters.forEach((filter) => {

				let other = settings.filters.find((f) => f.name === filter.name) || null;
				if (other !== null) {

					for (let key in filter) {
						if (other[key] !== undefined) {
							other[key] = filter[key];
						}
					}

				} else {
					settings.filters.push(filter);
				}

			});

			payload.hosts.forEach((host) => {

				let other = settings.hosts.find((h) => h.domain === host.domain) || null;
				if (other !== null) {

					for (let key in host) {
						if (other[key] !== undefined) {
							other[key] = host[key];
						}
					}

				} else {
					settings.hosts.push(host);
				}

			});

			payload.modes.forEach((mode) => {

				let other = settings.modes.find((m) => m.domain === mode.domain) || null;
				if (other !== null) {

					for (let key in mode) {
						if (other[key] !== undefined) {
							other[key] = mode[key];
						}
					}

				} else {
					settings.modes.push(mode);
				}

			});

			payload.peers.forEach((peer) => {

				let other = settings.peers.find((p) => p.domain === peer.domain) || null;
				if (other !== null) {

					for (let key in peer) {
						if (other[key] !== undefined) {
							other[key] = peer[key];
						}
					}

				} else {
					settings.peers.push(peer);
				}

			});


			settings.save(false, (result) => {

				callback({
					headers: {
						service: 'settings',
						event:   'save'
					},
					payload: result
				});

			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'settings',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Settings };

