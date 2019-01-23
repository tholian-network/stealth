
import { Emitter } from '../Emitter.mjs';



const Settings = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	read: function(data, callback) {

		data     = data instanceof Object       ? data     : null;
		callback = callback instanceof Function ? callback : null;


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

	save: function(data, callback) {

		data     = data instanceof Object       ? data     : null;
		callback = callback instanceof Function ? callback : null;


		if (data !== null && callback !== null) {

			let settings = this.stealth.settings;
			let internet = data.internet || {};
			let filters  = data.filters  || [];
			let hosts    = data.hosts    || [];
			let peers    = data.peers    || [];
			let sites    = data.sites    || [];


			Object.keys(internet).forEach(key => {

				if (settings.internet[key] !== undefined) {
					settings.internet[key] = data.internet[key];
				}

			});

			filters.forEach(filter => {

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

			hosts.forEach(host => {

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

			peers.forEach(peer => {

				let other = settings.peers.find(p => p.name === peer.name) || null;
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

			// TODO: data.plugins

			sites.forEach(site => {

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
					payload: true
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

