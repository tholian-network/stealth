
const Emitter = function() {

	this.__events = {};

};


Emitter.prototype = {

	emit: function(event, args) {

		event = typeof event === 'string' ? event : null;
		args  = args instanceof Array     ? args  : [];


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events !== null) {

				for (let e = 0, el = events.length; e < el; e++) {

					let event = events[e];
					if (event.once === true) {

						event.callback.apply(null, args);

						events.splice(e, 1);
						el--;
						e--;

					} else {
						event.callback.apply(null, args);
					}

				}

			}

			return true;

		}


		return false;

	},

	on: function(event, callback) {

		event    = typeof event === 'string'      ? event    : null;
		callback = typeof callback === 'function' ? callback : null;


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

		event    = typeof event === 'string'      ? event    : null;
		callback = typeof callback === 'function' ? callback : null;


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events !== null) {

				if (callback !== null) {
					this.__events[event] = events.filter(e => e.callback !== callback);
				} else {
					this.__events[event] = [];
				}

			}

			return true;

		}


		return false;

	},

	once: function(event, callback) {

		event    = typeof event === 'string'      ? event    : null;
		callback = typeof callback === 'function' ? callback : null;


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

