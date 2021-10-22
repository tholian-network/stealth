
import { Buffer, isFunction } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { HTTP               } from '../../../stealth/source/packet/HTTP.mjs';



const Connection = function(type) {
	this.type = type;
};

Connection.prototype = {
	[Symbol.toStringTag]: 'Connection'
};



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
	let packet = {
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
	};

	assert(HTTP.decode(null, buffer), packet);

});

describe('HTTP.decode()/GET/Range', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer1 = Buffer.from([
		'GET /path/to/stream.mp4?token=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=0-',
		''
	].join('\r\n'), 'utf8');
	let packet1 = {
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
	};

	let buffer2 = Buffer.from([
		'GET https://example.com/stream.avi HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=0-127',
		''
	].join('\r\n'), 'utf8');
	let packet2 = {
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
	};

	let buffer3 = Buffer.from([
		'GET /path/to/stream HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=128-255',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet3 = {
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
	};

	let buffer4 = Buffer.from([
		'GET /path/to/stream?token=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=256-',
		'',
		'{"submitted":"data"}',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet4 = {
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
	};

	assert(HTTP.decode(null, buffer1), packet1);
	assert(HTTP.decode(null, buffer2), packet2);
	assert(HTTP.decode(null, buffer3), packet3);
	assert(HTTP.decode(null, buffer4), packet4);

});

describe('HTTP.decode()/POST', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'POST /api?param=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Content-Length: 25',
		'',
		'This is some binary data.',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
		headers: {
			'@method':   'POST',
			'@transfer': {
				'encoding': 'identity',
				'length':   25,
				'range':    [ 0, 24 ]
			},
			'@url':             '/api?param=value',
			'accept-encoding':  'identity',
			'content-encoding': 'identity',
			'content-length':   25
		},
		overflow: null,
		payload: Buffer.from('This is some binary data.', 'utf8')
	};

	assert(HTTP.decode(null, buffer), packet);

});

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
	let packet = {
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
	};

	assert(HTTP.decode(null, buffer), packet);

});

describe('HTTP.decode()/301', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'HTTP/1.1 301 Moved Permanently',
		'Location: /browser/index.html',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
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
	};

	assert(HTTP.decode(null, buffer), packet);

});

describe('HTTP.decode()/307', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'HTTP/1.1 307 Temporary Redirect',
		'Location: https://redirector.example.com/temporary.html?param=value',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
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
	};

	assert(HTTP.decode(null, buffer), packet);

});

