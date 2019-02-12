
import { DNS     } from '../protocol/DNS.mjs';
import { Emitter } from '../Emitter.mjs';
import { IP      } from '../parser/IP.mjs';



const _payloadify = function(payload) {

	if (payload instanceof Object) {

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;
		payload.ipv4      = typeof payload.ipv4 === 'string'      ? payload.ipv4      : null;
		payload.ipv6      = typeof payload.ipv6 === 'string'      ? payload.ipv6      : null;

		return payload;

	}

	return null;

};



const Host = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Host.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					host = settings.hosts.find(h => h.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					host = settings.hosts.find(h => h.domain === payload.domain) || null;
				}

			} else if (payload.host !== null) {
				host = settings.hosts.find(h => (h.ipv4 === payload.host || h.ipv6 === payload.host)) || null;
			}


			if (host !== null) {

				callback({
					headers: {
						service: 'host',
						event:   'read'
					},
					payload: host
				});

			} else if (payload.domain !== null) {

				DNS.resolve(payload, response => {

					let host        = null;
					let dns_payload = response.payload;

					if (payload.subdomain !== null) {
						host = settings.hosts.find(h => h.domain === payload.subdomain + '.' + payload.domain) || null;
					} else {
						host = settings.hosts.find(h => h.domain === payload.domain) || null;
					}


					if (host !== null) {

						host.ipv4 = dns_payload.ipv4;
						host.ipv6 = dns_payload.ipv6;

						settings.save();

					} else {

						if (payload.subdomain !== null) {
							payload.domain    = payload.subdomain + '.' + payload.domain;
							payload.subdomain = null;
						}

						host = {
							domain: payload.domain,
							ipv4:   dns_payload.ipv4,
							ipv6:   dns_payload.ipv6
						};

						settings.hosts.push(host);
						settings.save();

					}


					callback({
						headers: {
							service: 'host',
							event:   'read'
						},
						payload: host
					});

				});

			} else {

				callback({
					headers: {
						service: 'host',
						event:   'read'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'read'
				},
				payload: null
			});

		}

	},

	refresh: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let settings = this.stealth.settings;


			DNS.resolve(payload, response => {

				let host        = null;
				let dns_payload = response.payload;

				if (payload.domain !== null) {

					let subdomain = payload.subdomain || null;
					if (subdomain !== null) {
						host = settings.hosts.find(h => h.domain === payload.subdomain + '.' + payload.domain) || null;
					} else{
						host = settings.hosts.find(h => h.domain === payload.domain) || null;
					}

				}


				if (host !== null) {

					host.ipv4 = dns_payload.ipv4;
					host.ipv6 = dns_payload.ipv6;

					settings.save();

				} else {

					if (payload.subdomain !== null) {
						payload.domain    = payload.subdomain + '.' + payload.domain;
						payload.subdomain = null;
					}

					host = {
						domain: payload.domain,
						ipv4:   dns_payload.ipv4,
						ipv6:   dns_payload.ipv6
					};

					settings.hosts.push(host);
					settings.save();

				}


				callback({
					headers: {
						service: 'host',
						event:   'refresh'
					},
					payload: host
				});

			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'refresh'
				},
				payload: null
			});

		}

	},

	remove: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					host = settings.hosts.find(h => h.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					host = settings.hosts.find(h => h.domain === payload.domain) || null;
				}

			}


			if (host !== null) {

				let index = settings.hosts.indexOf(host);
				if (index !== -1) {
					settings.hosts.splice(index, 1);
				}

				settings.save();

			}

			callback({
				headers: {
					service: 'host',
					event:   'remove'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'remove'
				},
				payload: false
			});

		}

	},

	save: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback : null;


		if (payload !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					host = settings.hosts.find(h => h.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					host = settings.hosts.find(h => h.domain === payload.domain) || null;
				}

			}


			if (host !== null) {

				let ipv4 = IP.parse(payload.ipv4);
				let ipv6 = IP.parse(payload.ipv6);

				if (ipv4.type === 'v4') {
					host.ipv4 = ipv4.ip;
				}

				if (ipv6.type === 'v6') {
					host.ipv6 = ipv6.ip;
				}

				settings.save();

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}


				let ipv4 = IP.parse(payload.ipv4);
				let ipv6 = IP.parse(payload.ipv6);

				host = {
					domain: payload.domain,
					ipv4:   ipv4.type === 'v4' ? ipv4.ip : null,
					ipv6:   ipv6.type === 'v6' ? ipv6.ip : null
				};

				settings.hosts.push(host);
				settings.save();

			}


			callback({
				headers: {
					service: 'host',
					event:   'save'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Host };

