
import { Emitter, isArray, isFunction, isObject, isString } from '../../extern/base.mjs';
import { DNS                                              } from '../protocol/DNS.mjs';
import { IP                                               } from '../parser/IP.mjs';



const toDomain = function(payload) {

	let domain = null;

	if (isString(payload.domain)) {

		if (isString(payload.subdomain)) {
			domain = payload.subdomain + '.' + payload.domain;
		} else {
			domain = payload.domain;
		}

	}

	return domain;

};

const toQuery = function(payload) {

	if (isString(payload.domain)) {

		if (isString(payload.subdomain)) {

			return {
				domain:    payload.domain,
				subdomain: payload.subdomain
			};

		} else {

			return {
				domain:    payload.domain,
				subdomain: null
			};

		}

	}

	return null;

};

const toIP = function(payload) {

	let ip = null;

	if (isString(payload.host)) {

		let value = IP.parse(payload.host);
		if (IP.isIP(value)) {
			ip = value;
		}

	}

	return ip;

};



const Host = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Host.isHost = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.hosts) === true
	) {

		let check = payload.hosts.filter((ip) => IP.isIP(ip));
		if (check.length === payload.hosts.length) {
			return true;
		}

	}


	return false;

};


Host.toHost = function(payload) {

	if (isObject(payload)) {

		let domain = null;

		if (isString(payload.domain)) {

			if (isString(payload.subdomain)) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host)) {
			domain = payload.host;
		}

		if (domain !== null && isArray(payload.hosts)) {

			let check = payload.hosts.filter((ip) => IP.isIP(ip));
			if (check.length === payload.hosts.length) {

				return {
					domain: domain,
					hosts:  payload.hosts
				};

			}

		}

	}


	return null;

};


Host.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let host   = null;
		let domain = toDomain(payload);
		let query  = toQuery(payload);
		let ip     = toIP(payload);

		if (domain !== null) {
			host = this.stealth.settings.hosts.find((h) => h.domain === domain) || null;
		} else if (ip !== null) {
			host = this.stealth.settings.hosts.find((h) => {
				return h.hosts.find((h) => h.ip === ip.ip) !== undefined;
			}) || null;
		}


		if (host !== null) {

			if (callback !== null) {

				callback({
					headers: {
						service: 'host',
						event:   'read'
					},
					payload: host
				});

			}

		} else if (query !== null) {

			DNS.resolve(query, (response) => {

				let host_old = null;
				let host_new = Host.toHost(response.payload);

				let domain = toDomain(response.payload);
				if (domain !== null) {
					host_old = this.stealth.settings.hosts.find((h) => h.domain === domain) || null;
				}

				if (host_new !== null) {

					if (host_old !== null) {

						host_old.hosts = host_new.hosts;

					} else {
						this.stealth.settings.hosts.push(host_new);
					}

					this.stealth.settings.save();

				}


				if (callback !== null) {

					callback({
						headers: {
							service: 'host',
							event:   'read'
						},
						payload: host_new
					});

				}

			});

		} else {

			if (callback !== null) {

				callback({
					headers: {
						service: 'host',
						event:   'read'
					},
					payload: null
				});

			}

		}

	},

	refresh: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let query = toQuery(payload);
		if (query !== null) {

			DNS.resolve(query, (response) => {

				let host_old = null;
				let host_new = Host.toHost(response.payload);

				let domain = toDomain(response.payload);
				if (domain !== null) {
					host_old = this.stealth.settings.hosts.find((h) => h.domain === domain) || null;
				}

				if (host_new !== null) {

					if (host_old !== null) {

						host_old.hosts = host_new.hosts;

					} else {
						this.stealth.settings.hosts.push(host_new);
					}

					this.stealth.settings.save();

				}


				if (callback !== null) {

					callback({
						headers: {
							service: 'host',
							event:   'refresh'
						},
						payload: host_new
					});

				}

			});

		} else {

			if (callback !== null) {

				callback({
					headers: {
						service: 'host',
						event:   'refresh'
					},
					payload: null
				});

			}

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let host   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			host = this.stealth.settings.hosts.find((h) => h.domain === domain) || null;
		}

		if (host !== null) {
			this.stealth.settings.hosts.remove(host);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'remove'
				},
				payload: (domain !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let host_old = null;
		let host_new = Host.toHost(payload);

		let domain = toDomain(payload);
		if (domain !== null) {
			host_old = this.stealth.settings.hosts.find((h) => h.domain === domain) || null;
		}

		if (host_new !== null) {

			if (host_old !== null) {

				host_old.hosts = host_new.hosts;

			} else {
				this.stealth.settings.hosts.push(host_new);
			}

			this.stealth.settings.save();

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'save'
				},
				payload: (host_new !== null)
			});

		}

	}

});


export { Host };

