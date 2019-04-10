
import { Emitter } from '../Emitter.mjs';



const payloadify = function(raw) {

	let payload = raw;
	if (payload instanceof Object) {

		payload = Object.assign({}, raw);

		payload.internet = payload.internet instanceof Object ? payload.internet : {};
		payload.filters  = payload.filters  instanceof Array  ? payload.filters  : [];
		payload.hosts    = payload.hosts    instanceof Array  ? payload.hosts    : [];
		payload.modes    = payload.modes    instanceof Array  ? payload.modes    : [];
		payload.peers    = payload.peers    instanceof Array  ? payload.peers    : [];

		return payload;

	}

	return null;

};

const readify = function(raw) {

	let payload = raw;
	if (payload instanceof Object) {

		if (Object.keys(payload).length > 0) {

			payload = Object.assign({}, raw);

			payload.internet = typeof payload.internet === 'boolean' ? payload.internet : false;
			payload.filters  = typeof payload.filters === 'boolean'  ? payload.filters  : false;
			payload.hosts    = typeof payload.hosts === 'boolean'    ? payload.hosts    : false;
			payload.modes    = typeof payload.modes === 'boolean'    ? payload.modes    : false;
			payload.peers    = typeof payload.peers === 'boolean'    ? payload.peers    : false;

			return payload;

		}

	}

	return null;

};



const Settings = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = payload instanceof Object      ? readify(payload) : null;
		callback = typeof callback === 'function' ? callback         : null;


		if (payload !== null) {

			let json = this.stealth.settings.toJSON();
			let data = {
				internet: null,
				filters:  null,
				hosts:    null,
				modes:    null,
				peers:    null
			};


			Object.keys(payload).forEach((key) => {

				if (payload[key] === true) {
					data[key] = json[key] || null;
				}

			});


			if (callback !== null) {

				callback({
					headers: {
						service: 'settings',
						event:   'read'
					},
					payload: data
				});

			}

		} else {

			this.stealth.settings.read(false, (result) => {

				if (callback !== null) {

					if (result === true) {

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: this.stealth.settings.toJSON()
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

		payload  = payload instanceof Object      ? payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback            : null;


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

