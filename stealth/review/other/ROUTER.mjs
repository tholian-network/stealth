
import { Buffer, isBuffer, isNumber, isObject } from '../../../base/index.mjs';
import { describe, finish             } from '../../../covert/index.mjs';
import { ROUTER                       } from '../../../stealth/source/other/ROUTER.mjs';
import { URL                          } from '../../../stealth/source/parser/URL.mjs';



describe('ROUTER.error()/callback', function(assert) {

	ROUTER.error(null, (response) => {

		assert(response, {
			headers: {
				'@code':   500,
				'@status': '500 Internal Server Error'
			},
			payload: null
		});

	});

	ROUTER.error({}, (response) => {

		assert(response, {
			headers: {
				'@code':   500,
				'@status': '500 Internal Server Error'
			},
			payload: null
		});

	});

	ROUTER.error({
		err: { type: 'host' },
		url: 'https://example.com/index.html',
	}, (response) => {

		assert(response, {
			headers: {
				'@code':   500,
				'@status': '500 Internal Server Error'
			},
			payload: Buffer.from('"host" Error for "https://example.com/index.html".', 'utf8')
		});

	});

	ROUTER.error({
		err: { code: 404 }
	}, (response) => {

		assert(response, {
			headers: {
				'@code':   404,
				'@status': '404 Not Found'
			},
			payload: null
		});

	});

	ROUTER.error({
		err:     { type: 'host' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': '127.0.0.1' }
	}, (response) => {

		assert(response, {
			headers: {
				'@code':    307,
				'@status':  '307 Temporary Redirect',
				'location': 'http://127.0.0.1:65432/browser/internal/fix-host.html?url=https%3A%2F%2Fexample.com%2Findex.html'
			},
			payload: null
		});

	});

});

describe('ROUTER.error()/return', function(assert) {

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

	assert(response1, {
		headers: {
			'@code':   500,
			'@status': '500 Internal Server Error'
		},
		payload: null
	});

	assert(response2, {
		headers: {
			'@code':   500,
			'@status': '500 Internal Server Error'
		},
		payload: null
	});

	assert(response3, {
		headers: {
			'@code':   500,
			'@status': '500 Internal Server Error'
		},
		payload: Buffer.from('"host" Error for "https://example.com/index.html".', 'utf8')
	});

	assert(response4, {
		headers: {
			'@code':   404,
			'@status': '404 Not Found'
		},
		payload: null
	});

	assert(response5, {
		headers: {
			'@code':    307,
			'@status':  '307 Temporary Redirect',
			'location': 'http://127.0.0.1:65432/browser/internal/fix-host.html?url=https%3A%2F%2Fexample.com%2Findex.html'
		},
		payload: null
	});

});

describe('ROUTER.send()/callback', function(assert) {

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

		assert(response, {
			headers: {
				'@code':   500,
				'@status': '500 Internal Server Error'
			},
			payload: null
		});

	});

	ROUTER.send(ref2, (response) => {

		assert(response, {
			headers: {
				'@code':   500,
				'@status': '500 Internal Server Error'
			},
			payload: null
		});

	});

	ROUTER.send(ref3, (response) => {

		assert(response, {
			headers: {
				'@code':    301,
				'@status':  '301 Moved Permanently',
				'location': '/browser/index.html'
			},
			payload: null
		});

	});

	ROUTER.send(ref4, (response) => {

		assert(response, {
			headers: {
				'@code':    301,
				'@status':  '301 Moved Permanently',
				'location': '/browser/design/other/favicon.ico'
			},
			payload: null
		});

	});

	ROUTER.send(ref5, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['@code'],   200);
		assert(response.headers['@status'], '200 OK');

		assert(response.payload.toString('utf8').trim().startsWith('function FindProxyForURL'));

	});

	ROUTER.send(ref6, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['@code'],                   200);
		assert(response.headers['@status'],                 '200 OK');
		assert(response.headers['content-type'],            'text/html');
		assert(isNumber(response.headers['content-length']), true);
		assert(response.headers['Content-Security-Policy'], 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'');
		assert(response.headers['Service-Worker-Allowed'],  '/browser');

		assert(response.payload.toString('utf8').includes('<!DOCTYPE html>'));

	});

});

describe('ROUTER.send()/return', function(assert) {

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

	assert(response1, {
		headers: {
			'@code':   500,
			'@status': '500 Internal Server Error'
		},
		payload: null
	});

	assert(response2, {
		headers: {
			'@code':   500,
			'@status': '500 Internal Server Error'
		},
		payload: null
	});

	assert(response3, {
		headers: {
			'@code':    301,
			'@status':  '301 Moved Permanently',
			'location': '/browser/index.html'
		},
		payload: null
	});

	assert(response4, {
		headers: {
			'@code':    301,
			'@status':  '301 Moved Permanently',
			'location': '/browser/design/other/favicon.ico'
		},
		payload: null
	});

	assert(isObject(response5),          true);
	assert(isObject(response5.headers),  true);
	assert(isBuffer(response5.payload),  true);
	assert(response5.headers['@code'],   200);
	assert(response5.headers['@status'], '200 OK');
	assert(response5.payload.toString('utf8').trim().startsWith('function FindProxyForURL'));

	assert(isObject(response6),                           true);
	assert(isObject(response6.headers),                   true);
	assert(isBuffer(response6.payload),                   true);
	assert(response6.headers['@code'],                    200);
	assert(response6.headers['@status'],                  '200 OK');
	assert(response6.headers['content-type'],             'text/html');
	assert(isNumber(response6.headers['content-length']), true);
	assert(response6.headers['Content-Security-Policy'],  'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'');
	assert(response6.headers['Service-Worker-Allowed'],   '/browser');
	assert(response6.payload.toString('utf8').includes('<!DOCTYPE html>'));

});


export default finish('stealth/other/ROUTER');

