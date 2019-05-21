
import { isFunction, isObject } from '../POLYFILLS.mjs';

import { ERROR    } from './ERROR.mjs';
import { FILE     } from './FILE.mjs';
import { PAC      } from './PAC.mjs';
import { REDIRECT } from './REDIRECT.mjs';
import { URL      } from '../parser/URL.mjs';


const ROUTER = {

	error: function(data, callback) {

		data     = isObject(data)       ? data     : null;
		callback = isFunction(callback) ? callback : null;


		let err = data.err || null;
		if (err !== null && typeof err.type === 'string') {

			REDIRECT.error(data, (response) => {

				if (callback !== null) {
					callback(response);
				}

			});

		} else if (err !== null && typeof err.code === 'number') {

			ERROR.send({
				code: err.code
			}, (response) => {

				if (callback !== null) {
					callback(response);
				}

			});

		} else {

			ERROR.send({
				code: 500
			}, (response) => {

				if (callback !== null) {
					callback(response);
				}

			});

		}

	},

	send: function(ref, callback) {

		ref      = isObject(ref)        ? ref      : null;
		callback = isFunction(callback) ? callback : null;


		let check = ref.path || null;
		if (check === null) {

			let url = ref.headers['@url'] || null;
			if (url !== null) {
				ref = URL.parse(url);
			}

		}


		if (ref.path === '/') {

			REDIRECT.send({
				code: 301,
				path: '/browser/index.html' + (ref.headers['@debug'] ? '?debug' : '')
			}, (response) => {

				if (callback !== null) {
					callback(response);
				}

			});

		} else if (ref.path === '/favicon.ico') {

			REDIRECT.send({
				code: 301,
				path: '/browser/design/other/favicon.ico'
			}, (response) => {

				if (response !== null) {

					if (callback !== null) {
						callback(response);
					}

				} else {

					ERROR.send({
						code: 404
					}, (response) => {

						if (callback !== null) {
							callback(response);
						}

					});

				}

			});

		} else if (ref.path === '/proxy.pac') {

			PAC.send({
				url:     'http://' + ref.headers['host'] + '/proxy.pac',
				address: ref.headers['@address'] || 'localhost'
			}, (response) => {

				if (response !== null) {

					if (callback !== null) {
						callback(response);
					}

				} else {

					ERROR.send({
						code: 404
					}, (response) => {

						if (callback !== null) {
							callback(response);
						}

					});

				}

			});

		} else if (ref.path.startsWith('/browser')) {

			FILE.send(ref, (response) => {

				if (response !== null && response.payload !== null) {

					if (ref.path === '/browser/index.html') {
						response.headers['Service-Worker-Allowed'] = '/browser';
					}

					if (callback !== null) {
						callback(response);
					}

				} else {

					ERROR.send({
						code: 404
					}, (response) => {

						if (callback !== null) {
							callback(response);
						}

					});

				}

			});

		} else {

			ERROR.send({
				code: 500
			}, (response) => {

				if (callback !== null) {
					callback(response);
				}

			});

		}

	}

};


export { ROUTER };

