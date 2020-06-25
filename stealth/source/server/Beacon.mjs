
import { Emitter, isArray, isFunction, isObject, isString } from '../../extern/base.mjs';



const toDomain = function(payload) {

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

	return domain;

};

const toPath = function(payload) {

	let path = null;

	if (isString(payload.path)) {
		path = payload.path;
	}

	return path;

};



const Beacon = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Beacon.isBeacon = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isString(payload.path) === true
		&& isArray(payload.beacons) === true
	) {

		let check = payload.beacons.filter((beacon) => {

			if (
				isString(beacon.label) === true
				&& isArray(beacon.select) === true
				&& [ 'text', 'image', 'audio', 'video', 'other' ].includes(beacon.mode)
			) {
				return true;
			}

			return false;

		});

		if (check.length === payload.beacons.length) {
			return true;
		}

	}


	return false;

};


Beacon.toBeacon = function(payload) {

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

		if (domain !== null && isString(payload.path) && isArray(payload.beacons)) {

			let check = payload.beacons.filter((beacon) => {

				if (
					isString(beacon.label) === true
					&& isArray(beacon.select) === true
					&& [ 'text', 'image', 'audio', 'video', 'other' ].includes(beacon.mode)
				) {
					return true;
				}

				return false;

			});

			if (check.length === payload.beacons.length) {

				return {
					domain:  domain,
					path:    payload.path,
					beacons: payload.beacons
				};

			}

		}

	}


	return null;

};


Beacon.prototype = Object.assign({}, Emitter.prototype, {

	query: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let beacons = [];
		let domain  = toDomain(payload);
		let path    = toPath(payload);

		if (domain !== null && path !== null) {

			let temp = [];

			if (domain === '*') {
				temp = this.stealth.settings.beacons;
			} else {
				temp = this.stealth.settings.beacons.filter((b) => b.domain === domain);
			}

			if (path === '*') {
				// Do nothing
			} else if (path.startsWith('*')) {
				temp = temp.filter((t) => t.path.endsWith(path.substr(1)));
			} else if (path.endsWith('*')) {
				temp = temp.filter((t) => t.path.startsWith(path.substr(0, path.length - 1)));
			}

			beacons = temp;

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'beacon',
					event:   'query'
				},
				payload: beacons
			});

		}

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let beacon = null;
		let domain = toDomain(payload);
		let path   = toPath(payload);
		if (domain !== null && path !== null) {
			beacon = this.stealth.settings.beacons.find((b) => b.domain === domain && b.path === path) || null;
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'beacon',
					event:   'read'
				},
				payload: beacon
			});

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let beacon = null;
		let domain = toDomain(payload);
		let path   = toPath(payload);
		if (domain !== null && path !== null) {
			beacon = this.stealth.settings.beacons.find((b) => b.domain === domain && b.path === path) || null;
		}

		if (beacon !== null) {
			this.stealth.settings.beacons.remove(beacon);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'beacon',
					event:   'remove'
				},
				payload: (domain !== null && path !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let beacon_old = null;
		let beacon_new = Beacon.toBeacon(payload);

		let domain = toDomain(payload);
		let path   = toPath(payload);
		if (domain !== null && path !== null) {
			beacon_old = this.stealth.settings.beacons.find((b) => b.domain === domain) || null;
		}

		if (beacon_new !== null) {

			if (beacon_old !== null) {

				beacon_old.beacons = beacon_new.beacons;

			} else {
				this.stealth.settings.beacons.push(beacon_new);
			}

			this.stealth.settings.save();

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'beacon',
					event:   'save'
				},
				payload: (beacon_new !== null)
			});

		}

	}

});


export { Beacon };

