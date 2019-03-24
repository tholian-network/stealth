
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

					let event = events[e];
					if (event.once === true) {

						try {

							let result = event.callback.apply(null, args) || null;
							if (result !== null) {
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

							let result = event.callback.apply(null, args);
							if (result !== null) {
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

