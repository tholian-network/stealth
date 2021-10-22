
import { Buffer, isFunction } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { SOCKS              } from '../../../stealth/source/packet/SOCKS.mjs';
import { URL                } from '../../../stealth/source/parser/URL.mjs';



const Connection = function(type) {
	this.type = type;
};

Connection.prototype = {
	[Symbol.toStringTag]: 'Connection'
};



describe('SOCKS.decode()/auth/request', function(assert) {

	assert(isFunction(SOCKS.decode), true);

	let connection = new Connection('server');

	let buffer1 = Buffer.from([ 0x05, 0x01, 0x00 ]);
	let packet1 = {
		headers: {
			'@auth': [ 'none' ]
		},
		payload: null
	};

	let buffer2 = Buffer.from([ 0x05, 0x02, 0x00, 0x02 ]);
	let packet2 = {
		headers: {
			'@auth': [ 'none', 'login' ]
		},
		payload: null
	};

	let buffer3 = Buffer.from([ 0x05, 0x03, 0x00, 0x01, 0x02 ]);
	let packet3 = {
		headers: {
			'@auth': [ 'none', 'login' ]
		},
		payload: null
	};

	assert(SOCKS.decode(connection, buffer1), packet1);
	assert(SOCKS.decode(connection, buffer2), packet2);
	assert(SOCKS.decode(connection, buffer3), packet3);

});

describe('SOCKS.decode()/auth/success', function(assert) {

	assert(isFunction(SOCKS.decode), true);

	let connection = new Connection('client');

	let buffer1 = Buffer.from([ 0x05, 0x00 ]);
	let packet1 = {
		headers: {
			'@auth': 'none'
		},
		payload: null
	};

	let buffer2 = Buffer.from([ 0x05, 0x01 ]); // GSSAPI isn't supported
	let packet2 = {
		headers: {
			'@auth': 'error'
		},
		payload: null
	};

	let buffer3 = Buffer.from([ 0x05, 0x02 ]);
	let packet3 = {
		headers: {
			'@auth': 'login'
		},
		payload: null
	};

	assert(SOCKS.decode(connection, buffer1), packet1);
	assert(SOCKS.decode(connection, buffer2), packet2);
	assert(SOCKS.decode(connection, buffer3), packet3);

});

describe('SOCKS.decode()/auth/error', function(assert) {

	assert(isFunction(SOCKS.decode), true);

	let connection = new Connection('client');

	let buffer1 = Buffer.from([ 0x05, 0x03 ]); // IANA assigned start
	let buffer2 = Buffer.from([ 0x05, 0x7f ]); // IANA assigned end
	let buffer3 = Buffer.from([ 0x05, 0x80 ]); // RESERVED start
	let buffer4 = Buffer.from([ 0x05, 0xfe ]); // RESERVED end
	let buffer5 = Buffer.from([ 0x05, 0xff ]); // No acceptable methods
	let packet  = {
		headers: {
			'@auth': 'error'
		},
		payload: null
	};

	assert(SOCKS.decode(connection, buffer1), packet);
	assert(SOCKS.decode(connection, buffer2), packet);
	assert(SOCKS.decode(connection, buffer3), packet);
	assert(SOCKS.decode(connection, buffer4), packet);
	assert(SOCKS.decode(connection, buffer5), packet);

});

