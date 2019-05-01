
import { isFunction, isObject } from '../POLYFILLS.mjs';

import { console } from '../console.mjs';
import { Emitter } from '../Emitter.mjs';
import { URL     } from '../parser/URL.mjs';
import { Client  } from '../Client.mjs';



const CONNECTION = [ 'mobile', 'broadband', 'peer', 'i2p', 'tor' ];
const STATUS     = [ 'online', 'offline' ];

const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload)) {

		payload = Object.assign({}, raw);

		payload.domain     = typeof payload.domain === 'string'      ? payload.domain     : null;
		payload.subdomain  = typeof payload.subdomain === 'string'   ? payload.subdomain  : null;
		payload.host       = typeof payload.host === 'string'        ? payload.host       : null;
		payload.connection = CONNECTION.includes(payload.connection) ? payload.connection : 'offline';
		payload.status     = STATUS.includes(payload.status)         ? payload.status     : 'offline';

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


			console.warn('TODO: peer.proxy()', payload);

			if (peer !== null) {

				let ref = URL.parse(peer.domain);

				if (ref.host !== null) {

					let client = this.stealth.peers.find((p) => p.address === ref.host) || null;
					if (client === null) {
						client = new Client();
					}

					if (client !== null) {

						client.connect(ref.host, 65432, (result) => {

							if (result === true) {

								let index = this.stealth.peers.indexOf(client);
								if (index === -1) {
									this.stealth.peers.push(client);
								}

								// TODO: Use Client to (re)connect and execute service requests

							} else {

								let index = this.stealth.peers.indexOf(client);
								if (index !== -1) {
									this.stealth.peers.splice(index, 1);
								}

							}

						});

					}

				} else if (ref.domain !== null) {


					// TODO: Resolve via DNS protocol and reuse client if possible

				}

				console.warn(peer, ref);

			}



			let response = null;

			if (Math.random() > 0.3) {

				let date1 = new Date();
				let date2 = new Date();

				date1.setMonth((Math.random() * 12) | 0);
				date1.setDate((Math.random() * 30) | 0);

				date2.setMonth((Math.random() * 12) | 0);
				date2.setDate((Math.random() * 30) | 0);

				response = {
					headers: {
						time: date1.toISOString(),
						size: (Math.random() * 13337) | 0
					},
					payload: {
						time: date2.toISOString(),
						size: (Math.random() * 133337) | 0
					}
				};

			}

			callback({
				headers: {
					service: 'peer',
					event:   'proxy'
				},
				payload: response
			});

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
				peer.status     = payload.status     || 'offline';

				settings.save();

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}

				peer = {
					domain:     payload.domain,
					connection: payload.connection || 'offline',
					status:     payload.status     || 'offline'
				};

				settings.peers.push(peer);
				settings.save();

			} else if (payload.host !== null) {

				peer = {
					domain:     payload.host,
					connection: payload.connection || 'offline',
					status:     payload.status     || 'offline'
				};

				settings.peers.push(peer);
				settings.save();

			}


			callback({
				headers: {
					service: 'peer',
					event:   'save'
				},
				payload: true
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

