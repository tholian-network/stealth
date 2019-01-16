
import { Emitter } from '../Emitter.mjs';



const Redirect = function(stealth) {

};


Redirect.prototype = Object.assign({}, Emitter.prototype, {

	get: function(ref, callback) {

		ref      = ref instanceof Object        ? ref      : null;
		callback = callback instanceof Function ? callback : null;


		if (ref !== null && callback !== null) {

			let path = ref.path || null;
			if (path !== null) {

				callback({
					headers: {
						'@status': 'HTTP/1.1 301 Moved Permanently',
						'location': path
					},
					payload: null
				});

			} else if (callback !== null) {
				callback(null);
			}

		} else if (callback !== null) {

			callback(null);

		}

	}

});


export { Redirect };

