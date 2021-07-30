
import { Emitter, isArray, isFunction, isObject, isString } from '../../../extern/base.mjs';



const TERM = [ 'article', 'creator', 'date', 'description', 'identifier', 'language', 'license', 'publisher', 'source', 'subject', 'title', 'type' ];

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



const Beacon = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Beacon.isBeacon = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.beacons) === true
	) {

		let check = payload.beacons.filter((beacon) => {

			if (
				isObject(beacon) === true
				&& isString(beacon.path) === true
				&& /^([A-Za-z0-9*/:._-]+)?$/g.test(beacon.path) === true
				&& (
					(
						isString(beacon.query) === true
						&& /^([A-Za-z0-9/&=:._-]+)?$/g.test(beacon.query) === true
					) || (
						beacon.query === null
					)
				)
				&& isString(beacon.select) === true
				&& /^([a-z0-9#, =[\]\x22\x3e:._-]+)$/g.test(beacon.select) === true
				&& isString(beacon.term) === true
				&& TERM.includes(beacon.term) === true
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

		if (domain !== null && isArray(payload.beacons) === true) {

			let check = payload.beacons.filter((beacon) => {

				if (
					isObject(beacon) === true
					&& isString(beacon.path) === true
					&& (isString(beacon.query) === true || beacon.query === null)
					&& isString(beacon.select) === true
					&& isString(beacon.term) === true
					&& TERM.includes(beacon.term) === true
				) {
					return true;
				}

				return false;

			});

			if (check.length === payload.beacons.length) {

				return {
					domain:  domain,
					beacons: payload.beacons.map((beacon) => ({
						path:   beacon.path,
						query:  isString(beacon.query) ? beacon.query : null,
						select: beacon.select,
						term:   beacon.term
					}))
				};

			}

		}

	}


	return null;

};


Beacon.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Beacon Service',
			'data': data
		};

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let beacon = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			beacon = this.stealth.settings.beacons.find((b) => b.domain === domain) || null;
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
		if (domain !== null) {
			beacon = this.stealth.settings.beacons.find((b) => b.domain === domain) || null;
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
				payload: (domain !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let beacon_old = null;
		let beacon_new = Beacon.toBeacon(payload);

		let domain = toDomain(payload);
		if (domain !== null) {
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

