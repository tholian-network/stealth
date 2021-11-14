
import { Buffer, isFunction } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { WS                 } from '../../../stealth/source/packet/WS.mjs';



const create_mask = () => {

	let mask = Buffer.alloc(4);

	mask[0] = (Math.random() * 0xff) | 0;
	mask[1] = (Math.random() * 0xff) | 0;
	mask[2] = (Math.random() * 0xff) | 0;
	mask[3] = (Math.random() * 0xff) | 0;

	return mask;

};



describe('WS.decode()/CONTINUE/request', function(assert) {

	assert(isFunction(WS.decode), true);

	let mask   = create_mask();
	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x00,
			128 + 64
		]),
		mask,
		Buffer.from('This sentence inside this utf-8 Buffer is exactly 64 bytes long.', 'utf8').map((value, index) => {
			return value ^ mask[index % mask.length];
		})
	]);
	let packet = {
		headers: {
			'@operator': 0x00,
			'@status':   null,
			'@transfer': {
				'encoding': null,
				'length':   64,
				'range':    [ 0, 63 ]
			},
			'@type': 'request'
		},
		overflow: null,
		payload: Buffer.from('This sentence inside this utf-8 Buffer is exactly 64 bytes long.', 'utf8')
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/CONTINUE/response', function(assert) {

	assert(isFunction(WS.decode), true);

	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x00,
			0   + 64
		]),
		Buffer.from('This sentence inside this utf-8 Buffer is exactly 64 bytes long.', 'utf8')
	]);
	let packet = {
		headers: {
			'@operator': 0x00,
			'@status':   null,
			'@transfer': {
				'encoding': null,
				'length':   64,
				'range':    [ 0, 63 ]
			},
			'@type': 'response'
		},
		overflow: null,
		payload: Buffer.from('This sentence inside this utf-8 Buffer is exactly 64 bytes long.', 'utf8')
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/TEXT/request', function(assert) {

	assert(isFunction(WS.decode), true);

	let mask   = create_mask();
	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x01,
			128 + 64
		]),
		mask,
		Buffer.from('This sentence inside this utf-8 Buffer is exactly 64 bytes long.', 'utf8').map((value, index) => {
			return value ^ mask[index % mask.length];
		})
	]);
	let packet = {
		headers: {
			'@operator': 0x01,
			'@status':   null,
			'@transfer': {
				'encoding': null,
				'length':   64,
				'range':    [ 0, 63 ]
			},
			'@type': 'request'
		},
		overflow: null,
		payload: Buffer.from('This sentence inside this utf-8 Buffer is exactly 64 bytes long.', 'utf8')
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/TEXT/response', function(assert) {

	assert(isFunction(WS.decode), true);

	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x01,
			0   + 64
		]),
		Buffer.from('This sentence inside this utf-8 Buffer is exactly 64 bytes long.', 'utf8')
	]);
	let packet = {
		headers: {
			'@operator': 0x01,
			'@status':   null,
			'@transfer': {
				'encoding': null,
				'length':   64,
				'range':    [ 0, 63 ]
			},
			'@type': 'response'
		},
		overflow: null,
		payload: Buffer.from('This sentence inside this utf-8 Buffer is exactly 64 bytes long.', 'utf8')
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/BINARY/request', function(assert) {

	assert(isFunction(WS.decode), true);

	let mask   = create_mask();
	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x02,
			128 + 32
		]),
		mask,
		Buffer.from([
			1,  2,  3,  4,  5,  6,  7,  8,
			9,  10, 11, 12, 13, 14, 15, 16,
			17, 18, 19, 20, 21, 22, 23, 24,
			25, 26, 27, 28, 29, 30, 31, 32
		]).map((value, index) => {
			return value ^ mask[index % mask.length];
		})
	]);
	let packet = {
		headers: {
			'@operator': 0x02,
			'@status':   null,
			'@transfer': {
				'encoding': null,
				'length':   32,
				'range':    [ 0, 31 ]
			},
			'@type': 'request'
		},
		overflow: null,
		payload: Buffer.from([
			1,  2,  3,  4,  5,  6,  7,  8,
			9,  10, 11, 12, 13, 14, 15, 16,
			17, 18, 19, 20, 21, 22, 23, 24,
			25, 26, 27, 28, 29, 30, 31, 32
		])
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/BINARY/response', function(assert) {

	assert(isFunction(WS.decode), true);

	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x02,
			0   + 32
		]),
		Buffer.from([
			1,  2,  3,  4,  5,  6,  7,  8,
			9,  10, 11, 12, 13, 14, 15, 16,
			17, 18, 19, 20, 21, 22, 23, 24,
			25, 26, 27, 28, 29, 30, 31, 32
		])
	]);
	let packet = {
		headers: {
			'@operator': 0x02,
			'@status':   null,
			'@transfer': {
				'encoding': null,
				'length':   32,
				'range':    [ 0, 31 ]
			},
			'@type': 'response'
		},
		overflow: null,
		payload: Buffer.from([
			1,  2,  3,  4,  5,  6,  7,  8,
			9,  10, 11, 12, 13, 14, 15, 16,
			17, 18, 19, 20, 21, 22, 23, 24,
			25, 26, 27, 28, 29, 30, 31, 32
		])
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/CLOSE/request', function(assert) {

	assert(isFunction(WS.decode), true);

	let mask   = create_mask();
	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x08,
			128 + 0x02
		]),
		mask,
		Buffer.from([
			(1000 >> 8) & 0xff,
			(1000 >> 0) & 0xff
		]).map((value, index) => value ^ mask[index % mask.length])
	]);
	let packet = {
		headers: {
			'@operator': 0x08,
			'@status':   1000,
			'@transfer': {
				'encoding': null,
				'length':   null,
				'range':    [ 0, Infinity ]
			},
			'@type': 'request'
		},
		overflow: null,
		payload: null
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/CLOSE/response', function(assert) {

	assert(isFunction(WS.decode), true);

	let buffer = Buffer.from([
		128 + 0x08,
		0   + 0x02,
		(1000 >> 8) & 0xff,
		(1000 >> 0) & 0xff
	]);
	let packet = {
		headers: {
			'@operator': 0x08,
			'@status':   1000,
			'@transfer': {
				'encoding': null,
				'length':   null,
				'range':    [ 0, Infinity ]
			},
			'@type': 'response'
		},
		overflow: null,
		payload: null
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/ERROR/request', function(assert) {

	assert(isFunction(WS.decode), true);

	let mask   = create_mask();
	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x08,
			128 + 0x02
		]),
		mask,
		Buffer.from([
			(1002 >> 8) & 0xff,
			(1002 >> 0) & 0xff
		]).map((value, index) => value ^ mask[index % mask.length])
	]);
	let packet = {
		headers: {
			'@operator': 0x08,
			'@status':   1002,
			'@transfer': {
				'encoding': null,
				'length':   null,
				'range':    [ 0, Infinity ]
			},
			'@type': 'request'
		},
		overflow: null,
		payload: null
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/ERROR/response', function(assert) {

	assert(isFunction(WS.decode), true);

	let buffer = Buffer.from([
		128 + 0x08,
		0   + 0x02,
		(1002 >> 8) & 0xff,
		(1002 >> 0) & 0xff
	]);
	let packet = {
		headers: {
			'@operator': 0x08,
			'@status':   1002,
			'@transfer': {
				'encoding': null,
				'length':   null,
				'range':    [ 0, Infinity ]
			},
			'@type': 'response'
		},
		overflow: null,
		payload: null
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/PING/request', function(assert) {

	assert(isFunction(WS.decode), true);

	let mask   = create_mask();
	let buffer = Buffer.concat([
		Buffer.from([
			128 + 0x09,
			128 + 0x00
		]),
		mask
	]);
	let packet = {
		headers: {
			'@operator': 0x09,
			'@status':   null,
			'@transfer': {
				'encoding': null,
				'length':   null,
				'range':    [ 0, Infinity ]
			},
			'@type': 'request'
		},
		overflow: null,
		payload: null
	};

	assert(WS.decode(null, buffer), packet);

});

describe('WS.decode()/PONG/response', function(assert) {

	assert(isFunction(WS.decode), true);

	let buffer = Buffer.from([
		128 + 0x0a,
		0   + 0x00
	]);
	let packet = {
		headers: {
			'@operator': 0x0a,
			'@status':   null,
			'@transfer': {
				'encoding': null,
				'length':   null,
				'range':    [ 0, Infinity ]
			},
			'@type': 'response'
		},
		overflow: null,
		payload: null
	};

	assert(WS.decode(null, buffer), packet);

});


export default finish('stealth/packet/WS', {
	internet: false,
	network:  false,
	ports:    []
});

