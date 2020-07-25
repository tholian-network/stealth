
import fs   from 'fs';
import path from 'path';

import { Buffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                                      } from '../../source/ENVIRONMENT.mjs';
import { URL                                              } from '../../source/parser/URL.mjs';



const STATUS = {
	200: '200 OK',
	201: '201 Created',
	202: '202 Accepted',
	203: '203 Non Authorative Information',
	204: '204 No Content',
	205: '205 Reset Content',
	206: '206 Partial Content',
	300: '300 Multiple Choices',
	302: '302 Found',
	303: '303 See Other',
	304: '304 Not Modified',
	305: '305 Use Proxy',
	400: '400 Bad Request',
	401: '401 Unauthorized',
	402: '402 Payment Required',
	403: '403 Forbidden',
	404: '404 Not Found',
	405: '405 Method Not Allowed',
	406: '406 Not Acceptable',
	408: '408 Request Timeout',
	426: '426 Upgrade Required',
	428: '428 Precondition Required',
	429: '429 Too Many Requests',
	500: '500 Internal Server Error',
	501: '501 Not Implemented',
	502: '502 Bad Gateway',
	503: '503 Service Unavailable',
	504: '504 Gateway Timeout',
	505: '505 HTTP Version Not Supported',
	511: '511 Network Authentication Required'
};

const toPayload = (code) => {

	let status = STATUS[code] || null;
	if (status === null) {
		code   = 500;
		status = STATUS[500];
	}

	return {
		headers: {
			'@code':   code,
			'@status': status,
		},
		payload: Buffer.from('All your errors are belong to us nao.', 'utf8')
	};

};

const send_file = (url, callback) => {

	url      = URL.isURL(url)       ? url      : null;
	callback = isFunction(callback) ? callback : null;


	if (url !== null && callback !== null) {

		fs.readFile(path.resolve(ENVIRONMENT.root + url.path), (err, buffer) => {

			if (!err) {

				callback(Object.assign(url, {
					headers: {
						'@code':          200,
						'@status':        '200 OK',
						'content-type':   url.mime.format,
						'content-length': Buffer.byteLength(buffer)
					},
					payload: buffer
				}));

			} else {

				callback(Object.assign(url, toPayload(404)));

			}

		});

	} else if (callback !== null) {

		callback(Object.assign(url, toPayload(404)));

	}

};

const send_pac = (url, callback) => {

	url      = URL.isURL(url)       ? url      : null;
	callback = isFunction(callback) ? callback : null;


	if (url !== null && callback !== null) {

		let address  = null;
		let hostname = null;
		let port     = url.port;

		let domain = URL.toDomain(url);
		let host   = URL.toHost(url);

		if (domain !== null) {
			hostname = domain;
		} else if (host !== null) {
			hostname = host;
		}


		if (isString(url.headers['@local']) === true) {

			address = url.headers['@local'];

			if (address.startsWith('::ffff:')) {
				address = address.substr(7);
			}

		}


		if (address !== null && hostname !== null && port !== null) {

			let payload = Buffer.from([
				'function FindProxyForURL(url, host) {',
				hostname !== null ? '\tif (host === "' + hostname + '") return "DIRECT";' : '',
				address !== null  ? '\tif (host === "' + address  + '") return "DIRECT";' : '',
				'\treturn "PROXY ' + hostname + ':' + port + '; DIRECT";',
				'}'
			].join('\n'), 'utf8');

			callback(Object.assign(url, {
				headers: {
					'@code':          200,
					'@status':        '200 OK',
					'content-type':   url.mime.format,
					'content-length': Buffer.byteLength(payload)
				},
				payload: payload
			}));

		} else {

			callback(null);

		}

	}

};



const ROUTER = {

	error: function(error, callback) {

		error    = isObject(error)      ? error    : null;
		callback = isFunction(callback) ? callback : null;


		if (error !== null && callback !== null) {

			if (isString(error.type) === true) {

				let link   = '/browser/internal/fix-' + error.type + '.html';
				let params = [];

				if (isString(error.cause) === true) {
					params.push('cause=' + encodeURIComponent(error.cause));
				}

				if (isNumber(error.code) === true) {
					params.push('code=' + encodeURIComponent(error.code));
				}

				if (isString(error.url) === true) {
					params.push('url=' + encodeURIComponent(error.url));
				}

				if (params.length > 0) {
					link += '?' + params.join('&');
				}

				callback({
					headers: {
						'@code':    307,
						'@status':  '307 Temporary Redirect',
						'location': link
					},
					payload: null
				});

			} else if (isNumber(error.code) === true) {

				callback(toPayload(error.code));

			} else {

				callback(toPayload(403));

			}

		} else if (callback !== null) {

			callback(toPayload(501));

		}

	},

	send: function(url, callback) {

		url      = URL.isURL(url)       ? url      : null;
		callback = isFunction(callback) ? callback : null;


		if (url !== null && callback !== null) {

			if (url.headers === null) {
				url.headers = {};
			}

			if (url.path === null && isString(url.headers['@url']) === true) {

				url = Object.assign(URL.parse(url.headers['@url']), {
					headers: url.headers,
					payload: url.payload
				});

				if (url.headers === null) {
					url.headers = {};
				}

			}

			let domain = URL.toDomain(url);
			let host   = URL.toHost(url);

			if (domain !== null) {
				url.headers['host'] = domain + ':65432';
			} else if (host !== null) {
				url.headers['host'] = host + ':65432';
			}

			if (url.path === '/') {

				callback(Object.assign(url, {
					headers: {
						'@code':    301,
						'@status':  '301 Moved Permanently',
						'location': '/browser/index.html' + (url.headers['@debug'] === true ? '?debug=true' : '')
					},
					payload: null
				}));

			} else if (url.path === '/favicon.ico') {

				callback(Object.assign(url, {
					headers: {
						'@code':    301,
						'@status':  '301 Moved Permanently',
						'location': '/browser/design/other/favicon.ico'
					},
					payload: null
				}));

			} else if (url.path === '/proxy.pac') {

				send_pac(Object.assign(URL.parse('http://' + url.headers['host'] + url.path), {
					headers: url.headers
				}), callback);

			} else if (url.path.startsWith('/browser')) {

				send_file(url, (response) => {

					if (response.payload !== null) {

						if (response.path === '/browser/index.html') {
							response.headers['Content-Security-Policy'] = 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'';
							response.headers['Service-Worker-Allowed']  = '/browser';
						}

					}

					callback(response);

				});

			} else if (url.path.startsWith('/stealth')) {

				callback(Object.assign(url, {
					headers: {
						'@code':    307,
						'@status':  '307 Temporary Redirect',
						'location': url.path
					},
					payload: null
				}));

			} else {

				callback(Object.assign(url, toPayload(403)));

			}

		} else if (callback !== null) {

			callback(toPayload(501));

		}

	}

};


export { ROUTER };

