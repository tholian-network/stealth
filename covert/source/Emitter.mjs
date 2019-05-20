
import { isArray, isFunction, isString } from './POLYFILLS.mjs';


const Emitter = function() {

	this.__events = {};

};


Emitter.prototype = {

	emit: function(event, args) {

		event = isString(event) ? event : null;
		args  = isArray(args)   ? args  : [];


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events !== null) {

				let data = null;

				for (let e = 0, el = events.length; e < el; e++) {

					let entry = events[e];
					if (entry.once === true) {

						try {

							let result = entry.callback.apply(null, args);
							if (result !== null && result !== undefined) {
								data = result;
							}

						} catch (err) {
							// Ignore
						}

						events.splice(e, 1);
						el--;
						e--;

					} else {

						try {

							let result = entry.callback.apply(null, args);
							if (result !== null && result !== undefined) {
								data = result;
							}

						} catch (err) {
							// Ignore
						}

					}

				}

				return data;

			}

		}


		return null;

	},

	on: function(event, callback) {

		event    = isString(event)      ? event    : null;
		callback = isFunction(callback) ? callback : null;


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events === null) {
				events = this.__events[event] = [];
			}

			events.push({
				callback: callback,
				once:     false
			});

			return true;

		}


		return false;

	},

	off: function(event, callback) {

		event    = isString(event)      ? event    : null;
		callback = isFunction(callback) ? callback : null;


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events !== null) {

				if (callback !== null) {
					this.__events[event] = events.filter((e) => e.callback !== callback);
				} else {
					this.__events[event] = [];
				}

			}

			return true;

		}


		return false;

	},

	once: function(event, callback) {

		event    = isString(event)      ? event    : null;
		callback = isFunction(callback) ? callback : null;


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events === null) {
				events = this.__events[event] = [];
			}

			events.push({
				callback: callback,
				once:     true
			});

			return true;

		}


		return false;

	}

};


export { Emitter };

