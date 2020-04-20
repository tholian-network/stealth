
import { Emitter, isFunction, isObject, isString } from '../../extern/base.mjs';



const get_id = function(payload) {

	let id = '';

	id += payload.domain;
	id += '|' + (isString(payload.filter.prefix) ? payload.filter.prefix : null);
	id += '|' + (isString(payload.filter.midfix) ? payload.filter.midfix : null);
	id += '|' + (isString(payload.filter.suffix) ? payload.filter.suffix : null);

	return id;

};

const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload)) {

		payload = Object.assign({}, raw);

		payload.id        = isString(payload.id)        ? payload.id        : null;
		payload.domain    = isString(payload.domain)    ? payload.domain    : null;
		payload.subdomain = isString(payload.subdomain) ? payload.subdomain : null;
		payload.host      = isString(payload.host)      ? payload.host      : null;

		if (isObject(payload.filter)) {

			payload.filter = Object.assign({}, raw.filter);

			payload.filter.prefix = isString(payload.filter.prefix) ? payload.filter.prefix : null;
			payload.filter.midfix = isString(payload.filter.midfix) ? payload.filter.midfix : null;
			payload.filter.suffix = isString(payload.filter.suffix) ? payload.filter.suffix : null;

		} else {

			payload.filter = {
				prefix: null,
				midfix: null,
				suffix: null
			};

		}

		return payload;

	}

	return null;

};

const readify = function(raw) {

	let payload = raw;
	if (isObject(payload)) {

		payload = Object.assign({}, raw);

		payload.id = isString(payload.id) ? payload.id : null;

		return payload;

	}

	return null;

};



const Filter = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Filter.prototype = Object.assign({}, Emitter.prototype, {

	query: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let filters  = [];
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					filters = settings.filters.filter((f) => f.domain === payload.subdomain + '.' + payload.domain);
				} else if (payload.domain === '*') {
					filters = settings.filters;
				} else {
					filters = settings.filters.filter((f) => f.domain === payload.domain);
				}

			}


			callback({
				headers: {
					service: 'filter',
					event:   'query'
				},
				payload: filters
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'filter',
					event:   'query'
				},
				payload: null
			});

		}

	},

	read: function(payload, callback) {

		payload  = isObject(payload)    ? readify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null && callback !== null) {

			let filter   = null;
			let settings = this.stealth.settings;

			if (payload.id !== null) {
				filter = settings.filters.filter((f) => f.id === payload.id) || null;
			}


			callback({
				headers: {
					service: 'filter',
					event:   'query'
				},
				payload: filter
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'filter',
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

			let filter   = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.id !== null) {

					filter = settings.filters.find((f) => f.id === payload.id) || null;

				} else if (payload.subdomain !== null) {

					filter = settings.filters.find((f) => {
						return (
							f.domain === payload.subdomain + '.' + payload.domain
							&& f.filter.prefix === payload.filter.prefix
							&& f.filter.midfix === payload.filter.midfix
							&& f.filter.suffix === payload.filter.suffix
						);
					}) || null;

				} else {

					filter = settings.filters.find((f) => {
						return (
							f.domain === payload.domain
							&& f.filter.prefix === payload.filter.prefix
							&& f.filter.midfix === payload.filter.midfix
							&& f.filter.suffix === payload.filter.suffix
						);
					}) || null;

				}

			}


			if (filter !== null) {

				let index = settings.filters.indexOf(filter);
				if (index !== -1) {
					settings.filters.splice(index, 1);
				}

				settings.save();

			}


			callback({
				headers: {
					service: 'filter',
					event:   'remove'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'filter',
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

			let filter   = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.id !== null) {

					filter = settings.filters.find((f) => f.id === payload.id) || null;

				} else if (payload.subdomain !== null) {

					filter = settings.filters.find((f) => {
						return (
							f.domain === payload.subdomain + '.' + payload.domain
							&& f.filter.prefix === payload.filter.prefix
							&& f.filter.midfix === payload.filter.midfix
							&& f.filter.suffix === payload.filter.suffix
						);
					}) || null;

				} else {

					filter = settings.filters.find((f) => {
						return (
							f.domain === payload.domain
							&& f.filter.prefix === payload.filter.prefix
							&& f.filter.midfix === payload.filter.midfix
							&& f.filter.suffix === payload.filter.suffix
						);
					}) || null;

				}


				if (
					filter !== null
					// id ensures filter uniqueness
					&& payload.id !== null
					&& payload.domain !== null
					&& (
						payload.filter.prefix !== null
						|| payload.filter.midfix !== null
						|| payload.filter.suffix !== null
					)
				) {

					filter.domain        = payload.domain;
					filter.filter.prefix = payload.filter.prefix || null;
					filter.filter.midfix = payload.filter.midfix || null;
					filter.filter.suffix = payload.filter.suffix || null;
					filter.id            = get_id(payload);

					settings.save();

				} else if (
					filter === null
					&& payload.domain !== null
					&& (
						payload.filter.prefix !== null
						|| payload.filter.midfix !== null
						|| payload.filter.suffix !== null
					)
				) {

					if (payload.subdomain !== null) {
						payload.domain    = payload.subdomain + '.' + payload.domain;
						payload.subdomain = null;
					}

					filter = {
						id:     get_id(payload),
						domain: payload.domain,
						filter: {
							prefix: payload.filter.prefix || null,
							midfix: payload.filter.midfix || null,
							suffix: payload.filter.suffix || null
						}
					};

					settings.filters.push(filter);
					settings.save();

				}

			}


			callback({
				headers: {
					service: 'filter',
					event:   'save'
				},
				payload: (filter !== null)
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'filter',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Filter };

