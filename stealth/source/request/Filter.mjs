
import { isArray, isFunction, isObject } from '../BASE.mjs';



const Filter = {

	check: function(all_filters, ref, callback) {

		all_filters = isArray(all_filters) ? all_filters : [];
		ref         = isObject(ref)        ? ref         : null;
		callback    = isFunction(callback) ? callback    : null;


		if (ref !== null && callback !== null) {

			let host = ref.host || null;
			if (ref.domain !== null) {

				if (ref.subdomain !== null) {
					host = ref.subdomain + '.' + ref.domain;
				} else {
					host = ref.domain;
				}

			}


			if (host !== null) {

				let filters = all_filters.filter((f) => f.domain === host);
				if (filters.length > 0) {

					let allowed = false;

					for (let f = 0, fl = filters.length; f < fl; f++) {

						let filter = filters[f];

						if (filter.prefix !== null && ref.path.startsWith(filter.prefix)) {
							allowed = true;
							break;
						}

						if (filter.midfix !== null && ref.path.includes(filter.midfix)) {
							allowed = true;
							break;
						}

						if (filter.suffix !== null && ref.path.endsWith(filter.suffix)) {
							allowed = true;
							break;
						}

					}

					callback(allowed);

				} else {
					// Not filtered by default
					callback(true);
				}

			} else {
				// Not filtered by default
				callback(true);
			}

		} else if (callback !== null) {
			// Not filtered by default
			callback(true);
		}

	}

};


export { Filter };

