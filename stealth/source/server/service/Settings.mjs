
import { Emitter, isArray, isBoolean, isFunction, isObject } from '../../../extern/base.mjs';
import { Beacon                                            } from '../../../source/server/service/Beacon.mjs';
import { Echo                                              } from '../../../source/server/service/Echo.mjs';
import { Host                                              } from '../../../source/server/service/Host.mjs';
import { Mode                                              } from '../../../source/server/service/Mode.mjs';
import { Peer                                              } from '../../../source/server/service/Peer.mjs';
import { Policy                                            } from '../../../source/server/service/Policy.mjs';
import { Redirect                                          } from '../../../source/server/service/Redirect.mjs';
import { Task                                              } from '../../../source/server/service/Task.mjs';



const readify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		if (Object.keys(payload).length > 0) {

			payload = Object.assign({}, raw);

			payload['interface'] = isBoolean(payload['interface']) ? payload['interface'] : false;
			payload['internet']  = isBoolean(payload['internet'])  ? payload['internet']  : false;
			payload['beacons']   = isBoolean(payload['beacons'])   ? payload['beacons']   : false;
			payload['blockers']  = isBoolean(payload['blockers'])  ? payload['blockers']  : false;
			payload['echos']     = isBoolean(payload['echos'])     ? payload['echos']     : false;
			payload['hosts']     = isBoolean(payload['hosts'])     ? payload['hosts']     : false;
			payload['modes']     = isBoolean(payload['modes'])     ? payload['modes']     : false;
			payload['peers']     = isBoolean(payload['peers'])     ? payload['peers']     : false;
			payload['policies']  = isBoolean(payload['policies'])  ? payload['policies']  : false;
			payload['redirects'] = isBoolean(payload['redirects']) ? payload['redirects'] : false;
			payload['sessions']  = isBoolean(payload['sessions'])  ? payload['sessions']  : false;
			payload['tasks']     = isBoolean(payload['tasks'])     ? payload['tasks']     : false;

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
		payload['echos']     = isArray(payload['echos'])      ? payload['echos']     : [];
		payload['hosts']     = isArray(payload['hosts'])      ? payload['hosts']     : [];
		payload['modes']     = isArray(payload['modes'])      ? payload['modes']     : [];
		payload['peers']     = isArray(payload['peers'])      ? payload['peers']     : [];
		payload['policies']  = isArray(payload['policies'])   ? payload['policies']  : [];
		payload['redirects'] = isArray(payload['redirects'])  ? payload['redirects'] : [];
		payload['sessions']  = []; // cannot be saved
		payload['tasks']     = isArray(payload['tasks'])      ? payload['tasks']     : [];

		if (isArray(payload['beacons']) === true) {
			payload['beacons'] = payload['beacons'].filter((beacon) => Beacon.isBeacon(beacon));
		}

		if (isArray(payload['echos']) === true) {
			payload['echos'] = payload['echos'].filter((echo) => Echo.isEcho(echo));
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

		if (isArray(payload['policies']) === true) {
			payload['policies'] = payload['policies'].filter((policy) => Policy.isPolicy(policy));
		}

		if (isArray(payload['redirects']) === true) {
			payload['redirects'] = payload['redirects'].filter((redirect) => Redirect.isRedirect(redirect));
		}

		if (isArray(payload['tasks']) === true) {
			payload['tasks'] = payload['tasks'].filter((task) => Task.isTask(task));
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

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Settings Service',
			'data': data
		};

	},

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
							'echos':     null,
							'hosts':     null,
							'modes':     null,
							'peers':     null,
							'policies':  null,
							'redirects': null,
							'sessions':  null,
							'tasks':     null
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
							'blockers':  blob.data['blockers'],
							'echos':     blob.data['echos'],
							'hosts':     blob.data['hosts'],
							'modes':     blob.data['modes'],
							'peers':     blob.data['peers'],
							'policies':  blob.data['policies'],
							'redirects': blob.data['redirects'],
							'sessions':  blob.data['sessions'],
							'tasks':     blob.data['tasks']
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

				let other = settings['beacons'].find((b) => b.domain === beacon.domain) || null;
				if (other !== null) {
					settings['beacons'].remove(other);
				}

				settings['beacons'].push(beacon);

			});

			payload['echos'].forEach((echo) => {

				let other = settings['echos'].find((e) => e.domain === echo.domain) || null;
				if (other !== null) {
					settings['echos'].remove(other);
				}

				settings['echos'].push(echo);

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

			payload['policies'].forEach((policy) => {

				let other = settings['policies'].find((p) => p.domain === policy.domain) || null;
				if (other !== null) {
					settings['policies'].remove(other);
				}

				settings['policies'].push(policy);

			});

			payload['redirects'].forEach((redirect) => {

				let other = settings['redirects'].find((r) => r.domain === redirect.domain) || null;
				if (other !== null) {
					settings['redirects'].remove(other);
				}

				settings['redirects'].push(redirect);

			});

			payload['tasks'].forEach((task) => {

				let other = settings['tasks'].find((t) => t.domain === task.domain) || null;
				if (other !== null) {
					settings['tasks'].remove(other);
				}

				settings['tasks'].push(task);

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

