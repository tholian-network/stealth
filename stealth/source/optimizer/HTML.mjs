
import { isFunction, isObject } from '../../extern/base.mjs';



const Optimizer = {

	check: function(ref, config, callback) {

		ref      = isObject(ref)        ? ref      : null;
		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			let path = ref.path || null;
			if (path !== null && path.endsWith('.html')) {
				callback(true);
			} else {
				callback(false);
			}

		} else if (ref !== null && config !== null) {

			let path = ref.path || null;
			if (path !== null && path.endsWith('.html')) {
				return true;
			} else {
				return false;
			}

		} else if (callback !== null) {
			callback(false);
		} else {
			return false;
		}

	},

	optimize: function(ref, config, callback) {

		ref      = isObject(ref)        ? ref      : null;
		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;

	}

};


export const check    = Optimizer.check;
export const optimize = Optimizer.optimize;

export { Optimizer };

