
export const Emitter = (function(global) {

	const format = (num) => {

		num = typeof num === 'number' ? num : 0;


		let str = '' + num;

		if (str.length < 2) {
			str = '0' + str;
		}

		return str;

	};

	const render_date = (date) => {
		return date.year + '-' + format(date.month) + '-' + format(date.day);
	};

	const render_time = (time) => {
		return format(time.hour) + ':' + format(time.minute) + ':' + format(time.second | 0) + '.' + (time.second - (time.second | 0)).toFixed(3).substr(2);
	};

	const toDatetime = (date) => {

		date = date instanceof Date ? date : new Date();

		return {
			year:   date.getFullYear(),
			month:  date.getMonth() + 1,
			day:    date.getDate(),
			hour:   date.getHours(),
			minute: date.getMinutes(),
			second: date.getSeconds() + (date.getMilliseconds() / 1000)
		};

	};

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

				this.__journal.forEach((entry) => {

					data.journal.push({
						event: entry.event,
						date:  render_date(entry.date),
						time:  render_time(entry.time)
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

					let datetime = toDatetime();

					this.__journal.push({
						event: event,
						date: {
							year:   datetime.year,
							month:  datetime.month,
							day:    datetime.day,
							hour:   null,
							minute: null,
							second: null
						},
						time: {
							year:   null,
							month:  null,
							day:    null,
							hour:   datetime.hour,
							minute: datetime.minute,
							second: datetime.second
						}
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
								console.error(err);
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
								console.error(err);
							}

						}

					}

					return data;

				}

			}


			return null;

		},

		has: function(event, callback) {

			event    = isString(event)      ? event    : null;
			callback = isFunction(callback) ? callback : null;


			if (event !== null) {

				let events = this.__events[event] || null;
				if (events !== null) {

					if (callback !== null) {

						let check = events.filter((e) => e.callback === callback);
						if (check.length > 0) {
							return true;
						}

					} else {

						if (events.length > 0) {
							return true;
						}

					}

				}

			}


			return false;

		},

		on: function(event, callback) {

			event    = isString(event)      ? event    : null;
			callback = isFunction(callback) ? callback : null;


			if (event !== null && callback !== null) {

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


			if (event !== null && callback !== null) {

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

	if (typeof global.Emitter === 'undefined') {
		global.Emitter = Emitter;
	}

	return Emitter;

})(typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this));

export const isEmitter = Emitter.isEmitter;

