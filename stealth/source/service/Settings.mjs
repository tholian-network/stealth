
import { Emitter } from '../Emitter.mjs';



const _payloadify = function(payload) {

	if (payload instanceof Object) {

		payload.internet = payload.internet instanceof Object ? payload.internet : {};
		payload.filters  = payload.filters  instanceof Array  ? payload.filters  : [];
		payload.hosts    = payload.hosts    instanceof Array  ? payload.hosts    : [];
		payload.peers    = payload.peers    instanceof Array  ? payload.peers    : [];
		payload.sites    = payload.sites    instanceof Array  ? payload.sites    : [];

		return payload;

	}

	return null;

};

const _settify = function(payload) {

	if (payload instanceof Object) {

		payload.mode = typeof payload.mode === 'string' ? payload.mode : null;

		return payload;

	}

	return null;

};



const Settings = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = payload instanceof Object      ? payload  : null;
		callback = typeof callback === 'function' ? callback : null;


		this.stealth.settings.read(result => {

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

	},

	save: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let settings = this.stealth.settings;

			Object.keys(payload.internet).forEach(key => {

				if (settings.internet[key] !== undefined) {
					settings.internet[key] = payload.internet[key];
				}

			});

			payload.filters.forEach(filter => {

				let other = settings.filters.find(f => f.name === filter.name) || null;
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

			payload.hosts.forEach(host => {

				let other = settings.hosts.find(h => h.domain === host.domain) || null;
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

			payload.peers.forEach(peer => {

				let other = settings.peers.find(p => p.domain === peer.domain) || null;
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

			payload.sites.forEach(site => {

				let other = settings.sites.find(s => s.domain === site.domain) || null;
				if (other !== null) {

					for (let key in site) {
						if (other[key] !== undefined) {
							other[key] = site[key];
						}
					}

				} else {
					settings.sites.push(site);
				}

			});


			settings.save(result => {

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

	},

	set: function(payload, callback) {

		payload  = payload instanceof Object      ? _settify(payload) : null;
		callback = typeof callback === 'function' ? callback          : null;


		if (payload !== null && callback !== null) {

			if (payload.mode !== null) {
				this.stealth.setMode(payload.mode);
			}


			callback({
				headers: {
					service: 'settings',
					event:   'set'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'settings',
					event:   'set'
				},
				payload: false
			});

		}

	}

});


export { Settings };

