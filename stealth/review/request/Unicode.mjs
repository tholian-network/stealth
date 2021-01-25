
import { isBuffer, isFunction, isObject           } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { Request                                  } from '../../../stealth/source/Request.mjs';
import { connect, disconnect                      } from '../Server.mjs';


before(connect);

describe('new Request()/github/http', function(assert) {

	let mode    = EXAMPLE.toMode('http://github.com/');
	let url     = EXAMPLE.toURL('http://github.com/');
	let request = new Request({
		mode: mode,
		url:  url
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

	let url = EXAMPLE.toURL('http://github.com/');

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

describe('new Request()/github/https', function(assert) {

	let mode    = EXAMPLE.toMode('https://github.com/');
	let url     = EXAMPLE.toURL('https://github.com/');
	let request = new Request({
		mode: mode,
		url:  url
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

	let url = EXAMPLE.toURL('https://github.com/');

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

