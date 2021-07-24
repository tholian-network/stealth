
import net from 'net';

import { Buffer, isArray, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish                                } from '../../../covert/index.mjs';
import { HTTP                                            } from '../../../stealth/source/connection/HTTP.mjs';
import { IP                                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                                             } from '../../../stealth/source/parser/URL.mjs';



const PAYLOADS = {

	// TODO: gzip encodings
	// TODO: chunked encodings

	'200': {

		'REQUEST': Buffer.from([
			'GET /path/to/resource?param=value HTTP/1.1',
			'Accept-Encoding: identity',
			'',
			'{"submitted":"data"}',
			'',
			''
		].join('\r\n'), 'utf8'),

		'RESPONSE': Buffer.from([
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
		].join('\r\n'), 'utf8')

	},

	'206': {

		'PAYLOAD': Buffer.from([
			'The sentence #1 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #2 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #3 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #4 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #5 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #6 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #7 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #8 inside the big buffer is exactly 64 bytes long.\n'
		].join(''), 'utf8'),

		'REQUEST1': Buffer.from([
			'GET /path/to/stream?token=value HTTP/1.1',
			'Accept-Encoding: identity',
			'Range: bytes=0-127',
			''
		].join('\r\n'), 'utf8'),

		'REQUEST2': Buffer.from([
			'GET /path/to/stream?token=value HTTP/1.1',
			'Accept-Encoding: identity',
			'Range: bytes=128-255',
			''
		].join('\r\n'), 'utf8'),

		'REQUEST3': Buffer.from([
			'GET /path/to/stream?token=value HTTP/1.1',
			'Accept-Encoding: identity',
			'Range: bytes=256-',
			'',
			'{"submitted":"data"}',
			'',
			''
		].join('\r\n'), 'utf8'),

		'RESPONSE1': Buffer.from([
			'HTTP/1.1 206 Partial Content',
			'Content-Encoding: identity',
			'Content-Range: bytes 0-127/512',
			'',
			[
				'The sentence #1 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #2 inside the big buffer is exactly 64 bytes long.\n'
			].join('')
		].join('\r\n'), 'utf8'),

		'RESPONSE2': Buffer.from([
			'HTTP/1.1 206 Partial Content',
			'Content-Encoding: identity',
			'Content-Range: bytes 128-255/512',
			'',
			[
				'The sentence #3 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #4 inside the big buffer is exactly 64 bytes long.\n'
			].join('')
		].join('\r\n'), 'utf8'),

		'RESPONSE3': Buffer.from([
			'HTTP/1.1 206 Partial Content',
			'Content-Encoding: identity',
			'Content-Range: bytes 256-511/512',
			'',
			[
				'The sentence #5 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #6 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #7 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #8 inside the big buffer is exactly 64 bytes long.\n'
			].join('')
		].join('\r\n'), 'utf8')

	},

	'404': {
	}

};



