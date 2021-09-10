
import { Emitter, isArray, isFunction, isObject, isString } from '../../../extern/base.mjs';
import { IP                                               } from '../../../source/parser/IP.mjs';



const toDomain = function(payload) {

	let domain = null;

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		}

	}

	return domain;

};

const toQuery = function(payload) {

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {

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

	}

	return null;

};

const toIP = function(payload) {

	let ip = null;

	if (isObject(payload) === true) {

		if (isString(payload.host) === true) {

			let value = IP.parse(payload.host);
			if (IP.isIP(value) === true) {
				ip = value;
			}

		}

	}

	return ip;

};



const Host = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


/*
 * {
 *   "domain": "example.com",
 *   "hosts":  [
 *     IP.parse("1.3.3.7")
 *   ]
 * }
 */

Host.isHost = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.hosts) === true
	) {

		let check = payload.hosts.filter((ip) => IP.isIP(ip) === true);
		if (check.length === payload.hosts.length) {
			return true;
		}

	}


	return false;

};

Host.toHost = function(payload) {

	if (isObject(payload) === true) {

		let domain = null;

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host) === true) {
			domain = payload.host;
		}

		if (domain !== null) {

			if (isArray(payload.hosts) === true) {

				return {
					domain: domain,
					hosts:  payload.hosts.filter((ip) => IP.isIP(ip) === true)
				};

			}

		}

	}


	return null;

};


Host.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Host Service',
			'data': data
		};

	},

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

			this.resolve(payload, (response) => {

				if (callback !== null) {

					callback({
						headers: {
							service: 'host',
							event:   'read'
						},
						payload: response.payload
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

	resolve: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let domain = toDomain(payload);
		let query  = toQuery(payload);

		if (domain !== null && query !== null) {

			this.stealth.server.peerer.resolve(query, (local_response) => {

				if (local_response !== null) {

					let host_old = this.stealth.settings.hosts.find((h) => h.domain === domain) || null;
					let host_new = Host.toHost(local_response);

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
								event:   'resolve'
							},
							payload: host_new
						});

					}

				} else {

					this.stealth.server.router.resolve(query, (remote_response) => {

						if (remote_response !== null) {

							let host_old = this.stealth.settings.hosts.find((h) => h.domain === domain) || null;
							let host_new = Host.toHost(remote_response);

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
										event:   'resolve'
									},
									payload: host_new
								});

							}

						} else {

							if (callback !== null) {

								callback({
									headers: {
										service: 'host',
										event:   'resolve'
									},
									payload: null
								});

							}

						}

					});

				}

			});

		} else {

			if (callback !== null) {

				callback({
					headers: {
						service: 'host',
						event:   'resolve'
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

