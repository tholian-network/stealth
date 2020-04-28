
import { isBuffer, isObject } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { IPV4, IPV6         } from '../../../covert/EXAMPLE.mjs';
import { REDIRECT           } from '../../../stealth/source/other/REDIRECT.mjs';



describe('REDIRECT.error()/callback', function(assert) {

	REDIRECT.error(null, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(isObject(response.headers),  true);
		assert(response.headers['@code'],   500);
		assert(response.headers['@status'], '500 Internal Server Error');
		assert(response.payload,            null);

	});

	REDIRECT.error({}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.payload !== null);

		assert(isObject(response.headers),        true);
		assert(response.headers['@code'],         500);
		assert(response.headers['@status'],       '500 Internal Server Error');
		assert(isBuffer(response.payload),        true);
		assert(response.payload.toString('utf8'), 'Error for "null".');

	});

	REDIRECT.error({
		err:     { type: 'host' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': IPV4.ip }
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers),   true);
		assert(response.headers['@code'],    307);
		assert(response.headers['@status'],  '307 Temporary Redirect');
		assert(response.headers['location'], 'http://' + IPV4.ip + ':65432/browser/internal/fix-host.html?url=https%3A%2F%2Fexample.com%2Findex.html');
		assert(response.payload,             null);

	});

	REDIRECT.error({
		err:     { cause: 'socket-proxy', code: 500, type: 'request' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': IPV6.ip }
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers),   true);
		assert(response.headers['@code'],    307);
		assert(response.headers['@status'],  '307 Temporary Redirect');
		assert(response.headers['location'], 'http://[' + IPV6.ip + ']:65432/browser/internal/fix-request.html?url=https%3A%2F%2Fexample.com%2Findex.html&code=500&cause=socket-proxy');
		assert(response.payload,             null);

	});

	REDIRECT.error({
		err:   { type: 'mode' },
		url:   'https://example.com/index.html',
		flags: { webview: true }
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers),   true);
		assert(response.headers['@code'],    307);
		assert(response.headers['@status'],  '307 Temporary Redirect');
		assert(response.headers['location'], '/browser/internal/fix-mode.html?url=https%3A%2F%2Fexample.com%2Findex.html');
		assert(response.payload,             null);

	});

	REDIRECT.error({
		err:   { type: 'filter' },
		url:   'https://example.com/index.html',
		flags: { webview: true }
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers),   true);
		assert(response.headers['@code'],    307);
		assert(response.headers['@status'],  '307 Temporary Redirect');
		assert(response.headers['location'], '/browser/internal/fix-filter.html?url=https%3A%2F%2Fexample.com%2Findex.html');
		assert(response.payload,             null);

	});

});

