
import { Emitter } from '../Emitter.mjs';



const _CODES = {
	301: 'Moved Permanently',
	404: 'Not Found',
	500: 'Internal Server Error'
};


const Error = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Error.prototype = Object.assign({}, Emitter.prototype, {

	get: function(data, callback) {

		data     = data instanceof Object       ? data     : null;
		callback = callback instanceof Function ? callback : null;


		if (data !== null && callback !== null) {

			let code    = 500;
			let message = _CODES[code];

			let check = _CODES[data.code] || null;
			if (check !== null) {
				code    = data.code;
				message = check;
			}


			callback({
				headers: {
					'@status': 'HTTP/1.1 ' + code + ' ' + message
				},
				payload: null
			});

		} else if (callback !== null) {

			callback(null);

		}

	}

});


export { Error };

