
import { Buffer                    } from '../../../base/index.mjs';
import { describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { REDIRECT                  } from '../../../stealth/source/other/REDIRECT.mjs';



describe('REDIRECT.error()/callback', function(assert) {

	REDIRECT.error(null, (response) => {

		assert(response, {
			headers: {
				'@code':   500,
				'@status': '500 Internal Server Error'
			},
			payload: null
		});

	});

	REDIRECT.error({}, (response) => {

		assert(response, {
			headers: {
				'@code':   500,
				'@status': '500 Internal Server Error'
			},
			payload: Buffer.from('Error for "null".', 'utf8')
		});

	});

	REDIRECT.error({
		err:     { type: 'host' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': EXAMPLE.ipv4.ip }
	}, (response) => {

		assert(response, {
			headers: {
				'@code':    307,
				'@status':  '307 Temporary Redirect',
				'location': 'http://' + EXAMPLE.ipv4.ip + ':65432/browser/internal/fix-host.html?url=https%3A%2F%2Fexample.com%2Findex.html'
			},
			payload: null
		});

	});

	REDIRECT.error({
		err:     { cause: 'socket-proxy', code: 500, type: 'request' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': EXAMPLE.ipv6.ip }
	}, (response) => {

		assert(response, {
			headers: {
				'@code':    307,
				'@status':  '307 Temporary Redirect',
				'location': 'http://[' + EXAMPLE.ipv6.ip + ']:65432/browser/internal/fix-request.html?url=https%3A%2F%2Fexample.com%2Findex.html&code=500&cause=socket-proxy'
			},
			payload: null
		});

	});

	REDIRECT.error({
		err:   { type: 'mode' },
		url:   'https://example.com/index.html',
		flags: { webview: true }
	}, (response) => {

		assert(response, {
			headers: {
				'@code':    307,
				'@status':  '307 Temporary Redirect',
				'location': '/browser/internal/fix-mode.html?url=https%3A%2F%2Fexample.com%2Findex.html'
			},
			payload: null
		});

	});

});

describe('REDIRECT.error()/return', function(assert) {

	let response1 = REDIRECT.error(null);
	let response2 = REDIRECT.error({});
	let response3 = REDIRECT.error({
		err:     { type: 'host' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': EXAMPLE.ipv4.ip }
	});
	let response4 = REDIRECT.error({
		err:     { cause: 'socket-proxy', code: 500, type: 'request' },
		url:     'https://example.com/index.html',
		flags:   { proxy: true },
		headers: { '@local': EXAMPLE.ipv6.ip }
	});
	let response5 = REDIRECT.error({
		err:   { type: 'mode' },
		url:   'https://example.com/index.html',
		flags: { webview: true }
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
		payload: Buffer.from('Error for "null".', 'utf8')
	});

	assert(response3, {
		headers: {
			'@code':    307,
			'@status':  '307 Temporary Redirect',
			'location': 'http://' + EXAMPLE.ipv4.ip + ':65432/browser/internal/fix-host.html?url=https%3A%2F%2Fexample.com%2Findex.html'
		},
		payload: null
	});

	assert(response4, {
		headers: {
			'@code':    307,
			'@status':  '307 Temporary Redirect',
			'location': 'http://[' + EXAMPLE.ipv6.ip + ']:65432/browser/internal/fix-request.html?url=https%3A%2F%2Fexample.com%2Findex.html&code=500&cause=socket-proxy'
		},
		payload: null
	});

	assert(response5, {
		headers: {
			'@code':    307,
			'@status':  '307 Temporary Redirect',
			'location': '/browser/internal/fix-mode.html?url=https%3A%2F%2Fexample.com%2Findex.html'
		},
		payload: null
	});

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

		assert(response, {
			headers: {
				'@code':    301,
				'@status':  '301 Moved Permanently',
				'location': 'https://example.com/index.html'
			},
			payload: null
		});

	});

	REDIRECT.send({
		code: 307,
		path: '/stealth/README.md'
	}, (response) => {

		assert(response, {
			headers: {
				'@code':    307,
				'@status':  '307 Temporary Redirect',
				'location': '/stealth/README.md'
			},
			payload: null
		});

	});

	REDIRECT.send({
		code: 308,
		path: '/stealth/README.md'
	}, (response) => {

		assert(response, {
			headers: {
				'@code':    308,
				'@status':  '308 Permanent Redirect',
				'location': '/stealth/README.md'
			},
			payload: null
		});

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

	assert(response3, {
		headers: {
			'@code':    301,
			'@status':  '301 Moved Permanently',
			'location': 'https://example.com/index.html'
		},
		payload: null
	});

	assert(response4, {
		headers: {
			'@code':    307,
			'@status':  '307 Temporary Redirect',
			'location': '/stealth/README.md'
		},
		payload: null
	});

	assert(response5, {
		headers: {
			'@code':    308,
			'@status':  '308 Permanent Redirect',
			'location': '/stealth/README.md'
		},
		payload: null
	});

});


export default finish('stealth/other/REDIRECT');

