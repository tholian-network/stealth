
export const Emitter = (function(global) {

	if (typeof global.Emitter !== 'function') {

		const isArray = (obj) => {
			return Object.prototype.toString.call(obj) === '[object Array]';
		};

		const isFunction = (obj) => {
			return Object.prototype.toString.call(obj) === '[object Function]';
		};

		const isString = (obj) => {
			return Object.prototype.toString.call(obj) === '[object String]';
		};


		const Emitter = function() {

			this.__events  = {};
			this.__journal = [];

		};


		Emitter.isEmitter = function(obj) {
			return Object.prototype.toString.call(obj) === '[object Emitter]';
		};


		Emitter.prototype = {

			[Symbol.toStringTag]: 'Emitter',

			toJSON: function() {

				let data = {
					events:  Object.keys(this.__events),
					journal: []
				};

				if (this.__journal.length > 0) {

					this.__journal.sort((a, b) => {

						if (a.time < b.time) return -1;
						if (b.time < a.time) return  1;

						if (a.event < b.event) return -1;
						if (b.event < a.event) return  1;

						return 0;

					}).forEach((entry) => {

						data.journal.push({
							event: entry.event,
							time:  entry.time
						});

					});

				}

				return {
					'type': 'Emitter',
					'data': data
				};

			},

			emit: function(event, args) {

				event = isString(event) ? event : null;
				args  = isArray(args)   ? args  : [];


				if (event !== null) {

					let events = this.__events[event] || null;
					if (events !== null) {

						this.__journal.push({
							event: event,
							time:  Date.now()
						});


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


		global.Emitter = Emitter;

	}


	return global.Emitter;

})(typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this));

export const isEmitter = Emitter.isEmitter;

