
import { ROUTER           } from '../../../stealth/source/other/ROUTER.mjs';
import { URL              } from '../../../stealth/source/parser/URL.mjs';
import { describe, finish } from '../../source/Review.mjs';



describe('ROUTER.error/callback', function(assert) {

	ROUTER.error(null, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 500);
		assert(response.headers['@status'] === '500 Internal Server Error');
		assert(response.payload === null);

	});

	ROUTER.error({}, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 500);
		assert(response.headers['@status'] === '500 Internal Server Error');
		assert(response.payload === null);

	});

	ROUTER.error({
		err: { type: 'host' },
		url: 'https://example.com/index.html',
	}, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 500);
		assert(response.headers['@status'] === '500 Internal Server Error');
		assert(response.payload.toString('utf8') === '"host" Error for "https://example.com/index.html".');

	});

	ROUTER.error({
		err: { code: 404 }
	}, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 404);
		assert(response.headers['@status'] === '404 Not Found');
		assert(response.payload === null);

	});

	ROUTER.error({
		err:     { type: 'host' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': '127.0.0.1' }
	}, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 307);
		assert(response.headers['@status'] === '307 Temporary Redirect');
		assert(response.headers['location'] === 'http://127.0.0.1:65432/browser/internal/fix-host.html?url=https%3A%2F%2Fexample.com%2Findex.html');
		assert(response.payload === null);

	});

});

describe('ROUTER.error/return', function(assert) {

	let response1 = ROUTER.error(null);
	let response2 = ROUTER.error({});
	let response3 = ROUTER.error({
		err: { type: 'host' },
		url: 'https://example.com/index.html',
	});
	let response4 = ROUTER.error({
		err: { code: 404 }
	});
	let response5 = ROUTER.error({
		err:     { type: 'host' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': '127.0.0.1' }
	});

	assert(response1 !== null);
	assert(response1.headers['@code'] === 500);
	assert(response1.headers['@status'] === '500 Internal Server Error');
	assert(response1.payload === null);

	assert(response2 !== null);
	assert(response2.headers['@code'] === 500);
	assert(response2.headers['@status'] === '500 Internal Server Error');
	assert(response2.payload === null);

	assert(response3 !== null);
	assert(response3.headers['@code'] === 500);
	assert(response3.headers['@status'] === '500 Internal Server Error');
	assert(response3.payload.toString('utf8') === '"host" Error for "https://example.com/index.html".');

	assert(response4 !== null);
	assert(response4.headers['@code'] === 404);
	assert(response4.headers['@status'] === '404 Not Found');
	assert(response4.payload === null);

	assert(response5 !== null);
	assert(response5.headers['@code'] === 307);
	assert(response5.headers['@status'] === '307 Temporary Redirect');
	assert(response5.headers['location'] === 'http://127.0.0.1:65432/browser/internal/fix-host.html?url=https%3A%2F%2Fexample.com%2Findex.html');
	assert(response5.payload === null);

});

describe('ROUTER.send/callback', function(assert) {

	let ref1 = null;
	let ref2 = {};
	let ref3 = URL.parse('/');
	let ref4 = URL.parse('/favicon.ico');
	let ref5 = URL.parse('/proxy.pac');
	let ref6 = URL.parse('/browser/index.html');

	ref5.headers = {
		'host': 'localhost'
	};


	ROUTER.send(ref1, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 500);
		assert(response.headers['@status'] === '500 Internal Server Error');
		assert(response.payload === null);

	});

	ROUTER.send(ref2, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 500);
		assert(response.headers['@status'] === '500 Internal Server Error');
		assert(response.payload === null);

	});

	ROUTER.send(ref3, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 301);
		assert(response.headers['@status'] === '301 Moved Permanently');
		assert(response.headers['location'] === '/browser/index.html');
		assert(response.payload === null);

	});

	ROUTER.send(ref4, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 301);
		assert(response.headers['@status'] === '301 Moved Permanently');
		assert(response.headers['location'] === '/browser/design/other/favicon.ico');
		assert(response.payload === null);

	});

	ROUTER.send(ref5, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 200);
		assert(response.headers['@status'] === '200 OK');
		assert(response.payload !== null);
		assert(response.payload.toString('utf8').trim().startsWith('function FindProxyForURL'));

	});

	ROUTER.send(ref6, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 200);
		assert(response.headers['@status'] === '200 OK');
		assert(response.headers['content-type'] === 'text/html');
		assert(response.headers['content-length'] !== null);
		assert(response.headers['Service-Worker-Allowed'] === '/browser');
		assert(response.payload !== null);
		assert(response.payload.toString('utf8').includes('<!DOCTYPE html>'));

	});

});

describe('ROUTER.send/return', function(assert) {

	let ref1 = null;
	let ref2 = {};
	let ref3 = URL.parse('/');
	let ref4 = URL.parse('/favicon.ico');
	let ref5 = URL.parse('/proxy.pac');
	let ref6 = URL.parse('/browser/index.html');

	ref5.headers = {
		'host': 'localhost'
	};

	let response1 = ROUTER.send(ref1);
	let response2 = ROUTER.send(ref2);
	let response3 = ROUTER.send(ref3);
	let response4 = ROUTER.send(ref4);
	let response5 = ROUTER.send(ref5);
	let response6 = ROUTER.send(ref6);

	assert(response1 !== null);
	assert(response1.headers['@code'] === 500);
	assert(response1.headers['@status'] === '500 Internal Server Error');
	assert(response1.payload === null);

	assert(response2 !== null);
	assert(response2.headers['@code'] === 500);
	assert(response2.headers['@status'] === '500 Internal Server Error');
	assert(response2.payload === null);

	assert(response3 !== null);
	assert(response3.headers['@code'] === 301);
	assert(response3.headers['@status'] === '301 Moved Permanently');
	assert(response3.headers['location'] === '/browser/index.html');
	assert(response3.payload === null);

	assert(response4 !== null);
	assert(response4.headers['@code'] === 301);
	assert(response4.headers['@status'] === '301 Moved Permanently');
	assert(response4.headers['location'] === '/browser/design/other/favicon.ico');
	assert(response4.payload === null);

	assert(response5 !== null);
	assert(response5.headers['@code'] === 200);
	assert(response5.headers['@status'] === '200 OK');
	assert(response5.payload !== null);
	assert(response5.payload.toString('utf8').trim().startsWith('function FindProxyForURL'));

	assert(response6 !== null);
	assert(response6.headers['@code'] === 200);
	assert(response6.headers['@status'] === '200 OK');
	assert(response6.headers['content-type'] === 'text/html');
	assert(response6.headers['content-length'] !== null);
	assert(response6.headers['Service-Worker-Allowed'] === '/browser');
	assert(response6.payload !== null);
	assert(response6.payload.toString('utf8').includes('<!DOCTYPE html>'));

});



export default finish('other/ROUTER');

