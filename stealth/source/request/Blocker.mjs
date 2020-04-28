
import { isArray, isFunction } from '../../extern/base.mjs';
import { URL                 } from '../parser/URL.mjs';



const Blocker = {

	check: function(blockers, ref, callback) {

		blockers = isArray(blockers)    ? blockers : [];
		ref      = URL.isURL(ref)       ? ref      : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && callback !== null) {

			if (ref.domain !== null) {

				let blocked = false;

				for (let b = 0, bl = blockers.length; b < bl; b++) {

					let blocker = blockers[b];

					if (ref.domain !== null) {

						if (ref.subdomain !== null) {

							if ((ref.subdomain + '.' + ref.domain).endsWith(blocker.domain)) {
								blocked = true;
								break;
							}

						} else {

							if (ref.domain.endsWith(blocker.domain)) {
								blocked = true;
								break;
							}

						}

					}

				}

				callback(blocked);

			} else if (ref.host !== null) {

				let blocked = false;

				for (let b = 0, bl = blockers.length; b < bl; b++) {

					let blocker = blockers[b];

					if (ref.host === blocker.domain) {
						blocked = true;
						break;
					}

				}

				callback(blocked);

			}

		} else if (callback !== null) {

			// Disallowed by default
			callback(true);

		}

	}

};


export { Blocker };