describe('REDIRECT.error()/return', function(assert) {

	let response1 = REDIRECT.error(null);
	let response2 = REDIRECT.error({});
	let response3 = REDIRECT.error({
		err:     { type: 'host' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': IPV4.ip }
	});
	let response4 = REDIRECT.error({
		err:     { cause: 'socket-proxy', code: 500, type: 'request' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': IPV6.ip }
	});
	let response5 = REDIRECT.error({
		err:   { type: 'mode' },
		url:   'https://example.com/index.html',
		flags: { webview: true }
	});
	let response6 = REDIRECT.error({
		err:   { type: 'filter' },
		url:   'https://example.com/index.html',
		flags: { webview: true }
	});

	assert(response1 !== null);
	assert(response1.headers !== null);

	assert(isObject(response1.headers),  true);
	assert(response1.headers['@code'],   500);
	assert(response1.headers['@status'], '500 Internal Server Error');
	assert(response1.payload,            null);

	assert(response2 !== null);
	assert(response2.headers !== null);
	assert(response2.payload !== null);

	assert(isObject(response2.headers),        true);
	assert(response2.headers['@code'],         500);
	assert(response2.headers['@status'],       '500 Internal Server Error');
	assert(isBuffer(response2.payload),        true);
	assert(response2.payload.toString('utf8'), 'Error for "null".');

	assert(response3 !== null);
	assert(response3.headers !== null);

	assert(isObject(response3.headers),   true);
	assert(response3.headers['@code'],    307);
	assert(response3.headers['@status'],  '307 Temporary Redirect');
	assert(response3.headers['location'], 'http://' + IPV4.ip + ':65432/browser/internal/fix-host.html?url=https%3A%2F%2Fexample.com%2Findex.html');
	assert(response3.payload,             null);

	assert(response4 !== null);
	assert(response4.headers !== null);

	assert(isObject(response4.headers),   true);
	assert(response4.headers['@code'],    307);
	assert(response4.headers['@status'],  '307 Temporary Redirect');
	assert(response4.headers['location'], 'http://[' + IPV6.ip + ']:65432/browser/internal/fix-request.html?url=https%3A%2F%2Fexample.com%2Findex.html&code=500&cause=socket-proxy');
	assert(response4.payload,             null);

	assert(response5 !== null);
	assert(response5.headers !== null);

	assert(isObject(response5.headers),   true);
	assert(response5.headers['@code'],    307);
	assert(response5.headers['@status'],  '307 Temporary Redirect');
	assert(response5.headers['location'], '/browser/internal/fix-mode.html?url=https%3A%2F%2Fexample.com%2Findex.html');
	assert(response5.payload,             null);

	assert(response6 !== null);
	assert(response6.headers !== null);

	assert(isObject(response6.headers),   true);
	assert(response6.headers['@code'],    307);
	assert(response6.headers['@status'],  '307 Temporary Redirect');
	assert(response6.headers['location'], '/browser/internal/fix-filter.html?url=https%3A%2F%2Fexample.com%2Findex.html');
	assert(response6.payload,             null);

});

describe('REDIRECT.send()/callback', function(assert) {

	REDIRECT.send(null, (response) => {
		assert(response, null);
	});

	REDIRECT.send({}, (response) => {
		assert(response, null);
	});

	REDIRECT.send({
		code:     301,
		location: 'https://example.com/index.html'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers),   true);
		assert(response.headers['@code'],    301);
		assert(response.headers['@status'],  '301 Moved Permanently');
		assert(response.headers['location'], 'https://example.com/index.html');
		assert(response.payload,             null);

	});

	REDIRECT.send({
		code: 307,
		path: '/stealth/README.md'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers),   true);
		assert(response.headers['@code'],    307);
		assert(response.headers['@status'],  '307 Temporary Redirect');
		assert(response.headers['location'], '/stealth/README.md');
		assert(response.payload,             null);

	});

	REDIRECT.send({
		code: 308,
		path: '/stealth/README.md'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers),   true);
		assert(response.headers['@code'],    308);
		assert(response.headers['@status'],  '308 Permanent Redirect');
		assert(response.headers['location'], '/stealth/README.md');
		assert(response.payload,             null);

	});

});

describe('REDIRECT.send()/return', function(assert) {

	let response1 = REDIRECT.send(null);
	let response2 = REDIRECT.send({});
	let response3 = REDIRECT.send({ code: 301, location: 'https://example.com/index.html' });
	let response4 = REDIRECT.send({ code: 307, path: '/stealth/README.md' });
	let response5 = REDIRECT.send({ code: 308, path: '/stealth/README.md' });

	assert(response1, null);

	assert(response2, null);

	assert(response3 !== null);
	assert(response3.headers !== null);

	assert(isObject(response3.headers),   true);
	assert(response3.headers['@code'],    301);
	assert(response3.headers['@status'],  '301 Moved Permanently');
	assert(response3.headers['location'], 'https://example.com/index.html');
	assert(response3.payload,             null);

	assert(response4 !== null);
	assert(response4.headers !== null);

	assert(isObject(response4.headers),   true);
	assert(response4.headers['@code'],    307);
	assert(response4.headers['@status'],  '307 Temporary Redirect');
	assert(response4.headers['location'], '/stealth/README.md');
	assert(response4.payload,             null);

	assert(response5 !== null);
	assert(response5.headers !== null);

	assert(isObject(response5.headers),   true);
	assert(response5.headers['@code'],    308);
	assert(response5.headers['@status'],  '308 Permanent Redirect');
	assert(response5.headers['location'], '/stealth/README.md');
	assert(response5.payload,             null);

});


export default finish('stealth/other/REDIRECT');

