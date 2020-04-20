
import { isFunction, isObject } from '../../extern/base.mjs';



const Optimizer = {

	check: function(ref, config, callback) {

		ref      = isObject(ref)        ? ref      : null;
		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			let path = ref.path || null;
			if (path !== null && path.endsWith('.css')) {
				callback(true);
			} else {
				callback(false);
			}

		} else if (ref !== null && config !== null) {

			let path = ref.path || null;
			if (path !== null && path.endsWith('.css')) {
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


		if (ref !== null && config !== null && callback !== null) {

			// TODO: Implement me

		} else if (ref !== null && config !== null) {

			// TODO: Implement me

		} else if (callback !== null) {
			callback(null);
		} else {
			return null;
		}

	}

};


export const check    = Optimizer.check;
export const optimize = Optimizer.optimize;

export { Optimizer };

