
import { Emitter, isBoolean, isFunction, isObject, isString } from '../../../extern/base.mjs';



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



const Mode = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


/*
 * {
 *   "domain": "example.com",
 *   "mode":   {
 *     "text":  true,
 *     "image": true,
 *     "audio": false,
 *     "video": false,
 *     "other": true
 *   }
 * }
 */

Mode.isMode = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isObject(payload.mode) === true
		&& isBoolean(payload.mode.text) === true
		&& isBoolean(payload.mode.image) === true
		&& isBoolean(payload.mode.audio) === true
		&& isBoolean(payload.mode.video) === true
		&& isBoolean(payload.mode.other) === true
	) {
		return true;
	}


	return false;

};

Mode.toMode = function(payload) {

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

		if (domain !== null && isObject(payload.mode) === true) {

			return {
				domain: domain,
				mode: {
					text:  isBoolean(payload.mode.text)  ? payload.mode.text  : false,
					image: isBoolean(payload.mode.image) ? payload.mode.image : false,
					audio: isBoolean(payload.mode.audio) ? payload.mode.audio : false,
					video: isBoolean(payload.mode.video) ? payload.mode.video : false,
					other: isBoolean(payload.mode.other) ? payload.mode.other : false
				}
			};

		}

	}


	return null;

};


Mode.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Mode Service',
			'data': data
		};

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let mode   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			mode = this.stealth.settings.modes.find((m) => m.domain === domain) || null;
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'mode',
					event:   'read'
				},
				payload: mode
			});

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let mode   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			mode = this.stealth.settings.modes.find((m) => m.domain === domain) || null;
		}

		if (mode !== null) {
			this.stealth.settings.modes.remove(mode);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'mode',
					event:   'remove'
				},
				payload: (domain !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let mode_old = null;
		let mode_new = Mode.toMode(payload);

		let domain = toDomain(payload);
		if (domain !== null) {
			mode_old = this.stealth.settings.modes.find((m) => m.domain === domain) || null;
		}

		if (mode_new !== null) {

			if (mode_old !== null) {

				mode_old.mode.text  = mode_new.mode.text;
				mode_old.mode.image = mode_new.mode.image;
				mode_old.mode.audio = mode_new.mode.audio;
				mode_old.mode.video = mode_new.mode.video;
				mode_old.mode.other = mode_new.mode.other;

			} else {
				this.stealth.settings.modes.push(mode_new);
			}

			this.stealth.settings.save();

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'mode',
					event:   'save'
				},
				payload: (mode_new !== null)
			});

		}

	}

});


export { Mode };

