
import { Emitter } from '../Emitter.mjs';



const _CODES = {
	301: 'Moved Permanently',
	307: 'Temporary Redirect',
	308: 'Permanent Redirect',
};



const Redirect = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Redirect.prototype = Object.assign({}, Emitter.prototype, {

	get: function(data, callback) {

		data     = data instanceof Object         ? data     : null;
		callback = typeof callback === 'function' ? callback : null;


		if (data !== null && callback !== null) {

			let path = data.path || null;
			if (path !== null) {

				let code    = 301;
				let message = _CODES[code];

				let check = _CODES[data.code] || null;
				if (check !== null) {
					code    = data.code;
					message = check;
				}


				callback({
					headers: {
						'@status': 'HTTP/1.1 ' + code + ' ' + message,
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

