
import { MODES   } from '../Stealth.mjs';
import { Emitter } from '../Emitter.mjs';



const _payloadify = function(payload) {

	if (payload instanceof Object) {

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;

		payload.capacity = MODES.includes(payload.capacity) ? payload.capacity : 'offline';
		payload.mode     = MODES.includes(payload.mode)     ? payload.mode     : 'offline';

		return payload;

	}

	return null;

};



const Peer = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Peer.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let peer     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					peer = settings.peers.find(p => p.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					peer = settings.peers.find(p => p.domain === payload.domain) || null;
				}

			} else if (payload.host !== null) {
				peer = settings.peers.find(p => p.domain === payload.host) || null;
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

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let peer = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					peer = settings.peers.find(p => p.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					peer = settings.peers.find(p => p.domain === payload.domain) || null;
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

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let peer     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					peer = settings.peers.find(p => p.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					peer = settings.peers.find(p => p.domain === payload.domain) || null;
				}

			} else if (payload.host !== null) {
				peer = settings.peers.find(p => p.domain === payload.host) || null;
			}


			if (peer !== null) {

				peer.capacity = payload.capacity || 'offline';
				peer.mode     = payload.mode     || 'offline';

				settings.save();

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}

				peer = {
					domain:   payload.domain,
					capacity: payload.capacity || 'offline',
					mode:     payload.mode     || 'offline'
				};

				settings.peers.push(peer);
				settings.save();

			} else if (payload.host !== null) {

				peer = {
					domain:   payload.host,
					capacity: payload.capacity || 'offline',
					mode:     payload.mode     || 'offline'
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

