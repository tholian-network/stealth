
import net from 'net';

import { Buffer, isArray, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish                                } from '../../../covert/index.mjs';
import { HTTP                                            } from '../../../stealth/source/connection/HTTP.mjs';
import { IP                                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                                             } from '../../../stealth/source/parser/URL.mjs';



// TODO: ERROR event
// TODO: REDIRECT event

const PAYLOADS = {

	// TODO: gzip encodings
	// TODO: chunked encodings

	'SIMPLE': {

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

	'PARTIAL': {

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

	}

};

const PACKETS = {

	'SIMPLE': {

		'REQUEST': {
			headers: {
				'@method':         'GET',
				'@url':            '/index.html',
				'host':            'covert.tholian.local',
				'accept-encoding': 'gzip'
			},
			payload: Buffer.from('{"status":1337}', 'utf8')
		}

	},

	'MULTIPLEX': {

		'REQUEST': {

			'/index.html': {
				headers: {
					'@method':         'GET',
					'@url':            '/index.html',
					'host':            'covert.tholian.local',
					'accept-encoding': 'identity'
				},
				payload: Buffer.from('', 'utf8')
			},

			'/api/users': {
				headers: {
					'@method':   'POST',
					'@url':      '/api/users',
					'@transfer': {
						'encoding': 'gzip'
					},
					'host':            'covert.tholian.local',
					'accept-encoding': 'gzip',
					'content-type':    'application/json'
				},
				payload: Buffer.from('{"action":"search","value":"cookiengineer"}', 'utf8')
			}

		},

		'RESPONSE': {

			'/index.html': {
				headers: {
					'@status':   200,
					'@transfer': {
						'encoding': 'identity',
						'length':   28
					},
					'content-type': 'text/html; charset=utf-8'
				},
				payload: Buffer.from('<!DOCTYPE html><html></html>', 'utf8')
			},

			'/api/users': {
				headers: {
					'@status':   200,
					'@transfer': {
						'encoding': 'gzip'
					},
					'content-type': 'application/json'
				},
				payload: Buffer.from('{"user":"cookiengineer"}', 'utf8')
			}

		}

	},

	'ONLINE': {

		'REQUEST': {
			headers: {
				'@method':         'GET',
				'@url':            '/index.html',
				'accept-encoding': 'gzip',
				'host':            'example.com',
			},
			payload: null
		}

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

describe('HTTP.receive()/client/simple/partial', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['SIMPLE']['RESPONSE'].slice(0, 342), (response) => {

		assert(response, {
			headers: {
				'@status':   200,
				'@transfer': {
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

describe('HTTP.receive()/client/partial', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['PARTIAL']['RESPONSE1'], (response) => {

		assert(response, {
			headers: {
				'@status':   206,
				'@transfer': {
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

	HTTP.receive(null, PAYLOADS['PARTIAL']['RESPONSE2'], (response) => {

		assert(response, {
			headers: {
				'@status':   206,
				'@transfer': {
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

	HTTP.receive(null, PAYLOADS['PARTIAL']['RESPONSE3'], (response) => {

		assert(response, {
			headers: {
				'@status':   206,
				'@transfer': {
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

describe('HTTP.send()/client/online', function(assert) {

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

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, PACKETS['ONLINE']['REQUEST'], (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTP.receive()/server/simple/partial', function(assert) {

	assert(isFunction(HTTP.receive), true);

	HTTP.receive(null, PAYLOADS['SIMPLE']['REQUEST'].slice(0, 73 + 5), (request) => {

		assert(request, {
			headers: {
				'@method':   'GET',
				'@transfer': {
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

describe('HTTP.send()/server/simple', function(assert) {

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
					'@method':   'GET',
					'@transfer': {
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

	server.once('close', () => {
		assert(true);
	});

	server.listen(13337, null);


	let url        = URL.parse('http://localhost:13337');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		HTTP.send(connection, PACKETS['SIMPLE']['REQUEST'], (result) => {
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

		server.close(() => {
			assert(true);
		});

	}, 1000);

});

describe('HTTP.send()/server/multiplex', function(assert) {

	assert(isFunction(HTTP.upgrade), true);
	assert(isFunction(HTTP.send),    true);

	let server = new net.Server({
		allowHalfOpen:  true,
		pauseOnConnect: true
	});

	server.once('connection', (socket) => {

		let connection = HTTP.upgrade(socket);
		let methods    = [];
		let urls       = [];
		let payloads   = [];

		connection.once('@connect', () => {
			assert(true);
		});

		connection.on('request', (request) => {

			methods.push(request.headers['@method']);
			urls.push(request.headers['@url']);
			payloads.push(request.payload);

			HTTP.send(connection, PACKETS['MULTIPLEX']['RESPONSE'][request.headers['@url']] || null);

		});

		connection.once('@disconnect', () => {

			assert(methods, [
				'GET',
				'POST'
			]);

			assert(urls, [
				'/index.html',
				'/api/users'
			]);

			assert(payloads, [
				Buffer.from(''),
				Buffer.from('{"action":"search","value":"cookiengineer"}', 'utf8')
			]);

			assert(true);

		});

		socket.resume();

	});

	server.once('close', () => {
		assert(true);
	});

	server.listen(13337, null);


	let url        = URL.parse('http://localhost:13337');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		connection.once('response', (response1) => {

			assert(response1, {
				headers: {
					'@status':   200,
					'@transfer': {
						'encoding': 'identity',
						'length':   28,
						'range':    [ 0, 27 ]
					},
					'content-encoding': 'identity',
					'content-length':   28,
					'content-type':     'text/html; charset=utf-8'
				},
				payload: Buffer.from('<!DOCTYPE html><html></html>', 'utf8')
			});

			connection.once('response', (response2) => {

				assert(response2, {
					headers: {
						'@status':   200,
						'@transfer': {
							'encoding': 'gzip',
							'length':   42,
							'range':    [ 0, 41 ]
						},
						'content-encoding': 'identity',
						'content-length':   24,
						'content-type':     'application/json'
					},
					payload: Buffer.from('{"user":"cookiengineer"}', 'utf8')
				});

				assert(HTTP.disconnect(connection), true);

			});

			HTTP.send(connection, PACKETS['MULTIPLEX']['REQUEST']['/api/users'] || null, (result) => {
				assert(result, true);
			});

		});

		HTTP.send(connection, PACKETS['MULTIPLEX']['REQUEST']['/index.html'] || null, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {

		server.close(() => {
			assert(true);
		});

	}, 1000);

});

describe('HTTP.send()/server/partial', function(assert) {

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
						'length':   PAYLOADS['PARTIAL']['PAYLOAD'].length,
						'range':    request.headers['@range']
					}
				},
				payload: PAYLOADS['PARTIAL']['PAYLOAD']
			}, (result) => {
				assert(result, true);
			});

		});

		connection.once('@disconnect', () => {
			assert(true);
		});

		socket.resume();

	});

	server.once('close', () => {
		assert(true);
	});

	server.listen(13337, null);


	setTimeout(() => {

		let url        = URL.parse('http://localhost:13337');
		let connection = HTTP.connect(url);

		connection.once('@connect', () => {

			HTTP.send(connection, HTTP.receive(null, PAYLOADS['PARTIAL']['REQUEST1']), (result) => {
				assert(result, true);
			});

		});

		connection.once('progress', (frame /*, progress */) => {
			assert(frame, HTTP.receive(null, PAYLOADS['PARTIAL']['RESPONSE1']));
		});

		connection.once('@disconnect', () => {
			assert(true);
		});

	}, 0);

	setTimeout(() => {

		let url        = URL.parse('http://localhost:13337');
		let connection = HTTP.connect(url);

		connection.once('@connect', () => {

			HTTP.send(connection, HTTP.receive(null, PAYLOADS['PARTIAL']['REQUEST2']), (result) => {
				assert(result, true);
			});

		});

		connection.once('progress', (frame /*, progress */) => {
			assert(frame, HTTP.receive(null, PAYLOADS['PARTIAL']['RESPONSE2']));
		});

		connection.once('@disconnect', () => {
			assert(true);
		});

	}, 200);

	setTimeout(() => {

		let url        = URL.parse('http://localhost:13337');
		let connection = HTTP.connect(url);

		connection.once('@connect', () => {

			HTTP.send(connection, HTTP.receive(null, PAYLOADS['PARTIAL']['REQUEST3']), (result) => {
				assert(result, true);
			});

		});

		connection.once('progress', (frame /*, progress */) => {
			assert(frame, HTTP.receive(null, PAYLOADS['PARTIAL']['RESPONSE3']));
		});

		connection.once('@disconnect', () => {
			assert(true);
		});

	}, 400);

	setTimeout(() => {

		server.close(() => {
			assert(true);
		});

	}, 1000);

});

describe('HTTP.upgrade()', function(assert) {

	// TODO: HTTP.upgrade(tunnel, null); without a handshake packet

});

describe('HTTP.upgrade()/handshake', function(assert) {

	// TODO: HTTP.upgrade(tunnel, url with {headers,payload}); that triggers 'request' event

});


export default finish('stealth/connection/HTTP', {
	internet: true,
	network:  true,
	ports:    [ 80, 13337 ]
});

