
import { Buffer } from 'buffer';

import { ERROR } from './ERROR.mjs';

const _CODES = {
	301: 'Moved Permanently',
	307: 'Temporary Redirect',
	308: 'Permanent Redirect',
};

const _PAGES = {
	'host':    '/browser/internal/fix-host.html',
	'mode':    '/browser/internal/fix-mode.html',
	'filter':  '/browser/internal/fix-filter.html',
	'request': '/browser/internal/fix-request.html'
};



const REDIRECT = {

	error: function(data, callback) {

		data     = data instanceof Object         ? data     : null;
		callback = typeof callback === 'function' ? callback : null;


		if (data !== null) {

			let url   = data.url   || null;
			let err   = data.err   || null;
			let flags = data.flags || {};
			let page  = null;
			let vars  = [];

			if (err !== null && typeof err.type === 'string') {
				page = _PAGES[err.type] || null;
			}

			if (url !== null) {
				vars.push('url=' + encodeURIComponent(url));
			}

			if (err !== null && typeof err.code === 'number') {
				vars.push('code=' + encodeURIComponent(err.code));
			}

			if (err !== null && typeof err.cause === 'string') {
				vars.push('cause=' + encodeURIComponent(err.cause));
			}

			if (page !== null && vars.length > 0) {
				page += '?' + vars.join('&');
			}


			let webview = flags.webview === true;
			let proxy   = flags.proxy === true;

			if (webview === true && page !== null) {

				if (callback !== null) {

					this.send({
						code:     307,
						location: page
					}, callback);

				} else {

					return this.send({
						code:     307,
						location: page
					});

				}

			} else if (proxy === true && page !== null) {

				let address = data.address || 'localhost';
				if (address.startsWith('::ffff:')) {
					address = address.substr(7);
				}

				if (address.includes(':')) {
					address = '[' + address + ']';
				}


				if (callback !== null) {

					this.send({
						code:     307,
						location: 'http://' + address + ':65432' + page
					}, callback);

				} else {

					return this.send({
						code:     307,
						location: 'http://' + address + ':65432' + page
					});

				}

			} else {

				if (callback !== null) {

					ERROR.send({
						code:    500,
						payload: Buffer.from((typeof err.type === 'string' ? '"' + err.type + '"' : '') + ' Error for "' + url + '".', 'utf8')
					}, callback);

				} else {

					return ERROR.send({
						code:    500,
						payload: Buffer.from((typeof err.type === 'string' ? '"' + err.type + '"' : '') + ' Error for "' + url + '".', 'utf8')
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

	send: function(data, callback) {

		data     = data instanceof Object         ? data     : null;
		callback = typeof callback === 'function' ? callback : null;


		if (data !== null) {

			let location = data.location || null;

			let path = data.path || null;
			if (path !== null && location === null) {
				location = path;
			}

			if (location !== null) {

				let code    = 301;
				let message = _CODES[code];

				let check = _CODES[data.code] || null;
				if (check !== null) {
					code    = data.code;
					message = check;
				}


				if (callback !== null) {

					callback({
						headers: {
							'@code':    code,
							'@status':  code + ' ' + message,
							'location': location
						},
						payload: null
					});

				} else {

					return {
						headers: {
							'@code':    code,
							'@status':  code + ' ' + message,
							'location': location
						},
						payload: null
					};

				}

			} else {

				if (callback !== null) {
					callback(null);
				} else {
					return null;
				}

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


export { REDIRECT };

