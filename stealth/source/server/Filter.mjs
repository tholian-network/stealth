
import { Emitter } from '../Emitter.mjs';



const payloadify = function(raw) {

	let payload = raw;
	if (payload instanceof Object) {

		payload = Object.assign({}, raw);

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;

		if (payload.filter instanceof Object) {

			payload.filter = Object.assign({}, raw.filter);

			payload.filter.prefix = typeof payload.filter.prefix === 'string' ? payload.filter.prefix : null;
			payload.filter.midfix = typeof payload.filter.midfix === 'string' ? payload.filter.midfix : null;
			payload.filter.suffix = typeof payload.filter.suffix === 'string' ? payload.filter.suffix : null;

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



const Filter = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Filter.prototype = Object.assign({}, Emitter.prototype, {

	query: function(payload, callback) {

		payload  = payload instanceof Object      ? payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback            : null;


		if (payload !== null && callback !== null) {

			let filters  = [];
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					filters = settings.filters.filter((f) => f.domain === payload.subdomain + '.' + payload.domain);
				} else{
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

	remove: function(payload, callback) {

		payload  = payload instanceof Object      ? payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback            : null;


		if (payload !== null && callback !== null) {

			let filter   = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {

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

		payload  = payload instanceof Object      ? payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback            : null;


		if (payload !== null && callback !== null) {

			let filter   = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {

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


				if (filter === null) {

					if (payload.subdomain !== null) {
						payload.domain    = payload.subdomain + '.' + payload.domain;
						payload.subdomain = null;
					}

					filter = {
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
				payload: true
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

