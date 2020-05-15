
import { Emitter, isFunction, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                             } from '../ENVIRONMENT.mjs';
import { IP                                      } from '../parser/IP.mjs';
import { Client, isClient                        } from '../Client.mjs';



const connect_client = function(hosts, callback) {

	let success = false;
	let client  = new Client({
		host: hosts.shift().ip
	});

	client.once('connect', () => {

		success = true;

		if (this.stealth.peers.includes(client) === false) {
			this.stealth.peers.push(client);
		}

		callback(client);

	});

	client.once('disconnect', () => {

		let index = this.stealth.peers.indexOf(client);
		if (index !== -1) {
			this.stealth.peers.splice(index, 1);
		}


		if (success === false) {

			if (hosts.length > 0) {
				connect_client.call(this, hosts, callback);
			} else {
				callback(null);
			}

		}

	});

	client.connect();

};

const connect_peer = function(hosts, callback) {

	if (hosts.length > 0) {

		let client = null;

		hosts.forEach((host) => {

			if (client === null) {

				let peer = this.stealth.peers.find((p) => p.address === host.ip) || null;
				if (isClient(peer) === true) {

					if (peer.is('connected') === true) {

						client = peer;

					} else {

						let index = this.stealth.peers.indexOf(peer);
						if (index !== -1) {
							this.stealth.peers.splice(index, 1);
						}

					}

				}

			}

		});

		if (isClient(client) === true && client.is('connected') === true) {
			callback(client);
		} else {
			connect_client.call(this, hosts, callback);
		}

	} else {

		callback(null);

	}

};



const CONNECTION = [ 'offline', 'mobile', 'broadband', 'peer', 'i2p', 'tor' ];

const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain     = isString(payload.domain)                ? payload.domain     : null;
		payload.subdomain  = isString(payload.subdomain)             ? payload.subdomain  : null;
		payload.host       = isString(payload.host)                  ? payload.host       : null;
		payload.connection = CONNECTION.includes(payload.connection) ? payload.connection : 'offline';

		return payload;

	}

	return null;

};

const proxify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain    = isString(payload.domain)      ? payload.domain    : null;
		payload.subdomain = isString(payload.subdomain)   ? payload.subdomain : null;
		payload.host      = isString(payload.host)        ? payload.host      : null;
		payload.payload   = payload.payload !== undefined ? payload.payload   : null;


		if (isObject(payload.headers) === true) {

			payload.headers = Object.assign({}, raw.headers);

			payload.headers.service = isString(payload.headers.service) ? payload.headers.service : null;
			payload.headers.method  = isString(payload.headers.method)  ? payload.headers.method  : null;
			payload.headers.event   = isString(payload.headers.event)   ? payload.headers.event   : null;


			if (payload.headers.service !== null) {

				if (payload.headers.service === 'peer' && payload.headers.method === 'proxy') {
					return null;
				}

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


Peer.isPeer = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isString(payload.connection) === true
		&& CONNECTION.includes(payload.connection)
	) {
		return true;
	}


	return false;

};


Peer.prototype = Object.assign({}, Emitter.prototype, {

	info: function(payload, callback) {

		payload  = payload !== undefined ? payload  : null;
		callback = isFunction(callback)  ? callback : null;


		if (callback !== null) {

			let settings = this.stealth.settings;

			callback({
				headers: {
					service: 'peer',
					event:   'info'
				},
				payload: {
					domain:     ENVIRONMENT.hostname,
					connection: settings.internet.connection
				}
			});

		}

	},

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


			// Always allow to call Peer.info()
			if (host !== null && peer === null) {

				if (payload.headers.service === 'peer' && payload.headers.method === 'info') {

					peer = {
						domain:     host.domain,
						connection: 'peer'
					};

				}

			}


			if (host !== null && peer !== null) {

				connect_peer.call(this, IP.sort(host.hosts), (client) => {

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

	refresh: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


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

				connect_peer.call(this, IP.sort(host.hosts), (client) => {

					if (client !== null) {

						let service = client.services.peer || null;
						if (service !== null) {

							service.info(null, (response) => {

								if (response !== null) {

									if (CONNECTION.includes(response.connection)) {
										peer.connection = response.connection;
									}

								}

								callback({
									headers: {
										service: 'peer',
										event:   'refresh'
									},
									payload: peer
								});

							});

						} else {

							callback({
								headers: {
									service: 'peer',
									event:   'refresh'
								},
								payload: null
							});

						}

					} else {

						callback({
							headers: {
								service: 'peer',
								event:   'refresh'
							},
							payload: null
						});

					}

				});

			} else {

				callback({
					headers: {
						service: 'peer',
						event:   'refresh'
					},
					payload: peer
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'refresh'
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

			} else if (payload.host !== null) {
				peer = settings.peers.find((p) => p.domain === payload.host) || null;
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

