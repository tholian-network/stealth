
import net from 'net';

import { Buffer, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish, EXAMPLE              } from '../../../covert/index.mjs';
import { HTTP                                   } from '../../../stealth/source/connection/HTTP.mjs';



describe('HTTP.connect()', function(assert) {

	assert(isFunction(HTTP.connect), true);


	let url        = EXAMPLE.toURL('http://example.com:80/index.html');
	let connection = HTTP.connect(url);

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

describe('HTTP.disconnect()', function(assert) {

	assert(isFunction(HTTP.disconnect), true);


	let url        = EXAMPLE.toURL('http://example.com:80/index.html');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(HTTP.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTP.receive()/client', function(assert) {

	assert(isFunction(HTTP.receive), true);


	let url        = EXAMPLE.toURL('http://example.com:80');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		HTTP.receive(connection, Buffer.from([
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

describe('HTTP.receive()/server', function(assert) {

	assert(isFunction(HTTP.receive), true);


	let connection = HTTP.upgrade(new net.Socket(), {});

	connection.once('@connect', () => {

		HTTP.receive(connection, Buffer.from([
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

describe('HTTP.send()', function(assert) {

	assert(isFunction(HTTP.send), true);


	let url        = EXAMPLE.toURL('http://example.com:80/index.html');
	let connection = HTTP.connect(url);

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

		HTTP.send(connection, {
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

describe('HTTP.upgrade()', function(assert) {

	let server = new net.Server({
		allowHalfOpen:  true,
		pauseOnConnect: true
	});

	server.once('connection', (socket) => {

		let connection = HTTP.upgrade(socket);

		connection.once('@connect', () => {
			assert(true);
		});

		connection.once('request', (request) => {

			assert(request, {
				headers: {
					'@method':         'GET',
					'@url':            '/index.html',
					'host':            'example.com',
					'accept-encoding': 'gzip'
				},
				payload: null
			});

		});

		connection.once('@disconnect', () => {
			assert(true);
		});

		socket.resume();

	});

	server.listen(13337, null);


	let url        = EXAMPLE.toURL('http://localhost:13337');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		setTimeout(() => {

			HTTP.send(connection, {
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

		}, 100);

		setTimeout(() => {
			assert(HTTP.disconnect(connection), true);
		}, 500);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		server.close();
		assert(true);
	}, 1000);

});


export default finish('stealth/connection/HTTP', {
	internet: true,
	network:  true
});