describe('HTTP.connect()', function(assert) {

	assert(isFunction(HTTP.connect), true);

	let url        = Object.assign(URL.parse('http://example.com:80/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
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

	let url        = Object.assign(URL.parse('http://example.com:80/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
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

describe('HTTP.receive()/client/200', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['200']['RESPONSE'], (response) => {

		assert(response, {
			headers: {
				'@status':          200,
				'@transfer':        {
					'encoding': 'identity',
					'length':   53,
					'range':    [ 0, 52 ]
				},
				'cache-control':    'max-age=604800',
				'content-encoding': 'identity',
				'content-length':   53,
				'content-type':     'text/html; charset=UTF-8',
				'date': {
					year:    2019,
					month:   4,
					day:     14,
					hour:    13,
					minute:  15,
					second:  9
				},
				'etag': '"1541025663"',
				'expires': {
					year:    2019,
					month:   4,
					day:     21,
					hour:    13,
					minute:  15,
					second:  9
				},
				'last-modified': {
					year:    2013,
					month:   8,
					day:     9,
					hour:    23,
					minute:  54,
					second:  35
				},
				'server': 'ECS (dcb/7EED)',
				'vary': 'Accept-Encoding',
				'x-cache': 'HIT'
			},
			payload: Buffer.from('<!doctype html>\n<html>\n<title>Example</title>\n</html>', 'utf8')
		});

	});

});

describe('HTTP.receive()/client/200/partial', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['200']['RESPONSE'].slice(0, 342), (response) => {

		assert(response, {
			headers: {
				'@status':          200,
				'@transfer':        {
					'encoding': null,
					'length':   53,
					'range':    [ 0, 52 ]
				},
				'cache-control':    'max-age=604800',
				'content-encoding': 'identity',
				'content-length':   53,
				'content-type':     'text/html; charset=UTF-8',
				'date': {
					year:    2019,
					month:   4,
					day:     14,
					hour:    13,
					minute:  15,
					second:  9
				},
				'etag': '"1541025663"',
				'expires': {
					year:    2019,
					month:   4,
					day:     21,
					hour:    13,
					minute:  15,
					second:  9
				},
				'last-modified': {
					year:    2013,
					month:   8,
					day:     9,
					hour:    23,
					minute:  54,
					second:  35
				},
				'server': 'ECS (dcb/7EED)',
				'vary': 'Accept-Encoding',
				'x-cache': 'HIT'
			},
			payload: null
		});

	});

});

describe('HTTP.receive()/client/206', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['206']['RESPONSE1'], (response) => {

		assert(response, {
			headers: {
				'@status':          206,
				'@transfer':        {
					'encoding': 'identity',
					'length':   512,
					'range':    [ 0, 127 ]
				},
				'content-encoding': 'identity',
				'content-length':   128,
				'content-range':    'bytes 0-127/512'
			},
			payload: Buffer.from([
				'The sentence #1 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #2 inside the big buffer is exactly 64 bytes long.\n'
			].join(''), 'utf8')
		});

	});

	HTTP.receive(null, PAYLOADS['206']['RESPONSE2'], (response) => {

		assert(response, {
			headers: {
				'@status':          206,
				'@transfer':        {
					'encoding': 'identity',
					'length':   512,
					'range':    [ 128, 255 ]
				},
				'content-encoding': 'identity',
				'content-length':   128,
				'content-range':    'bytes 128-255/512'
			},
			payload: Buffer.from([
				'The sentence #3 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #4 inside the big buffer is exactly 64 bytes long.\n'
			].join(''), 'utf8')
		});

	});

	HTTP.receive(null, PAYLOADS['206']['RESPONSE3'], (response) => {

		assert(response, {
			headers: {
				'@status':          206,
				'@transfer':        {
					'encoding': 'identity',
					'length':   512,
					'range':    [ 256, 511 ]
				},
				'content-encoding': 'identity',
				'content-length':   256,
				'content-range':    'bytes 256-511/512'
			},
			payload: Buffer.from([
				'The sentence #5 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #6 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #7 inside the big buffer is exactly 64 bytes long.\n',
				'The sentence #8 inside the big buffer is exactly 64 bytes long.\n'
			].join(''), 'utf8')
		});

	});

	// TODO: Test case for Content-Range: */size
	// TODO: Test case for Content-Range: from-to/*

});

describe('HTTP.send()/client/200', function(assert) {

	assert(isFunction(HTTP.send), true);

	let url        = Object.assign(URL.parse('http://example.com:80/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
	let connection = HTTP.connect(url);

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);

		assert(response.headers['@status'],   200);
		assert(response.headers['@transfer'], {
			'encoding': 'gzip',
			'length':   648,
			'range':    [ 0, 647 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   1256);
		assert(response.headers['content-type'],     'text/html; charset=UTF-8');
		assert(response.headers['vary'],             'Accept-Encoding');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    1256);

	});

	connection.once('@connect', () => {

		HTTP.send(connection, {
			headers: {
				'@method':         'GET',
				'@url':            '/index.html',
				'accept-encoding': 'gzip',
				'host':            'example.com',
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

});

describe('HTTP.receive()/server/200', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['200']['REQUEST'], (request) => {

		assert(request, {
			headers: {
				'@method':          'GET',
				'@transfer':        {
					'encoding': 'identity',
					'length':   20,
					'range':    [ 0, 19 ]
				},
				'@url':             '/path/to/resource?param=value',
				'accept-encoding':  'identity',
				'content-encoding': 'identity',
				'content-length':   20
			},
			payload: Buffer.from('{"submitted":"data"}', 'utf8')
		});

	});

});

describe('HTTP.receive()/server/200/partial', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['200']['REQUEST'].slice(0, 73 + 5), (request) => {

		assert(request, {
			headers: {
				'@method':          'GET',
				'@transfer':        {
					'encoding': 'identity',
					'length':   Infinity,
					'range':    [ 0, Infinity ]
				},
				'@url':             '/path/to/resource?param=value',
				'accept-encoding':  'identity',
				'content-encoding': 'identity'
			},
			payload: Buffer.from('{"sub', 'utf8')
		});

	});

});

describe('HTTP.receive()/server/206', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['206']['REQUEST1'], (request) => {

		assert(request, {
			headers: {
				'@method':         'GET',
				'@transfer':       {
					'encoding': null,
					'length':   Infinity,
					'range':    [ 0, 127 ]
				},
				'@url':            '/path/to/stream?token=value',
				'accept-encoding': 'identity',
				'range':           'bytes=0-127'
			},
			payload: null
		});

	});

	HTTP.receive(null, PAYLOADS['206']['REQUEST2'], (request) => {

		assert(request, {
			headers: {
				'@method':         'GET',
				'@transfer':       {
					'encoding': null,
					'length':   Infinity,
					'range':    [ 128, 255 ]
				},
				'@url':            '/path/to/stream?token=value',
				'accept-encoding': 'identity',
				'range':           'bytes=128-255'
			},
			payload: null
		});

	});

	HTTP.receive(null, PAYLOADS['206']['REQUEST3'], (request) => {

		assert(request, {
			headers: {
				'@method':          'GET',
				'@transfer':        {
					'encoding': 'identity',
					'length':   Infinity,
					'range':    [ 256, Infinity ]
				},
				'@url':             '/path/to/stream?token=value',
				'accept-encoding':  'identity',
				'content-encoding': 'identity',
				'range':            'bytes=256-'
			},
			payload: Buffer.from('{"submitted":"data"}', 'utf8')
		});

	});

});