describe('HTTP.decode()/308', function(assert) {

	assert(isFunction(HTTP.decode), true);

	let buffer = Buffer.from([
		'HTTP/1.1 308 Permanent Redirect',
		'Location: https://images.example.com/whatever.png',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
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
	};

	assert(HTTP.decode(null, buffer), packet);

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
	let packet = {
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
	};

	assert(HTTP.decode(null, buffer), packet);

});

describe('HTTP.decode()/206', function(assert) {
});

describe('HTTP.encode()/GET', function(assert) {

	assert(isFunction(HTTP.encode), true);

	let connection = new Connection('client');

	let buffer = Buffer.from([
		'GET /path/to/resource?param=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Content-Encoding: identity',
		'Content-Length: 20',
		'',
		'{"submitted":"data"}',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
		headers: {
			'@method':          'GET',
			'@url':             '/path/to/resource?param=value',
			'accept-encoding':  'identity',
			'content-encoding': 'identity'
		},
		payload: Buffer.from('{"submitted":"data"}', 'utf8')
	};

	assert(HTTP.encode(connection, packet), buffer);

});

describe('HTTP.encode()/GET/Range', function(assert) {

	assert(isFunction(HTTP.encode), true);

	let connection = new Connection('client');

	let buffer1 = Buffer.from([
		'GET /path/to/stream.mp4?token=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=0-',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet1 = {
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
	};

	let buffer2 = Buffer.from([
		'GET https://example.com/stream.avi HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=0-127',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet2 = {
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
	};

	let buffer3 = Buffer.from([
		'GET /path/to/stream HTTP/1.1',
		'Accept-Encoding: identity',
		'Range: bytes=128-255',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet3 = {
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
	};

	let buffer4 = Buffer.from([
		'GET /path/to/stream?token=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Content-Encoding: identity',
		'Range: bytes=256-512',
		'',
		[
			'The sentence #5 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #6 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #7 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #8 inside the big buffer is exactly 64 bytes long.\n'
		].join(''),
		'',
		''
	].join('\r\n'), 'utf8');
	let packet4 = {
		headers: {
			'@method':   'GET',
			'@transfer': {
				'encoding': 'identity',
				'length':   Infinity,
				'range':    [ 256, Infinity ]
			},
			'@url':             '/path/to/stream?token=value',
			'accept-encoding':  'identity',
			'content-encoding': 'identity'
		},
		overflow: null,
		payload: Buffer.from([
			'The sentence #1 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #2 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #3 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #4 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #5 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #6 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #7 inside the big buffer is exactly 64 bytes long.\n',
			'The sentence #8 inside the big buffer is exactly 64 bytes long.\n'
		].join(''), 'utf8')
	};

	assert(HTTP.encode(connection, packet1), buffer1);
	assert(HTTP.encode(connection, packet2), buffer2);
	assert(HTTP.encode(connection, packet3), buffer3);
	assert(HTTP.encode(connection, packet4), buffer4);

});

describe('HTTP.encode()/POST', function(assert) {

	assert(isFunction(HTTP.encode), true);

	let connection = new Connection('client');

	let buffer = Buffer.from([
		'POST /api?param=value HTTP/1.1',
		'Accept-Encoding: identity',
		'Content-Encoding: identity',
		'Content-Length: 25',
		'',
		'This is some binary data.',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
		headers: {
			'@method':          'POST',
			'@url':             '/api?param=value',
			'accept-encoding':  'identity',
			'content-encoding': 'identity',
			'content-length':   25
		},
		payload: Buffer.from('This is some binary data.', 'utf8')
	};

	assert(HTTP.encode(connection, packet), buffer);

});

describe('HTTP.encode()/404', function(assert) {

	assert(isFunction(HTTP.encode), true);

	let connection = new Connection('server');

	let buffer = Buffer.from([
		'HTTP/1.1 404 Not Found',
		'Content-Encoding: identity',
		'Content-Length: 20',
		'Content-Type: text/plain',
		'',
		'Error 404: Not Found',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
		headers: {
			'@status':          404,
			'content-encoding': 'identity',
			'content-length':   20,
			'content-type':     'text/plain'
		},
		payload: Buffer.from('Error 404: Not Found', 'utf8')
	};

	assert(HTTP.encode(connection, packet), buffer);

});

describe('HTTP.encode()/301', function(assert) {

	assert(isFunction(HTTP.encode), true);

	let connection = new Connection('server');

	let buffer = Buffer.from([
		'HTTP/1.1 301 Moved Permanently',
		'Content-Encoding: identity',
		'Location: /browser/index.html',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
		headers: {
			'@status':          301,
			'content-encoding': 'identity',
			'location':         '/browser/index.html'
		},
		payload: null
	};

	assert(HTTP.encode(connection, packet), buffer);

});

describe('HTTP.encode()/307', function(assert) {

	assert(isFunction(HTTP.encode), true);

	let connection = new Connection('server');

	let buffer = Buffer.from([
		'HTTP/1.1 307 Temporary Redirect',
		'Content-Encoding: identity',
		'Location: https://redirector.example.com/temporary.html?param=value',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
		headers: {
			'@status':          307,
			'content-encoding': 'identity',
			'location':         'https://redirector.example.com/temporary.html?param=value'
		},
		payload: null
	};

	assert(HTTP.encode(connection, packet), buffer);

});

describe('HTTP.encode()/308', function(assert) {

	assert(isFunction(HTTP.encode), true);

	let connection = new Connection('server');

	let buffer = Buffer.from([
		'HTTP/1.1 308 Permanent Redirect',
		'Content-Encoding: identity',
		'Location: https://images.example.com/whatever.png',
		'',
		''
	].join('\r\n'), 'utf8');
	let packet = {
		headers: {
			'@status':          308,
			'content-encoding': 'identity',
			'location':         'https://images.example.com/whatever.png'
		},
		payload: null
	};

	assert(HTTP.encode(connection, packet), buffer);

});

describe('HTTP.encode()/200', function(assert) {
});

describe('HTTP.encode()/206', function(assert) {
});


export default finish('stealth/packet/HTTP', {
	internet: false,
	network:  false,
	ports:    []
});

