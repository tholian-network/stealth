
import { Emitter, isArray, isBoolean, isFunction, isObject } from '../../extern/base.mjs';
import { Beacon                                            } from './Beacon.mjs';
import { Host                                              } from './Host.mjs';
import { Mode                                              } from './Mode.mjs';
import { Peer                                              } from './Peer.mjs';



const readify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		if (Object.keys(payload).length > 0) {

			payload = Object.assign({}, raw);

			payload['interface'] = isBoolean(payload['interface']) ? payload['interface'] : false;
			payload['internet']  = isBoolean(payload['internet'])  ? payload['internet']  : false;
			payload['beacons']   = isBoolean(payload['beacons'])   ? payload['beacons']   : false;
			payload['blockers']  = false; // cannot be read
			payload['hosts']     = isBoolean(payload['hosts'])     ? payload['hosts']     : false;
			payload['modes']     = isBoolean(payload['modes'])     ? payload['modes']     : false;
			payload['peers']     = isBoolean(payload['peers'])     ? payload['peers']     : false;
			payload['redirects'] = false; // cannot be read
			payload['sessions']  = isBoolean(payload['sessions'])  ? payload['sessions']  : false;

			return payload;

		}

	}

	return null;

};

const saveify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload['interface'] = isObject(payload['interface']) ? payload['interface'] : {};
		payload['internet']  = isObject(payload['internet'])  ? payload['internet']  : {};
		payload['beacons']   = isArray(payload['beacons'])    ? payload['beacons']   : [];
		payload['blockers']  = []; // cannot be saved
		payload['hosts']     = isArray(payload['hosts'])      ? payload['hosts']     : [];
		payload['modes']     = isArray(payload['modes'])      ? payload['modes']     : [];
		payload['peers']     = isArray(payload['peers'])      ? payload['peers']     : [];
		payload['redirects'] = []; // cannot be saved
		payload['sessions']  = []; // cannot be saved

		if (isArray(payload['beacons']) === true) {
			payload.beacons = payload['beacons'].filter((beacon) => Beacon.isBeacon(beacon));
		}

		if (isArray(payload['hosts']) === true) {
			payload['hosts'] = payload['hosts'].filter((host) => Host.isHost(host));
		}

		if (isArray(payload['modes']) === true) {
			payload['modes'] = payload['modes'].filter((mode) => Mode.isMode(mode));
		}

		if (isArray(payload['peers']) === true) {
			payload['peers'] = payload['peers'].filter((peer) => Peer.isPeer(peer));
		}

		return payload;

	}

	return null;

};



const Settings = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	info: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let response = {
			profile: this.stealth.settings.profile,
			vendor:  this.stealth.settings.vendor
		};


		if (callback !== null) {

			callback({
				headers: {
					service: 'settings',
					event:   'info'
				},
				payload: response
			});

		}

	},

	read: function(payload, callback) {

		payload  = isObject(payload)    ? readify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null) {

			this.stealth.settings.read(false, (result) => {

				if (callback !== null) {

					if (result === true) {

						let blob = this.stealth.settings.toJSON();
						let data = {
							'interface': null,
							'internet':  null,
							'beacons':   null,
							'blockers':  null,
							'hosts':     null,
							'modes':     null,
							'peers':     null,
							'redirects': null,
							'sessions':  null
						};


						Object.keys(payload).forEach((key) => {

							if (payload[key] === true) {
								data[key] = blob.data[key] || null;
							}

						});


						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: data
						});

					} else {

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: null
						});

					}

				}

			});

		} else {

			this.stealth.settings.read(false, (result) => {

				if (callback !== null) {

					if (result === true) {

						let blob = this.stealth.settings.toJSON();
						let data = {
							'interface': blob.data['interface'],
							'internet':  blob.data['internet'],
							'beacons':   blob.data['beacons'],
							'blockers':  null,
							'hosts':     blob.data['hosts'],
							'modes':     blob.data['modes'],
							'peers':     blob.data['peers'],
							'redirects': null,
							'sessions':  blob.data['sessions']
						};


						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: data
						});

					} else {

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: null
						});

					}

				}

			});

		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? saveify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null && callback !== null) {

			let settings = this.stealth.settings;

			Object.keys(payload['interface']).forEach((key) => {

				if (settings['interface'][key] !== undefined) {
					settings['interface'][key] = payload['interface'][key];
				}

			});

			Object.keys(payload['internet']).forEach((key) => {

				if (settings['internet'][key] !== undefined) {
					settings['internet'][key] = payload['internet'][key];
				}

			});

			payload['beacons'].forEach((beacon) => {

				let other = settings['beacons'].find((b) => b.domain === beacon.domain && b.path === beacon.path) || null;
				if (other !== null) {
					settings['beacons'].remove(other);
				}

				settings['beacons'].push(beacon);

			});

			payload['hosts'].forEach((host) => {

				let other = settings['hosts'].find((h) => h.domain === host.domain) || null;
				if (other !== null) {
					settings['hosts'].remove(other);
				}

				settings['hosts'].push(host);

			});

			payload['modes'].forEach((mode) => {

				let other = settings['modes'].find((m) => m.domain === mode.domain) || null;
				if (other !== null) {
					settings['modes'].remove(other);
				}

				settings['modes'].push(mode);

			});

			payload['peers'].forEach((peer) => {

				let other = settings['peers'].find((p) => p.domain === peer.domain) || null;
				if (other !== null) {
					settings['peers'].remove(other);
				}

				settings['peers'].push(peer);

			});


			settings.save(false, (result) => {

				callback({
					headers: {
						service: 'settings',
						event:   'save'
					},
					payload: result
				});

			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'settings',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Settings };

