
import { DNS     } from '../protocol/DNS.mjs';
import { Emitter } from '../Emitter.mjs';
import { IP      } from '../parser/IP.mjs';



const _validate_payload = function(payload) {

	if (payload instanceof Object) {

		let ipv4 = payload.ipv4 || null;
		let ipv6 = payload.ipv6 || null;

		if (
			(typeof ipv4 === 'string' || ipv4 === null)
			&& (typeof ipv6 === 'string' || ipv6 === null)
		) {
			return payload;
		}

	}

	return null;

};




const Host = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Host.prototype = Object.assign({}, Emitter.prototype, {

	read: function(ref, callback) {

		ref      = ref instanceof Object        ? ref      : null;
		callback = callback instanceof Function ? callback : null;


		if (ref !== null && callback !== null) {

			let domain    = ref.domain || null;
			let subdomain = ref.subdomain || null;
			if (subdomain !== null) {
				domain = subdomain + '.' + domain;
			}


			let settings = this.stealth.settings;
			let host     = settings.hosts.find(h => h.domain === domain) || null;

			if (host !== null) {

				callback({
					headers: {
						service: 'host',
						event:   'read'
					},
					payload: host
				});

			} else {

				DNS.resolve(ref, response => {

					let payload = response.payload || null;
					if (payload !== null) {

						let host = {
							domain: domain,
							ipv4:   payload.ipv4,
							ipv6:   payload.ipv6
						};

						settings.hosts.push(host);
						settings.save();

						callback({
							headers: {
								service: 'host',
								event:   'read'
							},
							payload: host
						});

					}

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

	save: function(ref, callback) {

		ref      = ref instanceof Object        ? ref      : null;
		callback = callback instanceof Function ? callback : null;


		if (ref !== null && callback !== null) {

			let domain   = ref.domain || null;
			let payload  = _validate_payload(ref.payload || null);
			let settings = this.stealth.settings;

			if (domain !== null && payload !== null) {

				let ipv4 = IP.parse(payload.ipv4);
				let ipv6 = IP.parse(payload.ipv6);

				let other = settings.hosts.find(h => h.domain === domain) || null;
				if (other !== null) {

					if (ipv4.type === 'v4') {
						other.ipv4 = ipv4.ip;
					}

					if (ipv6.type === 'v6') {
						other.ipv6 = ipv6.ip;
					}

				} else {

					settings.hosts.push({
						domain: domain,
						ipv4:   ipv4.type === 'v4' ? ipv4.ip : null,
						ipv6:   ipv6.type === 'v6' ? ipv6.ip : null
					});

				}


				settings.save(result => {

					callback({
						headers: {
							service: 'host',
							event:   'save'
						},
						payload: {
							result: result
						}
					});

				});

			} else {

				callback({
					headers: {
						service: 'host',
						event:   'save'
					},
					payload: {
						result: false
					}
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'save'
				},
				payload: {
					result: false
				}
			});

		}

	}

});


export { Host };

