
import { isFunction, isObject } from '../POLYFILLS.mjs';

import { Emitter } from '../Emitter.mjs';
import { IP      } from '../parser/IP.mjs';
import { Client  } from '../Client.mjs';



const on_connect = function(callback, client, ips, result) {

	if (result === true) {

		if (this.stealth.peers.includes(client) === false) {
			this.stealth.peers.push(client);
		}

		callback(client);

	} else {

		let ip = ips.shift() || null;
		if (ip !== null) {
			client.connect(ip, (result) => on_connect.call(this, callback, client, ips, result));
		} else {
			callback(null);
		}

	}

};

const connect = function(host, peer, callback) {

	callback = isFunction(callback) ? callback : null;


	let hosts = IP.sort(host.hosts);
	if (hosts.length > 0) {

		let client = null;
		let ips    = hosts.map((ip) => ip.ip);

		for (let i = 0, il = ips.length; i < il; i++) {

			let instance = this.stealth.peers.find((p) => p.address === ips[i]) || null;
			if (instance !== null) {
				client = instance;
				break;
			}

		}

		if (client !== null && client.connection === null) {

			let index = this.stealth.peers.indexOf(client);
			if (index !== -1) {
				this.stealth.peers.splice(index, 1);
			}

			client = null;

		}

		if (client === null) {

			client = new Client();
			client.connect(ips.shift(), (result) => on_connect.call(this, callback, client, ips, result));

		} else {

			if (callback !== null) {
				callback(client);
			} else {
				return client;
			}

		}

	} else {

		if (callback !== null) {
			callback(null);
		} else {
			return null;
		}

	}

};

const CONNECTION = [ 'offline', 'mobile', 'broadband', 'peer', 'i2p', 'tor' ];

const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload)) {

		payload = Object.assign({}, raw);

		payload.domain     = typeof payload.domain === 'string'      ? payload.domain     : null;
		payload.subdomain  = typeof payload.subdomain === 'string'   ? payload.subdomain  : null;
		payload.host       = typeof payload.host === 'string'        ? payload.host       : null;
		payload.connection = CONNECTION.includes(payload.connection) ? payload.connection : 'offline';

		return payload;

	}

	return null;

};

const proxify = function(raw) {

	let payload = raw;
	if (isObject(payload)) {

		payload = Object.assign({}, raw);

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;
		payload.payload   = payload.payload !== undefined         ? payload.payload   : null;


		if (isObject(payload.headers)) {

			payload.headers = Object.assign({}, raw.headers);

			payload.headers.service = typeof payload.headers.service === 'string' ? payload.headers.service : null;
			payload.headers.method  = typeof payload.headers.method === 'string'  ? payload.headers.method  : null;
			payload.headers.event   = typeof payload.headers.event === 'string'   ? payload.headers.event   : null;


			if (payload.headers.service !== null && payload.headers.service !== 'peer') {

				if (payload.headers.method !== null || payload.headers.event !== null) {
					return payload;
				}

			}

		}

	}

	return null;

};



const Peer = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Peer.prototype = Object.assign({}, Emitter.prototype, {

	proxy: function(payload, callback) {

		payload  = isObject(payload)    ? proxify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null && callback !== null) {

			let peer     = null;
			let host     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					host = settings.hosts.find((h) => h.domain === payload.subdomain + '.' + payload.domain) || null;
					peer = settings.peers.find((p) => p.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					host = settings.hosts.find((h) => h.domain === payload.domain) || null;
					peer = settings.peers.find((p) => p.domain === payload.domain) || null;
				}

			} else if (payload.host !== null) {
				host = {
					domain: payload.host,
					hosts:  [ IP.parse(payload.host) ]
				};
				peer = settings.peers.find((p) => p.domain === payload.host) || null;
			}


			if (host !== null && peer !== null) {

				connect.call(this, host, peer, (client) => {

					if (client !== null) {

						let event   = payload.headers.event   || null;
						let method  = payload.headers.method  || null;
						let service = payload.headers.service || null;

						if (service !== null && event !== null) {

							let instance = client.services[service] || null;
							if (instance !== null) {

								let response = instance.emit(event, [ payload.payload ]);

								callback({
									headers: {
										service: 'peer',
										event:   'proxy'
									},
									payload: response
								});

							} else {

								callback({
									_warn_: true,
									headers: {
										service: 'peer',
										event:   'proxy'
									},
									payload: null
								});

							}

						} else if (service !== null && method !== null) {

							let instance = client.services[service] || null;
							if (instance !== null && isFunction(instance[method])) {

								instance[method](payload.payload, (response) => {

									callback({
										headers: {
											service: 'peer',
											event:   'proxy'
										},
										payload: response
									});

								});

							} else {

								callback({
									_warn_: true,
									headers: {
										service: 'peer',
										event:   'proxy'
									},
									payload: null
								});

							}

						} else {

							callback({
								_warn_: true,
								headers: {
									service: 'peer',
									event:   'proxy'
								},
								payload: null
							});

						}

					} else {

						callback({
							headers: {
								service: 'peer',
								event:   'proxy'
							},
							payload: null
						});

					}

				});

			} else {

				callback({
					_warn_: true,
					headers: {
						service: 'peer',
						event:   'proxy'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				_warn_: true,
				headers: {
					service: 'peer',
					event:   'proxy'
				},
				payload: null
			});

		}

	},

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let peer     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					peer = settings.peers.find((p) => p.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					peer = settings.peers.find((p) => p.domain === payload.domain) || null;
				}

			} else if (payload.host !== null) {
				peer = settings.peers.find((p) => p.domain === payload.host) || null;
			}


			callback({
				headers: {
					service: 'peer',
					event:   'read'
				},
				payload: peer
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'read'
				},
				payload: null
			});

		}

	},

	remove: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let peer = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					peer = settings.peers.find((p) => p.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					peer = settings.peers.find((p) => p.domain === payload.domain) || null;
				}

			}


			if (peer !== null) {

				let index = settings.peers.indexOf(peer);
				if (index !== -1) {
					settings.peers.splice(index, 1);
				}

				settings.save();

			}

			callback({
				headers: {
					service: 'peer',
					event:   'remove'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'remove'
				},
				payload: false
			});

		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let peer     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					peer = settings.peers.find((p) => p.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					peer = settings.peers.find((p) => p.domain === payload.domain) || null;
				}

			} else if (payload.host !== null) {
				peer = settings.peers.find((p) => p.domain === payload.host) || null;
			}


			if (peer !== null) {

				peer.connection = payload.connection || 'offline';

				settings.save();

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}

				peer = {
					domain:     payload.domain,
					connection: payload.connection || 'offline'
				};

				settings.peers.push(peer);
				settings.save();

			} else if (payload.host !== null) {

				peer = {
					domain:     payload.host,
					connection: payload.connection || 'offline'
				};

				settings.peers.push(peer);
				settings.save();

			}


			callback({
				headers: {
					service: 'peer',
					event:   'save'
				},
				payload: (peer !== null)
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Peer };

