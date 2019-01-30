
import { MODES   } from '../Stealth.mjs';
import { Emitter } from '../Emitter.mjs';



const _validate_payload = function(payload) {

	if (payload instanceof Object) {

		let capacity = payload.capacity || 'offline';
		let mode     = payload.mode     || 'offline';

		if (
			MODES.includes(capacity) === true
			&& MODES.includes(mode) === true
		) {
			return payload;
		}

	}

	return null;

};



const Peer = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Peer.prototype = Object.assign({}, Emitter.prototype, {

	read: function(ref, callback) {

		ref      = ref instanceof Object        ? ref      : null;
		callback = callback instanceof Function ? callback : null;


		if (ref !== null && callback !== null) {

			let peer     = null;
			let settings = this.stealth.settings;

			let rdomain = ref.domain || null;
			let rhost   = ref.host   || null;

			if (rdomain !== null) {

				let rsubdomain = ref.subdomain || null;
				if (rsubdomain !== null) {
					rdomain = rsubdomain + '.' + rdomain;
				}

				peer = settings.peers.find(p => p.domain === rdomain) || null;

			} else if (rhost !== null) {

				peer = settings.peers.find(p => p.domain === rhost) || null;

			}


			if (peer !== null) {

				callback({
					headers: {
						service: 'peer',
						event:   'read'
					},
					payload: peer
				});

			} else {

				callback({
					headers: {
						service: 'peer',
						event:   'read'
					},
					payload: null
				});

			}

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

	save: function(ref, callback) {

		ref      = ref instanceof Object        ? ref      : null;
		callback = callback instanceof Function ? callback : null;


		if (ref !== null && callback !== null) {

			let peer     = null;
			let settings = this.stealth.settings;

			let rdomain  = ref.domain || null;
			let rhost    = ref.host   || null;
			let rpayload = _validate_payload(ref.payload || null);

			if (rdomain !== null) {

				let rsubdomain = ref.subdomain || null;
				if (rsubdomain !== null) {
					rdomain = rsubdomain + '.' + rdomain;
				}

				peer = settings.peers.find(p => p.domain === rdomain) || null;

			} else if (rhost !== null) {

				peer = settings.peers.find(p => p.domain === rhost) || null;

			}


			if (peer !== null && rpayload !== null) {

				peer.capacity = rpayload.capacity || 'offline';
				peer.mode     = rpayload.mode     || 'offline';

			} else if (rdomain !== null || rhost !== null) {

				settings.peers.push({
					domain:   rdomain || rhost,
					capacity: rpayload.capacity || 'offline',
					mode:     rpayload.mode     || 'offline'
				});

			}


			settings.save(result => {

				callback({
					headers: {
						service: 'peer',
						event:   'save'
					},
					payload: {
						result: result
					}
				});

			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'peer',
					event:   'save'
				},
				payload: {
					result: false
				}
			});

		}

	}

});


export { Peer };

