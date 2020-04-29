
import { isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { ERROR                                    } from './ERROR.mjs';
import { FILE                                     } from './FILE.mjs';
import { PAC                                      } from './PAC.mjs';
import { REDIRECT                                 } from './REDIRECT.mjs';
import { URL                                      } from '../parser/URL.mjs';



const ROUTER = {

	error: function(data, callback) {

		data     = isObject(data)       ? data     : null;
		callback = isFunction(callback) ? callback : null;


		if (data !== null) {

			let err = data.err || null;
			if (err !== null && isString(err.type) === true) {

				if (callback !== null) {

					REDIRECT.error(data, callback);

				} else {

					return REDIRECT.error(data);

				}

			} else if (err !== null && isNumber(err.code) === true) {

				if (callback !== null) {

					ERROR.send({
						code: err.code
					}, callback);

				} else {

					return ERROR.send({
						code: err.code
					});

				}

			} else {

				if (callback !== null) {

					ERROR.send({
						code: 500
					}, callback);

				} else {

					return ERROR.send({
						code: 500
					});

				}

			}

		} else {

			if (callback !== null) {

				ERROR.send({
					code: 500
				}, callback);

			} else {

				return ERROR.send({
					code: 500
				});

			}

		}

	},

	send: function(ref, callback) {

		ref      = isObject(ref)        ? ref      : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null) {

			let check = ref.path || null;
			if (check === null) {

				let url = (ref.headers || {})['@url'] || null;
				if (url !== null) {

					let headers = Object.assign({}, ref.headers);
					ref         = URL.parse(url);
					ref.headers = headers;

				}

			}


			let headers = ref.headers || {};
			let path    = ref.path || '';

			if (path === '/') {

				if (callback !== null) {

					REDIRECT.send({
						code: 301,
						path: '/browser/index.html' + (headers['@debug'] ? '?debug=true' : '')
					}, callback);

				} else {

					return REDIRECT.send({
						code: 301,
						path: '/browser/index.html' + (headers['@debug'] ? '?debug=true' : '')
					});

				}

			} else if (path === '/favicon.ico') {

				if (callback !== null) {

					REDIRECT.send({
						code: 301,
						path: '/browser/design/other/favicon.ico'
					}, callback);

				} else {

					return REDIRECT.send({
						code: 301,
						path: '/browser/design/other/favicon.ico'
					});

				}

			} else if (path === '/proxy.pac') {

				if (callback !== null) {

					PAC.send({
						url:     'http://' + headers['host'] + '/proxy.pac',
						headers: headers
					}, (response) => {

						if (response !== null) {

							callback(response);

						} else {

							ERROR.send({
								code: 404
							}, callback);

						}

					});

				} else {

					let response = PAC.send({
						url:     'http://' + headers['host'] + '/proxy.pac',
						headers: headers
					});

					if (response !== null) {

						return response;

					} else {

						return ERROR.send({
							code: 404
						});

					}

				}

			} else if (path.startsWith('/browser')) {

				if (callback !== null) {

					FILE.send(ref, (response) => {

						if (response !== null && response.payload !== null) {

							if (ref.path === '/browser/index.html') {
								response.headers['Content-Security-Policy'] = 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'';
								response.headers['Service-Worker-Allowed']  = '/browser';
							}

							callback(response);

						} else {

							ERROR.send({
								code: 404
							}, callback);

						}

					});

				} else {

					let response = FILE.send(ref);
					if (response !== null && response.payload !== null) {

						if (ref.path === '/browser/index.html') {
							response.headers['Content-Security-Policy'] = 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'';
							response.headers['Service-Worker-Allowed']  = '/browser';
						}

						return response;

					} else {

						return ERROR.send({
							code: 404
						});

					}

				}

			} else {

				if (callback !== null) {

					ERROR.send({
						code: 500
					}, callback);

				} else {

					return ERROR.send({
						code: 500
					});

				}

			}

		} else {

			if (callback !== null) {

				ERROR.send({
					code: 500
				}, callback);

			} else {

				return ERROR.send({
					code: 500
				});

			}

		}

	}

};


export { ROUTER };

