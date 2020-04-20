
import { Buffer, isBuffer, isFunction, isObject } from '../../extern/base.mjs';



const CODES = {
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



const ERROR = {

	send: function(data, callback) {

		data     = isObject(data)       ? data     : null;
		callback = isFunction(callback) ? callback : null;


		if (data !== null) {

			let code    = 500;
			let message = CODES[code];

			let check = CODES[data.code] || null;
			if (check !== null) {
				code    = data.code;
				message = check;
			}

			let payload = null;
			if (isBuffer(data.payload)) {
				payload = data.payload;
			} else if (isObject(data.payload)) {
				payload = Buffer.from(JSON.stringify(data.payload, null, '\t'), 'utf8');
			} else {
				payload = null;
			}


			if (callback !== null) {

				callback({
					headers: {
						'@code':   code,
						'@status': code + ' ' + message
					},
					payload: payload
				});

			} else {

				return {
					headers: {
						'@code':   code,
						'@status': code + ' ' + message
					},
					payload: payload
				};

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	}

};


export { ERROR };

