
const Optimizer = {

	check: function(ref, config, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		config   = config instanceof Object       ? config   : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			// TODO: Verify allowed download

		} else if (callback !== null) {
			callback(false);
		}


	},

	optimize: function(ref, config, raw, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		config   = config instanceof Object       ? config   : null;
		raw      = raw instanceof Object          ? raw      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && config !== null && raw !== null && callback !== null) {

		} else if (callback !== null) {
			callback(null);
		}

	}

};


export { Optimizer };