describe('HTTP.send()/server/200', function(assert) {

	assert(isFunction(HTTP.upgrade), true);
	assert(isFunction(HTTP.send),    true);

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
					'@method':          'GET',
					'@transfer':        {
						'encoding': 'identity',
						'length':   15,
						'range':    [ 0, 14 ]
					},
					'@url':             '/index.html',
					'accept-encoding':  'gzip',
					'content-encoding': 'identity',
					'content-length':   15,
					'host':             'covert.tholian.local'
				},
				payload: Buffer.from('{"status":1337}', 'utf8')
			});

		});

		connection.once('@disconnect', () => {

			assert(true);

		});

		socket.resume();

	});

	server.listen(13337, null);


	let url        = URL.parse('http://localhost:13337');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		// TODO: Verify this here, that send() results in correct frame
		// Should be without range, without content-range, and with the
		// length of payload

		HTTP.send(connection, {
			headers: {
				'@method':         'GET',
				'@url':            '/index.html',
				'host':            'covert.tholian.local',
				'accept-encoding': 'gzip'
			},
			payload: Buffer.from('{"status":1337}', 'utf8')
		}, (result) => {

			assert(result, true);

		});

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

describe('HTTP.send()/server/206', function(assert) {

	assert(isFunction(HTTP.upgrade), true);
	assert(isFunction(HTTP.send),    true);

	let server = new net.Server({
		allowHalfOpen:  true,
		pauseOnConnect: true
	});

	server.on('connection', (socket) => {

		let connection = HTTP.upgrade(socket);

		connection.once('@connect', () => {

			assert(true);

		});

		connection.once('request', (request) => {

			assert(isObject(request),                              true);
			assert(isObject(request.headers),                      true);
			assert(isArray(request.headers['@transfer']['range']), true);
			assert(request.payload,                                null);

			HTTP.send(connection, {
				headers: {
					'@status':   206,
					'@transfer': {
						'encoding': 'identity',
						'length':   PAYLOADS['206']['PAYLOAD'].length,
						'range':    request.headers['@range']
					}
				},
				payload: PAYLOADS['206']['PAYLOAD']
			}, (result) => {

				assert(result, true);

			});

		});

		connection.once('@disconnect', () => {

			assert(true);

		});

		socket.resume();

	});

	server.listen(13337, null);


	setTimeout(() => {

		let url        = URL.parse('http://localhost:13337');
		let connection = HTTP.connect(url);

		connection.once('@connect', () => {

			HTTP.send(connection, HTTP.receive(null, PAYLOADS['206']['REQUEST1']), (result) => {
				assert(result, true);
			});

		});

		connection.once('progress', (frame /*, progress */) => {
			assert(frame, HTTP.receive(null, PAYLOADS['206']['RESPONSE1']));
		});

		connection.once('@disconnect', () => {
			assert(true);
		});

	}, 0);

	setTimeout(() => {

		let url        = URL.parse('http://localhost:13337');
		let connection = HTTP.connect(url);

		connection.once('@connect', () => {

			HTTP.send(connection, HTTP.receive(null, PAYLOADS['206']['REQUEST2']), (result) => {
				assert(result, true);
			});

		});

		connection.once('progress', (frame /*, progress */) => {
			assert(frame, HTTP.receive(null, PAYLOADS['206']['RESPONSE2']));
		});

		connection.once('@disconnect', () => {
			assert(true);
		});

	}, 200);

	setTimeout(() => {

		let url        = URL.parse('http://localhost:13337');
		let connection = HTTP.connect(url);

		connection.once('@connect', () => {

			HTTP.send(connection, HTTP.receive(null, PAYLOADS['206']['REQUEST3']), (result) => {
				assert(result, true);
			});

		});

		connection.once('progress', (frame /*, progress */) => {
			assert(frame, HTTP.receive(null, PAYLOADS['206']['RESPONSE3']));
		});

		connection.once('@disconnect', () => {
			assert(true);
		});

	}, 400);

});


export default finish('stealth/connection/HTTP', {
	internet: true,
	network:  true,
	ports:    [ 80, 13337 ]
});

