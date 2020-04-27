
import { isFunction, isObject } from '../../extern/base.mjs';
import { Optimizer as CSS     } from '../optimizer/CSS.mjs';
import { Optimizer as HTML    } from '../optimizer/HTML.mjs';
import { URL                  } from '../parser/URL.mjs';



const OPTIMIZERS = [
	CSS,
	HTML
];



const Optimizer = {

	check: function(ref, config, callback) {

		ref      = URL.isURL(ref)       ? ref      : null;
		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			let result = false;

			for (let o = 0, ol = OPTIMIZERS.length; o < ol; o++) {

				let optimizer = OPTIMIZERS[o];
				if (optimizer.check(ref, config) === true) {
					result = true;
					break;
				}

			}

			callback(result);

		} else if (callback !== null) {
			callback(false);
		}

	},

	optimize: function(ref, config, callback) {

		ref      = URL.isURL(ref)       ? ref      : null;
		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			let optimizer = null;

			for (let o = 0, ol = OPTIMIZERS.length; o < ol; o++) {

				let other = OPTIMIZERS[o];
				if (other.check(ref, config) === true) {
					optimizer = other;
					break;
				}

			}

			if (optimizer !== null) {

				optimizer.optimize(ref, config, (result) => {
					callback(result);
				});

			} else {
				callback(null);
			}

		} else if (callback !== null) {
			callback(null);
		}

	}

};


export { Optimizer };

