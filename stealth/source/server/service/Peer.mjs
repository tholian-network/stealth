
import { Emitter, isFunction, isObject, isString } from '../../../extern/base.mjs';
import { ENVIRONMENT                             } from '../../../source/ENVIRONMENT.mjs';
import { VERSION                                 } from '../../../source/Stealth.mjs';



const CONNECTION = [ 'offline', 'mobile', 'broadband', 'peer', 'tor' ];

const toDomain = function(payload) {

	let domain = null;

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host) === true) {
			domain = payload.host;
		}

	}

	return domain;

};



const Peer = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


/*
 * {
 *   "domain": "username.tholian.network",
 *   "peer": {
 *     "connection":  "broadband",
 *     "certificate": "sha512_hash",
 *     "version":     "X0:2021-12-01"
 *   }
 * }
 */

Peer.isPeer = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isObject(payload.peer) === true
		&& isString(payload.peer.connection) === true
		&& CONNECTION.includes(payload.peer.connection) === true
		&& isString(payload.peer.certificate) === true || payload.peer.certificate === null
		&& isString(payload.peer.version) === true
	) {
		return true;
	}


	return false;

};

Peer.toPeer = function(payload) {

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

		if (domain !== null && isObject(payload.peer) === true) {

			if (isString(payload.peer.connection) === true) {

				return {
					domain: domain,
					peer:   {
						connection:  CONNECTION.includes(payload.peer.connection) ? payload.peer.connection  : 'offline',
						certificate: isString(payload.peer.certificate)           ? payload.peer.certificate : null,
						version:     isString(payload.peer.version)               ? payload.peer.version     : VERSION
					}
				};

			}

		}

	}


	return null;

};


Peer.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Peer Service',
			'data': data
		};

	},

	info: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'info'
				},
				payload: {
					domain: ENVIRONMENT.hostname,
					peer:   {
						connection:  this.stealth.settings.internet.connection,
						certificate: null,
						version:     VERSION
					}
				}
			});

		}

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let peer   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			peer = this.stealth.settings.peers.find((p) => p.domain === domain) || null;
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'read'
				},
				payload: peer
			});

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let peer   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			peer = this.stealth.settings.peers.find((p) => p.domain === domain) || null;
		}

		if (peer !== null) {
			this.stealth.settings.peers.remove(peer);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'remove'
				},
				payload: (domain !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let peer_old = null;
		let peer_new = Peer.toPeer(payload);

		let domain = toDomain(payload);
		if (domain !== null) {
			peer_old = this.stealth.settings.peers.find((p) => p.domain === domain) || null;
		}

		if (peer_new !== null) {

			if (peer_old !== null) {
				peer_old.peer.connection = peer_new.peer.connection;
			} else {
				this.stealth.settings.peers.push(peer_new);
			}

			this.stealth.settings.save();

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'save'
				},
				payload: (peer_new !== null)
			});

		}

	}

});


export { Peer };

