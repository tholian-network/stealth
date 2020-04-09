
import { isArray, isFunction, isObject } from '../BASE.mjs';



const Blocker = {

	check: function(blockers, ref, callback) {

		blockers = isArray(blockers)    ? blockers : null;
		ref      = isObject(ref)        ? ref      : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && callback !== null) {

			let blocked = false;

			if (blockers.length > 0) {

				for (let b = 0, bl = blockers.length; b < bl; b++) {

					let host = blockers[b];
					if (host.domain === ref.domain) {
						blocked = true;
						break;
					}

				}

			}

			callback(blocked);

		} else if (callback !== null) {
			// Blocked by default
			callback(true);
		}

	}

};


export { Blocker };

