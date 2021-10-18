
import { Buffer, isArray, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish                                } from '../../../covert/index.mjs';
import { HTTP                                            } from '../../../stealth/source/packet/HTTP.mjs';
import { IP                                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                                             } from '../../../stealth/source/parser/URL.mjs';



describe('HTTP.decode()/GET', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'GET /path/to/resource?param=value HTTP/1.1',
		'Accept-Encoding: identity',
		'',
		'{"submitted":"data"}',
		'',
		''
	].join('\r\n'), 'utf8');

	assert(HTTP.decode(null, buffer), {
		headers: {
			'@method':   'GET',
			'@transfer': {
				'encoding': 'identity',
				'length':   20,
				'range':    [ 0, 19 ]
			},
			'@url':             '/path/to/resource?param=value',
			'accept-encoding':  'identity',
			'content-encoding': 'identity',
			'content-length':   20
		},
		overflow: null,
		payload: Buffer.from('{"submitted":"data"}', 'utf8')
	});

});

describe('HTTP.decode()/GET/Range', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer1 = Buffer.from([
		'GET /path/to/stream.mp4?token=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=0-',
		''
	].join('\r\n'), 'utf8');

	let buffer2 = Buffer.from([
		'GET https://example.com/stream.avi HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=0-127',
		''
	].join('\r\n'), 'utf8');

	let buffer3 = Buffer.from([
		'GET /path/to/stream HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=128-255',
		''
	].join('\r\n'), 'utf8');

	let buffer4 = Buffer.from([
		'GET /path/to/stream?token=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=256-',
		'',
		'{"submitted":"data"}',
		'',
		''
	].join('\r\n'), 'utf8');

	assert(HTTP.decode(null, buffer1), {
		headers: {
			'@method':   'GET',
			'@transfer': {
				'encoding': null,
				'length':   Infinity,
				'range':    [ 0, Infinity ]
			},
			'@url':            '/path/to/stream.mp4?token=value',
			'accept-encoding': 'identity',
			'range':           'bytes=0-'
		},
		overflow: null,
		payload: null
	});

	assert(HTTP.decode(null, buffer2), {
		headers: {
			'@method':   'GET',
			'@transfer': {
				'encoding': null,
				'length':   Infinity,
				'range':    [ 0, 127 ]
			},
			'@url':            'https://example.com/stream.avi',
			'accept-encoding': 'identity',
			'range':           'bytes=0-127'
		},
		overflow: null,
		payload: null
	});

	assert(HTTP.decode(null, buffer3), {
		headers: {
			'@method':   'GET',
			'@transfer': {
				'encoding': null,
				'length':   Infinity,
				'range':    [ 128, 255 ]
			},
			'@url':            '/path/to/stream',
			'accept-encoding': 'identity',
			'range':           'bytes=128-255'
		},
		overflow: null,
		payload: null
	});

	assert(HTTP.decode(null, buffer4), {
		headers: {
			'@method':   'GET',
			'@transfer': {
				'encoding': 'identity',
				'length':   Infinity,
				'range':    [ 256, Infinity ]
			},
			'@url':             '/path/to/stream?token=value',
			'accept-encoding':  'identity',
			'content-encoding': 'identity',
			'range':            'bytes=256-'
		},
		overflow: null,
		payload: Buffer.from('{"submitted":"data"}', 'utf8')
	});

});

// TODO: POST, UPDATE, DELETE etc

describe('HTTP.decode()/404', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'HTTP/1.1 404 Not Found',
		'Content-Encoding: identity',
		'Content-Length: 20',
		'Content-Type: text/plain',
		'',
		'Error 404: Not Found'
	].join('\r\n'), 'utf8');

	assert(HTTP.decode(null, buffer), {
		headers: {
			'@status':   404,
			'@transfer': {
				'encoding': 'identity',
				'length':   20,
				'range':    [ 0, 19 ]
			},
			'content-encoding': 'identity',
			'content-length':   20,
			'content-type':     'text/plain'
		},
		overflow: null,
		payload: Buffer.from('Error 404: Not Found', 'utf8')
	});

});

describe('HTTP.decode()/301', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'HTTP/1.1 301 Moved Permanently',
		'Location: /browser/index.html',
		'',
		''
	].join('\r\n'), 'utf8');

	assert(HTTP.decode(null, buffer), {
		headers: {
			'@status':   301,
			'@transfer': {
				'encoding': 'identity',
				'length':   Infinity,
				'range':    [ 0, Infinity ]
			},
			'content-encoding': 'identity',
			'location':         '/browser/index.html'
		},
		overflow: null,
		payload: Buffer.from('', 'utf8')
	});

});

describe('HTTP.decode()/307', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'HTTP/1.1 307 Temporary Redirect',
		'Location: https://redirector.example.com/temporary.html?param=value',
		'',
		''
	].join('\r\n'), 'utf8');

	assert(HTTP.decode(null, buffer), {
		headers: {
			'@status':   307,
			'@transfer': {
				'encoding': 'identity',
				'length':   Infinity,
				'range':    [ 0, Infinity ]
			},
			'content-encoding': 'identity',
			'location':         'https://redirector.example.com/temporary.html?param=value'
		},
		overflow: null,
		payload: Buffer.from('', 'utf8')
	});

});

describe('HTTP.decode()/308', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'HTTP/1.1 308 Permanent Redirect',
		'Location: https://images.example.com/whatever.png',
		'',
		''
	].join('\r\n'), 'utf8');

	assert(HTTP.decode(null, buffer), {
		headers: {
			'@status':   308,
			'@transfer': {
				'encoding': 'identity',
				'length':   Infinity,
				'range':    [ 0, Infinity ]
			},
			'content-encoding': 'identity',
			'location':         'https://images.example.com/whatever.png'
		},
		overflow: null,
		payload: Buffer.from('', 'utf8')
	});

});

describe('HTTP.decode()/200', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
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
	].join('\r\n'), 'utf8');

	assert(HTTP.decode(null, buffer), {
		headers: {
			'@status':   200,
			'@transfer': {
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
		overflow: null,
		payload: Buffer.from('<!doctype html>\n<html>\n<title>Example</title>\n</html>', 'utf8')
	});

});


export default finish('stealth/packet/HTTP', {
	internet: false,
	network:  false,
	ports:    []
});

