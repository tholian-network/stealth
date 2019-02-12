
import { Emitter } from '../Emitter.mjs';



const _CODES = {
	200: 'OK',
	201: 'Created',
	202: 'Accepted',
	203: 'Non Authorative Information',
	204: 'No Content',
	205: 'Reset Content',
	206: 'Partial Content',
	300: 'Multiple Choices',
	302: 'Found',
	303: 'See Other',
	304: 'Not Modified',
	305: 'Use Proxy',
	400: 'Bad Request',
	401: 'Unauthorized',
	402: 'Payment Required',
	403: 'Forbidden',
	404: 'Not Found',
	405: 'Method Not Allowed',
	406: 'Not Acceptable',
	408: 'Request Timeout',
	426: 'Upgrade Required',
	428: 'Precondition Required',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
	501: 'Not Implemented',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout',
	505: 'HTTP Version Not Supported',
	511: 'Network Authentication Required'
};


const Error = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Error.prototype = Object.assign({}, Emitter.prototype, {

	get: function(data, callback) {

		data     = data instanceof Object         ? data     : null;
		callback = typeof callback === 'function' ? callback : null;


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

