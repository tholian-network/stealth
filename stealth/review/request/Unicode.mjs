
import { isBuffer, isFunction, isObject  } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { Request                         } from '../../../stealth/source/Request.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../Server.mjs';



before(connect);

describe('new Request()/github/http', function(assert) {

	let request = new Request({
		mode: {
			domain: 'github.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: URL.parse('http://github.com/')
	}, this.server);

	let events = {
		error:    false,
		response: false
	};

	request.once('error', () => {
		events.error = true;
	});

	request.once('response', () => {
		events.response = true;
	});

	request.once('redirect', (redirect) => {

		assert(redirect, {
			headers: {
				'@status':        '301 Moved Permanently',
				'content-length': '0',
				'location':       'https://github.com/'
			}
		});

		setTimeout(() => {
			assert(events.error,    false);
			assert(events.response, false);
		}, 100);

	});

	assert(request.start(), true);

});

describe('Cache.prototype.read()/github/http', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.read), true);

	let url = URL.parse('http://github.com/');

	this.server.services.cache.read(url, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'read'
			},
			payload: null
		});

	});

});

describe('Redirect.prototype.read()/github/http', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.read), true);

	let url = URL.parse('http://github.com/');

	this.server.services.redirect.read(url, (response) => {

		assert(response, {
			headers: {
				service: 'redirect',
				event:   'read'
			},
			payload: {
				domain: 'github.com',
				redirects: [{
					path:     '/',
					query:    null,
					location: 'https://github.com/'
				}]
			}
		});

	});

});

describe('new Request()/github/https', function(assert) {

	let request = new Request({
		mode: {
			domain: 'github.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: URL.parse('https://github.com/')
	}, this.server);

	let events = {
		error:    false,
		redirect: false,
		response: false
	};

	request.once('error', () => {
		events.error = true;
	});

	request.once('redirect', () => {
		events.redirect = true;
	});

	request.once('response', (response) => {

		events.response = true;

		assert(isObject(response),          true);
		assert(isObject(response.headers),  true);
		assert(response.headers['server'],  'GitHub.com');
		assert(response.headers['@status'], '200 OK');

		assert(isBuffer(response.payload),  true);
		assert(response.payload.length > 0, true);

		setTimeout(() => {
			assert(events.error,    false);
			assert(events.redirect, false);
		}, 100);

	});

	assert(request.start(), true);

});

describe('Cache.prototype.read()/github/https', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.read), true);

	let url = URL.parse('https://github.com/');

	this.server.services.cache.read(url, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'cache',
			'event':   'read'
		});

		assert(isObject(response.payload),          true);
		assert(isObject(response.payload.headers),  true);
		assert(response.payload.headers['server'],  'GitHub.com');
		assert(response.payload.headers['@status'], '200 OK');

		assert(isBuffer(response.payload.payload),  true);
		assert(response.payload.payload.length > 0, true);

	});

});

after(disconnect);


export default finish('stealth/request/Unicode', {
	internet: true,
	network:  true
});

