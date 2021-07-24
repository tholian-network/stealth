
import fs   from 'fs';
import path from 'path';

import { Buffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                                      } from '../../source/ENVIRONMENT.mjs';
import { URL                                              } from '../../source/parser/URL.mjs';



const toPayload = (status) => ({
	headers: {
		'@status': status
	},
	payload: Buffer.from('All your errors are belong to us nao.', 'utf8')
});

const send_file = (url, callback) => {

	url      = URL.isURL(url)       ? url      : null;
	callback = isFunction(callback) ? callback : null;


	if (url !== null && callback !== null) {

		fs.readFile(path.resolve(ENVIRONMENT.root + url.path), (err, buffer) => {

			if (!err) {

				callback(Object.assign(url, {
					headers: {
						'@status':        200,
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

			if (address.startsWith('::ffff:') === true) {
				address = address.substr(7);
			}

		}


		if (hostname !== null && port !== null) {

			let payload = Buffer.from([
				'function FindProxyForURL(url, host) {',
				hostname !== null ? '\tif (host === "' + hostname + '") return "DIRECT";' : '',
				address !== null  ? '\tif (host === "' + address  + '") return "DIRECT";' : '',
				'\treturn "PROXY ' + hostname + ':' + port + '; DIRECT";',
				'}'
			].join('\n'), 'utf8');

			callback(Object.assign(url, {
				headers: {
					'@status':        200,
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
						'@status':  307,
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
						'@status':  301,
						'location': '/browser/index.html' + (url.headers['@debug'] === true ? '?debug=true' : '')
					},
					payload: null
				}));

			} else if (url.path === '/favicon.ico') {

				callback(Object.assign(url, {
					headers: {
						'@status':  301,
						'location': '/browser/design/common/tholian.ico'
					},
					payload: null
				}));

			} else if (url.path === '/proxy.pac') {

				send_pac(Object.assign(URL.parse('http://' + url.headers['host'] + url.path), {
					headers: url.headers
				}), callback);

			} else if (url.path.startsWith('/browser') === true) {

				send_file(url, (response) => {

					if (response.payload !== null) {

						if (response.path === '/browser/index.html') {
							response.headers['Content-Security-Policy'] = 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'';
							response.headers['Service-Worker-Allowed']  = '/browser';
						}

					}

					callback(response);

				});

			} else if (url.path.startsWith('/stealth') === true) {

				callback(Object.assign(url, {
					headers: {
						'@status':  307,
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

