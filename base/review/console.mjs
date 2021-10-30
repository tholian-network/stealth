
import { describe, finish } from '../../covert/index.mjs';
import { console          } from '../source/node/console.mjs';



describe('console.clear()', function(assert, _console) {

	assert(typeof console.clear,  'function');
	assert(typeof _console.clear, 'function');

	console.clear('foo');
	assert(true);

	_console.clear('bar');
	assert(true);

});

describe('console.blink()', function(assert, _console) {

	assert(typeof console.blink,  'function');
	assert(typeof _console.blink, 'function');

	console.blink('foo');
	assert(true);

	_console.blink('bar');
	assert(true);

});

describe('console.diff()', function(assert, _console) {

	assert(typeof console.diff,  'function');
	assert(typeof _console.diff, 'function');

});

describe('console.diff()/Array', function(assert, _console) {

	_console.diff([ 1, 3, 3, 7 ], [ 1, 2, 3, 5 ]);

	assert(true);

});

describe('console.diff()/Boolean', function(assert, _console) {

	_console.diff(true, false);
	_console.diff(false, true);

	assert(true);

});

describe('console.diff()/Buffer', function(assert, _console) {

	_console.diff(Buffer.from([
		0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
		0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
	]), Buffer.from([
		0x00, 0x01, 0x02, 0x03, 0x04, 0x08, 0x06, 0x07,
		0x08, 0x09, 0x02, 0x11, 0x12, 0x13, 0x14, 0x15
	]));

	assert(true);

});

describe('console.diff()/Matrix', function(assert, _console) {

	_console.diff(Array.from([
		0, 1, 2, 4,
		4, 5, 7, 7,
		8, 8, 10,11,
		11,13,14,15
	]), Array.from([
		0, 1, 2, 3,
		4, 5, 6, 7,
		8, 9, 10,11,
		12,13,14,15
	]));

	assert(true);

});

describe('console.diff()/Number', function(assert, _console) {

	_console.diff(13337, 13237);
	_console.diff(13.37, 13.38);

	assert(true);

});

describe('console.diff()/Object', function(assert, _console) {

	_console.diff({
		'array':   Array.from([
			[ 1, 3, 3, 7 ],
			undefined,
			null,
			true,
			13337,
			13.37,
			{ foo: 'bar' },
			'qux',
		]),
		'boolean': true,
		'buffer': Buffer.from([
			0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
			0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
		]),
		'matrix': Array.from([
			0, 1, 2, 3,
			4, 5, 6, 7,
			8, 9, 10,11,
			12,13,14,15
		]),
		'number': 13.37,
		'object': { 'foo': 'bar' },
		'string': 'foo bar qux',
		'uint8array': Uint8Array.from([
			0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
			0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
		])
	}, {
		'array':   Array.from([
			[ 1, 3, 5, 7 ],
			null,
			undefined,
			false,
			13237,
			13.38,
			{ foo: 'qux' },
			'doo',
		]),
		'boolean': false,
		'buffer': Buffer.from([
			0x00, 0x01, 0x02, 0x03, 0x04, 0x08, 0x06, 0x07,
			0x08, 0x09, 0x02, 0x11, 0x12, 0x13, 0x14, 0x15
		]),
		'matrix': Array.from([
			0, 1, 2, 4,
			4, 5, 5, 7,
			8, 8, 10,11,
			11,13,14,15
		]),
		'number': 13.38,
		'object': { 'qux': 'bar' },
		'string': 'foo doo qux',
		'uint8array': Uint8Array.from([
			0x00, 0x01, 0x02, 0x03, 0x04, 0x08, 0x06, 0x07,
			0x08, 0x09, 0x02, 0x11, 0x12, 0x13, 0x14, 0x15
		])
	});

	assert(true);

});

describe('console.diff()/String', function(assert, _console) {

	_console.diff('foo bar qux', 'foo bar doo');
	_console.diff('foo bar qux', 'foo doo qux');
	_console.diff('foo bar qux', 'doo bar qux');

	assert(true);

});

describe('console.diff()/Uint8Array', function(assert, _console) {

	_console.diff(Uint8Array.from([
		0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
		0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
	]), Uint8Array.from([
		0x00, 0x01, 0x02, 0x03, 0x04, 0x08, 0x06, 0x07,
		0x08, 0x09, 0x02, 0x11, 0x12, 0x13, 0x14, 0x15
	]));

	assert(true);

});

describe('console.debug()', function(assert, _console) {

	assert(typeof console.debug,  'function');
	assert(typeof _console.debug, 'function');

	console.debug('foo');
	assert(true);

});

describe('console.error()', function(assert, _console) {

	assert(typeof console.error,  'function');
	assert(typeof _console.error, 'function');

	console.error('foo');
	assert(true);

	_console.error('bar');
	assert(true);

});

describe('console.info()', function(assert, _console) {

	assert(typeof console.info,  'function');
	assert(typeof _console.info, 'function');

	console.info('foo');
	assert(true);

	_console.info('bar');
	assert(true);

});

describe('console.log()', function(assert, _console) {

	assert(typeof console.log,  'function');
	assert(typeof _console.log, 'function');

	console.log('foo');
	assert(true);

	_console.log('bar');
	assert(true);

});

describe('console.log()/Array', function(assert, _console) {

	_console.log(Array.from([
		[ 1, 3, 3, 7 ],
		undefined,
		null,
		true,
		13337,
		13.37,
		{ foo: 'bar' },
		'qux',
		Uint8Array.from([
			0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
			0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
		])
	]));

	assert(true);

});

describe('console.log()/Boolean', function(assert, _console) {

	_console.log(true);
	_console.log(false);

	assert(true);

});

describe('console.log()/Buffer', function(assert, _console) {

	_console.log(Buffer.from([
		0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
		0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
	]));

	_console.log(Buffer.from('This is yet another long sentence in a sea of words.', 'utf8'));

	assert(true);

});

describe('console.log()/Matrix', function(assert, _console) {

	_console.log(Array.from([
		0, 1, 2, 3,
		4, 5, 6, 7,
		8, 9, 10,11,
		12,13,14,15
	]));

	assert(true);

});

describe('console.log()/Number', function(assert, _console) {

	_console.log(13337);
	_console.log(13.37);

	assert(true);

});

describe('console.log()/Object', function(assert, _console) {

	_console.log({
		'array':   Array.from([
			[ 1, 3, 3, 7 ],
			undefined,
			null,
			true,
			13337,
			13.37,
			{ foo: 'bar' },
			'qux',
		]),
		'boolean': true,
		'buffer': Buffer.from([
			0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
			0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
		]),
		'matrix': Array.from([
			0, 1, 2, 3,
			4, 5, 6, 7,
			8, 9, 10,11,
			12,13,14,15
		]),
		'number': 13.37,
		'object': { foo: 'bar' },
		'string': 'foo bar qux',
		'uint8': Uint8Array.from([
			0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
			0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
		])
	});

	assert(true);

});

describe('console.log()/String', function(assert, _console) {

	_console.log('foo bar qux');

	assert(true);

});

describe('console.log()/Uint8Array', function(assert, _console) {

	_console.log(Uint8Array.from([
		0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
		0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
	]));

	assert(true);

});

describe('console.warn()', function(assert, _console) {

	assert(typeof console.warn,  'function');
	assert(typeof _console.warn, 'function');

	console.warn('foo');
	assert(true);

	_console.warn('bar');
	assert(true);

});


export default finish('base/console', {
	internet: false,
	network:  false
});

