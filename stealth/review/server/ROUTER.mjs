
import { Buffer, isBuffer, isNumber, isObject } from '../../../base/index.mjs';
import { describe, finish                     } from '../../../covert/index.mjs';
import { URL                                  } from '../../../stealth/source/parser/URL.mjs';
import { ROUTER                               } from '../../../stealth/source/server/ROUTER.mjs';



describe('ROUTER.error()', function(assert) {

	let err1 = null;
	let err2 = { code: 403 };
	let err3 = { code: 501 };
	let err4 = { type: 'host' };
	let err5 = { type: 'mode', url: 'https://example.com/index.html' };
	let err6 = { type: 'request', cause: 'socket-stability', url: 'https://tholian.network/' };

	ROUTER.error(err1, (response) => {

		assert(response, {
			headers: {
				'@status': 501
			},
			payload: Buffer.from('All your errors are belong to us nao.', 'utf8')
		});

	});

	ROUTER.error(err2, (response) => {

		assert(response, {
			headers: {
				'@status': 403
			},
			payload: Buffer.from('All your errors are belong to us nao.', 'utf8')
		});

	});

	ROUTER.error(err3, (response) => {

		assert(response, {
			headers: {
				'@status': 501
			},
			payload: Buffer.from('All your errors are belong to us nao.', 'utf8')
		});

	});

	ROUTER.error(err4, (response) => {

		assert(response, {
			headers: {
				'@status':  307,
				'location': '/browser/internal/fix-host.html'
			},
			payload: null
		});

	});

	ROUTER.error(err5, (response) => {

		assert(response, {
			headers: {
				'@status':  307,
				'location': '/browser/internal/fix-mode.html?url=' + encodeURIComponent(err5.url)
			},
			payload: null
		});

	});

	ROUTER.error(err6, (response) => {

		assert(response, {
			headers: {
				'@status':  307,
				'location': '/browser/internal/fix-request.html?cause=socket-stability&url=' + encodeURIComponent(err6.url)
			},
			payload: null
		});

	});

});

describe('ROUTER.send()', function(assert) {

	let ref1 = null;
	let ref2 = URL.parse('http://example-host:65432/');
	let ref3 = URL.parse('http://example-host:65432/favicon.ico');
	let ref4 = URL.parse('http://example-host:65432/proxy.pac');
	let ref5 = URL.parse('http://example-host:65432/browser/index.html');
	let ref6 = URL.parse('http://example-host:65432/stealth/:1337,webview:/https://tholian.network/');

	ref5.headers = {
		'host': 'localhost'
	};

	ROUTER.send(ref1, (response) => {

		assert(response, {
			headers: {
				'@status': 501
			},
			payload: Buffer.from('All your errors are belong to us nao.', 'utf8')
		});

	});

	ROUTER.send(ref2, (response) => {

		assert(response, Object.assign(URL.parse(ref2.link), {
			headers: {
				'@status':  301,
				'location': '/browser/index.html'
			},
			payload: null
		}));

	});

	ROUTER.send(ref3, (response) => {

		assert(response, Object.assign(URL.parse(ref3.link), {
			headers: {
				'@status':  301,
				'location': '/browser/design/common/tholian.ico'
			},
			payload: null
		}));

	});

	ROUTER.send(ref4, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['@status'],                  200);
		assert(response.headers['content-type'],             'application/x-ns-proxy-autoconfig');
		assert(isNumber(response.headers['content-length']), true);

		assert(response.payload.toString('utf8').trim().startsWith('function FindProxyForURL'));

	});

	ROUTER.send(ref5, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['@status'],                 200);
		assert(response.headers['content-type'],            'text/html');
		assert(isNumber(response.headers['content-length']), true);
		assert(response.headers['Content-Security-Policy'], 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'');
		assert(response.headers['Service-Worker-Allowed'],  '/browser');

		assert(response.payload.toString('utf8').includes('<!DOCTYPE html>'));

	});

	ROUTER.send(ref6, (response) => {

		assert(response, Object.assign(URL.parse(ref6.link), {
			headers: {
				'@status':  307,
				'location': '/stealth/:1337,webview:/https://tholian.network/'
			},
			payload: null
		}));

	});

});


export default finish('stealth/server/ROUTER', {
	internet: false,
	network:  false
});