describe('SOCKS.decode()/connect/request', function(assert) {

	assert(isFunction(SOCKS.decode), true);

	let connection = new Connection('server');

	let buffer1 = Buffer.from([
		0x05, 0x01, 0x00, 0x01,
		192, 168, 0, 1,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet1 = {
		headers: {
			'@method': 'connect'
		},
		payload: URL.parse('192.168.0.1:13337')
	};

	let buffer2 = Buffer.from([
		0x05, 0x01, 0x00, 0x03,
		11, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet2 = {
		headers: {
			'@method': 'connect'
		},
		payload: URL.parse('example.com:13337')
	};

	let buffer3 = Buffer.from([
		0x05, 0x01, 0x00, 0x04,
		0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00, 0x01,
		0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19, 0x46,
		65432 >>> 8, 65432 & 0xff
	]);
	let packet3 = {
		headers: {
			'@method': 'connect'
		},
		payload: URL.parse('[2606:2800:0220:0001:0248:1893:25c8:1946]:65432')
	};

	assert(SOCKS.decode(connection, buffer1), packet1);
	assert(SOCKS.decode(connection, buffer2), packet2);
	assert(SOCKS.decode(connection, buffer3), packet3);

});

describe('SOCKS.decode()/bind/request', function(assert) {

	assert(isFunction(SOCKS.decode), true);

	let connection = new Connection('server');

	let buffer1 = Buffer.from([
		0x05, 0x02, 0x00, 0x01,
		192, 168, 0, 1,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet1 = {
		headers: {
			'@method': 'bind'
		},
		payload: URL.parse('192.168.0.1:13337')
	};

	let buffer2 = Buffer.from([
		0x05, 0x02, 0x00, 0x03,
		11, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet2 = {
		headers: {
			'@method': 'bind'
		},
		payload: URL.parse('example.com:13337')
	};

	let buffer3 = Buffer.from([
		0x05, 0x02, 0x00, 0x04,
		0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00, 0x01,
		0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19, 0x46,
		65432 >>> 8, 65432 & 0xff
	]);
	let packet3 = {
		headers: {
			'@method': 'bind'
		},
		payload: URL.parse('[2606:2800:0220:0001:0248:1893:25c8:1946]:65432')
	};

	assert(SOCKS.decode(connection, buffer1), packet1);
	assert(SOCKS.decode(connection, buffer2), packet2);
	assert(SOCKS.decode(connection, buffer3), packet3);

});

describe('SOCKS.decode()/associate/request', function(assert) {

	assert(isFunction(SOCKS.decode), true);

	let connection = new Connection('server');

	let buffer1 = Buffer.from([
		0x05, 0x03, 0x00, 0x01,
		192, 168, 0, 1,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet1 = {
		headers: {
			'@method': 'associate'
		},
		payload: URL.parse('192.168.0.1:13337')
	};

	let buffer2 = Buffer.from([
		0x05, 0x03, 0x00, 0x03,
		11, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet2 = {
		headers: {
			'@method': 'associate'
		},
		payload: URL.parse('example.com:13337')
	};

	let buffer3 = Buffer.from([
		0x05, 0x03, 0x00, 0x04,
		0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00, 0x01,
		0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19, 0x46,
		65432 >>> 8, 65432 & 0xff
	]);
	let packet3 = {
		headers: {
			'@method': 'associate'
		},
		payload: URL.parse('[2606:2800:0220:0001:0248:1893:25c8:1946]:65432')
	};

	assert(SOCKS.decode(connection, buffer1), packet1);
	assert(SOCKS.decode(connection, buffer2), packet2);
	assert(SOCKS.decode(connection, buffer3), packet3);

});

describe('SOCKS.decode()/status/success', function(assert) {

	assert(isFunction(SOCKS.decode), true);

	let connection = new Connection('client');

	let buffer1 = Buffer.from([
		0x05, 0x00, 0x00, 0x01,
		192, 13, 0, 254,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet1 = {
		headers: {
			'@status': 0x00
		},
		payload: URL.parse('192.13.0.254:13337')
	};

	let buffer2 = Buffer.from([
		0x05, 0x00, 0x00, 0x03,
		11, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet2 = {
		headers: {
			'@status': 0x00
		},
		payload: URL.parse('example.com:13337')
	};

	let buffer3 = Buffer.from([
		0x05, 0x00, 0x00, 0x04,
		0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00, 0x01,
		0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19, 0x46,
		65432 >>> 8, 65432 & 0xff
	]);
	let packet3 = {
		headers: {
			'@status': 0x00
		},
		payload: URL.parse('[2606:2800:0220:0001:0248:1893:25c8:1946]:65432')
	};

	assert(SOCKS.decode(connection, buffer1), packet1);
	assert(SOCKS.decode(connection, buffer2), packet2);
	assert(SOCKS.decode(connection, buffer3), packet3);

});

describe('SOCKS.decode()/status/error', function(assert) {

	let connection = new Connection('client');

	let error1  = Buffer.from([ 0x05, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet1 = {
		headers: {
			'@status': 0x01,
			'@error':  { type: 'connection', cause: 'socket-stability' }
		},
		payload: null
	};

	let error2  = Buffer.from([ 0x05, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet2 = {
		headers: {
			'@status': 0x02,
			'@error':  { type: 'block' }
		},
		payload: null
	};

	let error3  = Buffer.from([ 0x05, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet3 = {
		headers: {
			'@status': 0x03,
			'@error':  { type: 'connection', cause: 'socket-stability' }
		},
		payload: null
	};

	let error4  = Buffer.from([ 0x05, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet4 = {
		headers: {
			'@status': 0x04,
			'@error':  { type: 'host' }
		},
		payload: null
	};

	let error5  = Buffer.from([ 0x05, 0x05, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet5 = {
		headers: {
			'@status': 0x05,
			'@error':  { type: 'connection' }
		},
		payload: null
	};

	let error6  = Buffer.from([ 0x05, 0x06, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet6 = {
		headers: {
			'@status': 0x06,
			'@error':  { type: 'connection', cause: 'socket-stability' }
		},
		payload: null
	};

	let error7  = Buffer.from([ 0x05, 0x07, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet7 = {
		headers: {
			'@status': 0x07,
			'@error':  { type: 'connection', cause: 'headers' }
		},
		payload: null
	};

	let error8  = Buffer.from([ 0x05, 0x08, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet8 = {
		headers: {
			'@status': 0x08,
			'@error':  { type: 'connection', cause: 'payload' }
		},
		payload: null
	};

	assert(SOCKS.decode(connection, error1), packet1);
	assert(SOCKS.decode(connection, error2), packet2);
	assert(SOCKS.decode(connection, error3), packet3);
	assert(SOCKS.decode(connection, error4), packet4);
	assert(SOCKS.decode(connection, error5), packet5);
	assert(SOCKS.decode(connection, error6), packet6);
	assert(SOCKS.decode(connection, error7), packet7);
	assert(SOCKS.decode(connection, error8), packet8);

});

describe('SOCKS.encode()/auth/request', function(assert) {

	assert(isFunction(SOCKS.encode), true);

	let connection = new Connection('client');

	let buffer1 = Buffer.from([ 0x05, 0x01, 0x00 ]);
	let packet1 = {
		headers: {
			'@auth': [ 'none' ]
		},
		payload: null
	};

	let buffer2 = Buffer.from([ 0x05, 0x02, 0x00, 0x02 ]);
	let packet2 = {
		headers: {
			'@auth': [ 'none', 'login' ]
		},
		payload: null
	};

	assert(SOCKS.encode(connection, packet1), buffer1);
	assert(SOCKS.encode(connection, packet2), buffer2);

});

describe('SOCKS.encode()/auth/success', function(assert) {

	assert(isFunction(SOCKS.encode), true);

	let connection = new Connection('server');

	let buffer1 = Buffer.from([ 0x05, 0x00 ]);
	let packet1 = {
		headers: {
			'@auth': 'none'
		},
		payload: null
	};

	let buffer2 = Buffer.from([ 0x05, 0x02 ]);
	let packet2 = {
		headers: {
			'@auth': 'login'
		},
		payload: null
	};

	assert(SOCKS.encode(connection, packet1), buffer1);
	assert(SOCKS.encode(connection, packet2), buffer2);

});

describe('SOCKS.encode()/auth/error', function(assert) {

	assert(isFunction(SOCKS.encode), true);

	let connection = new Connection('server');

	let buffer1 = Buffer.from([ 0x05, 0xff ]);
	let packet1 = {
		headers: {
			'@auth': 'error'
		},
		payload: null
	};

	assert(SOCKS.encode(connection, packet1), buffer1);

});

describe('SOCKS.encode()/connect/request', function(assert) {

	assert(isFunction(SOCKS.encode), true);

	let connection = new Connection('client');

	let buffer1 = Buffer.from([
		0x05, 0x01, 0x00, 0x01,
		192, 168, 0, 1,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet1 = {
		headers: {
			'@method': 'connect'
		},
		payload: URL.parse('192.168.0.1:13337')
	};

	let buffer2 = Buffer.from([
		0x05, 0x01, 0x00, 0x03,
		11, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet2 = {
		headers: {
			'@method': 'connect'
		},
		payload: URL.parse('example.com:13337')
	};

	let buffer3 = Buffer.from([
		0x05, 0x01, 0x00, 0x04,
		0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00, 0x01,
		0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19, 0x46,
		65432 >>> 8, 65432 & 0xff
	]);
	let packet3 = {
		headers: {
			'@method': 'connect'
		},
		payload: URL.parse('[2606:2800:0220:0001:0248:1893:25c8:1946]:65432')
	};

	assert(SOCKS.encode(connection, packet1), buffer1);
	assert(SOCKS.encode(connection, packet2), buffer2);
	assert(SOCKS.encode(connection, packet3), buffer3);

});

describe('SOCKS.encode()/bind/request', function(assert) {

	assert(isFunction(SOCKS.encode), true);

	let connection = new Connection('client');

	let buffer1 = Buffer.from([
		0x05, 0x02, 0x00, 0x01,
		192, 168, 0, 1,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet1 = {
		headers: {
			'@method': 'bind'
		},
		payload: URL.parse('192.168.0.1:13337')
	};

	let buffer2 = Buffer.from([
		0x05, 0x02, 0x00, 0x03,
		11, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet2 = {
		headers: {
			'@method': 'bind'
		},
		payload: URL.parse('example.com:13337')
	};

	let buffer3 = Buffer.from([
		0x05, 0x02, 0x00, 0x04,
		0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00, 0x01,
		0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19, 0x46,
		65432 >>> 8, 65432 & 0xff
	]);
	let packet3 = {
		headers: {
			'@method': 'bind'
		},
		payload: URL.parse('[2606:2800:0220:0001:0248:1893:25c8:1946]:65432')
	};

	assert(SOCKS.encode(connection, packet1), buffer1);
	assert(SOCKS.encode(connection, packet2), buffer2);
	assert(SOCKS.encode(connection, packet3), buffer3);

});

describe('SOCKS.encode()/associate/request', function(assert) {

	assert(isFunction(SOCKS.encode), true);

	let connection = new Connection('client');

	let buffer1 = Buffer.from([
		0x05, 0x03, 0x00, 0x01,
		192, 168, 0, 1,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet1 = {
		headers: {
			'@method': 'associate'
		},
		payload: URL.parse('192.168.0.1:13337')
	};

	let buffer2 = Buffer.from([
		0x05, 0x03, 0x00, 0x03,
		11, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet2 = {
		headers: {
			'@method': 'associate'
		},
		payload: URL.parse('example.com:13337')
	};

	let buffer3 = Buffer.from([
		0x05, 0x03, 0x00, 0x04,
		0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00, 0x01,
		0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19, 0x46,
		65432 >>> 8, 65432 & 0xff
	]);
	let packet3 = {
		headers: {
			'@method': 'associate'
		},
		payload: URL.parse('[2606:2800:0220:0001:0248:1893:25c8:1946]:65432')
	};

	assert(SOCKS.encode(connection, packet1), buffer1);
	assert(SOCKS.encode(connection, packet2), buffer2);
	assert(SOCKS.encode(connection, packet3), buffer3);

});

describe('SOCKS.encode()/status/success', function(assert) {

	assert(isFunction(SOCKS.encode), true);

	let connection = new Connection('server');

	let buffer1 = Buffer.from([
		0x05, 0x00, 0x00, 0x01,
		192, 13, 0, 254,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet1 = {
		headers: {
			'@status': 0x00
		},
		payload: URL.parse('192.13.0.254:13337')
	};

	let buffer2 = Buffer.from([
		0x05, 0x00, 0x00, 0x03,
		11, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
		13337 >>> 8, 13337 & 0xff
	]);
	let packet2 = {
		headers: {
			'@status': 0x00
		},
		payload: URL.parse('example.com:13337')
	};

	let buffer3 = Buffer.from([
		0x05, 0x00, 0x00, 0x04,
		0x26, 0x06, 0x28, 0x00, 0x02, 0x20, 0x00, 0x01,
		0x02, 0x48, 0x18, 0x93, 0x25, 0xc8, 0x19, 0x46,
		65432 >>> 8, 65432 & 0xff
	]);
	let packet3 = {
		headers: {
			'@status': 0x00
		},
		payload: URL.parse('[2606:2800:0220:0001:0248:1893:25c8:1946]:65432')
	};

	assert(SOCKS.encode(connection, packet1), buffer1);
	assert(SOCKS.encode(connection, packet2), buffer2);
	assert(SOCKS.encode(connection, packet3), buffer3);

});

describe('SOCKS.encode()/status/error', function(assert) {

	assert(isFunction(SOCKS.encode), true);

	let connection = new Connection('server');

	let error1  = Buffer.from([ 0x05, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet1 = {
		headers: {
			'@status': 0x01
		},
		payload: null
	};

	let error2  = Buffer.from([ 0x05, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet2 = {
		headers: {
			'@status': 0x02
		},
		payload: null
	};

	let error3  = Buffer.from([ 0x05, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet3 = {
		headers: {
			'@status': 0x03
		},
		payload: null
	};

	let error4  = Buffer.from([ 0x05, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet4 = {
		headers: {
			'@status': 0x04
		},
		payload: null
	};

	let error5  = Buffer.from([ 0x05, 0x05, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet5 = {
		headers: {
			'@status': 0x05
		},
		payload: null
	};

	let error6  = Buffer.from([ 0x05, 0x06, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet6 = {
		headers: {
			'@status': 0x06
		},
		payload: null
	};

	let error7  = Buffer.from([ 0x05, 0x07, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet7 = {
		headers: {
			'@status': 0x07
		},
		payload: null
	};

	let error8  = Buffer.from([ 0x05, 0x08, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
	let packet8 = {
		headers: {
			'@status': 0x08
		},
		payload: null
	};

	assert(SOCKS.encode(connection, packet1), error1);
	assert(SOCKS.encode(connection, packet2), error2);
	assert(SOCKS.encode(connection, packet3), error3);
	assert(SOCKS.encode(connection, packet4), error4);
	assert(SOCKS.encode(connection, packet5), error5);
	assert(SOCKS.encode(connection, packet6), error6);
	assert(SOCKS.encode(connection, packet7), error7);
	assert(SOCKS.encode(connection, packet8), error8);

});


export default finish('stealth/packet/SOCKS', {
	internet: false,
	network:  false,
	ports:    []
});

