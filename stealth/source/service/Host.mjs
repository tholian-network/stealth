
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

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			let rdomain = ref.domain || null;
			let rhost   = ref.host   || null;

			if (rdomain !== null) {

				let rsubdomain = ref.subdomain || null;
				if (rsubdomain !== null) {
					rdomain = rsubdomain + '.' + rdomain;
				}

				host = settings.hosts.find(h => h.domain === rdomain) || null;

			} else if (rhost !== null) {

				host = settings.hosts.find(h => (h.ipv4 === host || h.ipv6 === host)) || null;

			}


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

						let host = settings.hosts.find(h => h.domain === rdomain) || null;
						if (host !== null) {

							host.ipv4 = payload.ipv4;
							host.ipv6 = payload.ipv6;

							settings.save();

						} else {

							host = {
								domain: rdomain,
								ipv4:   payload.ipv4,
								ipv6:   payload.ipv6
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

					} else {

						callback({
							headers: {
								service: 'host',
								event:   'read'
							},
							payload: null
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

	refresh: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			let rdomain = ref.domain || null;
			let rhost   = ref.host   || null;

			if (rdomain !== null) {

				let rsubdomain = ref.subdomain || null;
				if (rsubdomain !== null) {
					rdomain = rsubdomain + '.' + rdomain;
				}

				host = settings.hosts.find(h => h.domain === rdomain) || null;

			} else if (rhost !== null) {

				host = settings.hosts.find(h => (h.ipv4 === host || h.ipv6 === host)) || null;

			}


			DNS.resolve(ref, response => {

				let payload = response.payload || null;
				if (payload !== null) {

					let host = settings.hosts.find(h => h.domain === rdomain) || null;
					if (host !== null) {

						host.ipv4 = payload.ipv4;
						host.ipv6 = payload.ipv6;

						settings.save();

					} else {

						host = {
							domain: rdomain,
							ipv4:   payload.ipv4,
							ipv6:   payload.ipv6
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

				} else {

					callback({
						headers: {
							service: 'host',
							event:   'refresh'
						},
						payload: null
					});

				}

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

	remove: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			let rdomain  = ref.domain || null;
			let rpayload = _validate_payload(ref.payload || null);

			if (rdomain !== null) {

				let rsubdomain = ref.subdomain || null;
				if (rsubdomain !== null) {
					rdomain = rsubdomain + '.' + rdomain;
				}

				host = settings.hosts.find(p => p.domain === rdomain) || null;

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
				payload: {
					result: true
				}
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'remove'
				},
				payload: {
					result: false
				}
			});

		}

	},

	save: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			let rdomain  = ref.domain || null;
			let rpayload = _validate_payload(ref.payload || null);

			if (rdomain !== null) {

				let rsubdomain = ref.subdomain || null;
				if (rsubdomain !== null) {
					rdomain = rsubdomain + '.' + rdomain;
				}

				host = settings.hosts.find(p => p.domain === rdomain) || null;

			}


			if (host !== null && rpayload !== null) {

				let ipv4 = IP.parse(rpayload.ipv4);
				let ipv6 = IP.parse(rpayload.ipv6);

				if (ipv4.type === 'v4') {
					host.ipv4 = ipv4.ip;
				}

				if (ipv6.type === 'v6') {
					host.ipv6 = ipv6.ip;
				}

				settings.save();

			} else if (rdomain !== null) {

				let ipv4 = IP.parse(rpayload.ipv4);
				let ipv6 = IP.parse(rpayload.ipv6);

				settings.hosts.push({
					domain: rdomain,
					ipv4:   ipv4.type === 'v4' ? ipv4.ip : null,
					ipv6:   ipv6.type === 'v6' ? ipv6.ip : null
				});

				settings.save();

			}

			callback({
				headers: {
					service: 'host',
					event:   'save'
				},
				payload: {
					result: true
				}
			});

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

