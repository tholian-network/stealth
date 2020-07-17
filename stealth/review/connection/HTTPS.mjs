
import net from 'net';

import { Buffer, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish, EXAMPLE              } from '../../../covert/index.mjs';
import { HTTPS                                  } from '../../../stealth/source/connection/HTTPS.mjs';



describe('HTTPS.connect()', function(assert) {

	assert(isFunction(HTTPS.connect), true);


	let url        = EXAMPLE.toURL('https://example.com/index.html');
	let connection = HTTPS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTPS.disconnect()', function(assert) {

	assert(isFunction(HTTPS.disconnect), true);


	let url        = EXAMPLE.toURL('https://example.com/index.html');
	let connection = HTTPS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(HTTPS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTPS.receive()/client', function(assert) {

	assert(isFunction(HTTPS.receive), true);


	let url        = EXAMPLE.toURL('https://example.com');
	let connection = HTTPS.connect(url);

	connection.once('@connect', () => {

		HTTPS.receive(connection, Buffer.from([
			'HTTP/1.1 200 OK',
			'Content-Encoding: identity',
			'Cache-Control: max-age=604800',
			'Content-Type: text/html; charset=UTF-8',
			'Date: Sun, 14 Apr 2019 13:15:09 GMT',
			'Etag: "1541025663"',
			'Expires: Sun, 21 Apr 2019 13:15:09 GMT',
			'Last-Modified: Fri, 09 Aug 2013 23:54:35 GMT',
			'Server: ECS (dcb/7EED)',
			'Vary: Accept-Encoding',
			'X-Cache: HIT',
			'Content-Length: 53',
			'',
			'<!doctype html>\n<html>\n<title>Example</title>\n</html>'
		].join('\r\n'), 'utf8'), (response) => {

			assert(response, {
				headers: {
					'@status':          '200 OK',
					'content-encoding': 'identity',
					'cache-control':    'max-age=604800',
					'content-type':     'text/html; charset=UTF-8',
					'date':             'Sun, 14 Apr 2019 13:15:09 GMT',
					'etag':             '"1541025663"',
					'expires':          'Sun, 21 Apr 2019 13:15:09 GMT',
					'last-modified':    'Fri, 09 Aug 2013 23:54:35 GMT',
					'server':           'ECS (dcb/7EED)',
					'vary':             'Accept-Encoding',
					'x-cache':          'HIT',
					'content-length':   '53'
				},
				payload: Buffer.from('<!doctype html>\n<html>\n<title>Example</title>\n</html>', 'utf8')
			});

			connection.disconnect();

		});

	});

});

describe('HTTPS.receive()/server', function(assert) {

	assert(isFunction(HTTPS.receive), true);


	let connection = HTTPS.upgrade(new net.Socket(), {});

	connection.once('@connect', () => {

		HTTPS.receive(connection, Buffer.from([
			'GET /index.html HTTP/1.1',
			'Host: example.com',
			'Accept-Encoding: gzip',
			'Range: bytes=0-',
			''
		].join('\r\n'), 'utf8'), (request) => {

			assert(request, {
				headers: {
					'@method':         'GET',
					'@url':            '/index.html',
					'host':            'example.com',
					'accept-encoding': 'gzip',
					'range':           'bytes=0-'
				},
				payload: null
			});

			connection.disconnect();

		});

	});

});

describe('HTTPS.send()', function(assert) {

	assert(isFunction(HTTPS.send), true);


	let url        = EXAMPLE.toURL('https://example.com/index.html');
	let connection = HTTPS.connect(url);

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['@status'],          '200 OK');
		assert(response.headers['content-encoding'], 'gzip');
		assert(response.headers['content-type'],     'text/html; charset=UTF-8');
		assert(response.headers['vary'],             'Accept-Encoding');

		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));

	});

	connection.once('@connect', () => {

		HTTPS.send(connection, {
			headers: {
				'@method':         'GET',
				'@url':            '/index.html',
				'host':            'example.com',
				'accept-encoding': 'gzip'
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

});


export default finish('stealth/connection/HTTPS', {
	internet: true
});

