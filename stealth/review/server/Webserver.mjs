
import { Buffer, isBuffer, isObject      } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { ENVIRONMENT                     } from '../../../stealth/source/ENVIRONMENT.mjs';
import { HTTP                            } from '../../../stealth/source/connection/HTTP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../../../stealth/review/Stealth.mjs';



before(connect);

describe('HTTP.send()/GET/', function(assert) {

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/',
				'host':    'localhost'
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@status':   301,
				'@transfer': {
					'encoding': 'identity',
					'length':   0,
					'range':    [ 0, 0 ]
				},
				'location':         '/browser/index.html',
				'content-encoding': 'identity',
				'content-length':   0
			},
			payload: Buffer.from('', 'utf8')
		});

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTP.send()/GET/browser/index.html', function(assert) {

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/browser/index.html',
				'host':    'localhost'
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);

		assert(response.headers['@status'],   200);
		assert(response.headers['@transfer'], {
			'encoding': 'identity',
			'length':   3995,
			'range':    [ 0, 3994 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   3995);
		assert(response.headers['content-type'],     'text/html');

		assert(response.headers['content-security-policy'], 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'');
		assert(response.headers['service-worker-allowed'],  '/browser');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    3995);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTP.send()/GET/favicon.ico', function(assert) {

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/favicon.ico',
				'host':    'localhost'
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@status':   301,
				'@transfer': {
					'encoding': 'identity',
					'length':   0,
					'range':    [ 0, 0 ]
				},
				'location':         '/browser/design/common/tholian.ico',
				'content-encoding': 'identity',
				'content-length':   0
			},
			payload: Buffer.from('', 'utf8')
		});

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTP.send()/GET/browser/design/common/tholian.ico', function(assert) {

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/browser/design/common/tholian.ico',
				'host':    'localhost'
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);

		assert(response.headers['@status'],   200);
		assert(response.headers['@transfer'], {
			'encoding': 'identity',
			'length':   2238,
			'range':    [ 0, 2237 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   2238);
		assert(response.headers['content-type'],     'image/x-icon');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    2238);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTP.send()/GET/proxy.pac/127.0.0.1', function(assert) {

	let url        = URL.parse('http://127.0.0.1:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/proxy.pac',
				'host':    'localhost'
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);

		assert(response.headers['@status'],   200);
		assert(response.headers['@transfer'], {
			'encoding': 'identity',
			'length':   157,
			'range':    [ 0, 156 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   157);
		assert(response.headers['content-type'],     'application/x-ns-proxy-autoconfig');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    157);

		assert(response.payload.toString('utf8').includes('(host === "' + ENVIRONMENT.hostname + '")'));
		assert(response.payload.toString('utf8').includes('(host === "' + url.host + '")'));

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTP.send()/GET/proxy.pac/127.0.0.2', function(assert) {

	let url        = URL.parse('http://127.0.0.2:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/proxy.pac',
				'host':    'localhost'
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);

		assert(response.headers['@status'],   200);
		assert(response.headers['@transfer'], {
			'encoding': 'identity',
			'length':   157,
			'range':    [ 0, 156 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   157);
		assert(response.headers['content-type'],     'application/x-ns-proxy-autoconfig');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    157);

		assert(response.payload.toString('utf8').includes('(host === "' + ENVIRONMENT.hostname + '")'));
		assert(response.payload.toString('utf8').includes('(host === "' + url.host + '")'));

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

after(disconnect);


export default finish('stealth/server/Webserver', {
	internet: false,
	network:  true
});

