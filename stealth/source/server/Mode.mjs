
import { Emitter, isBoolean, isFunction, isObject, isString } from '../../extern/base.mjs';



const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain    = isString(payload.domain)    ? payload.domain    : null;
		payload.subdomain = isString(payload.subdomain) ? payload.subdomain : null;
		payload.host      = isString(payload.host)      ? payload.host      : null;

		if (isObject(payload.mode) === true) {

			payload.mode = Object.assign({}, raw.mode);

			payload.mode.text  = isBoolean(payload.mode.text)  ? payload.mode.text  : false;
			payload.mode.image = isBoolean(payload.mode.image) ? payload.mode.image : false;
			payload.mode.audio = isBoolean(payload.mode.audio) ? payload.mode.audio : false;
			payload.mode.video = isBoolean(payload.mode.video) ? payload.mode.video : false;
			payload.mode.other = isBoolean(payload.mode.other) ? payload.mode.other : false;

		}

		return payload;

	}


	return null;

};



const Mode = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Mode.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let mode     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					mode = settings.modes.find((m) => m.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					mode = settings.modes.find((m) => m.domain === payload.domain) || null;
				}

			}


			callback({
				headers: {
					service: 'mode',
					event:   'read'
				},
				payload: mode
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'mode',
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

			let mode     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					mode = settings.modes.find((m) => m.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					mode = settings.modes.find((m) => m.domain === payload.domain) || null;
				}

			}


			if (mode !== null) {

				let index = settings.modes.indexOf(mode);
				if (index !== -1) {
					settings.modes.splice(index, 1);
				}

				settings.save();

			}

			callback({
				headers: {
					service: 'mode',
					event:   'remove'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'mode',
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

			let mode     = null;
			let settings = this.stealth.settings;


			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					mode = settings.modes.find((m) => m.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					mode = settings.modes.find((m) => m.domain === payload.domain) || null;
				}

			}


			if (mode !== null) {

				mode.mode.text  = payload.mode.text  || false;
				mode.mode.image = payload.mode.image || false;
				mode.mode.audio = payload.mode.audio || false;
				mode.mode.video = payload.mode.video || false;
				mode.mode.other = payload.mode.other || false;

				settings.save();

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}

				mode = {
					domain: payload.domain,
					mode:   {
						text:  payload.mode.text  || false,
						image: payload.mode.image || false,
						audio: payload.mode.audio || false,
						video: payload.mode.video || false,
						other: payload.mode.other || false
					}
				};

				settings.modes.push(mode);
				settings.save();

			}


			callback({
				headers: {
					service: 'mode',
					event:   'save'
				},
				payload: (mode !== null)
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'mode',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Mode };

