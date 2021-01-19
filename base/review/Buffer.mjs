
import { describe, finish } from '../../covert/index.mjs';
import { Buffer, isBuffer } from '../source/browser/Buffer.mjs';

// Uncomment to compare with node.js Buffer
// import { Buffer } from 'buffer'; const isBuffer = Buffer.isBuffer;



describe('new Buffer()', function(assert) {

	let buffer1 = new Buffer('foo bar', 'utf8');
	let buffer2 = new Buffer('6578616d706c65', 'hex');
	let buffer3 = new Buffer(5);
	let buffer4 = new Buffer(Buffer.from('example', 'utf8'));

	assert(buffer1.length, 7);
	assert(buffer2.length, 7);
	assert(buffer3.length, 5);
	assert(buffer4.length, 7);

	assert(buffer1.toString('utf8'), 'foo bar');
	assert(buffer2.toString('utf8'), 'example');
	assert(buffer3.toString('utf8'), '\u0000\u0000\u0000\u0000\u0000');
	assert(buffer4.toString('utf8'), 'example');

});

describe('Buffer.alloc()', function(assert) {

	let buffer1 = Buffer.alloc(21, 'example', 'utf8');
	let buffer2 = Buffer.alloc(14, Buffer.from('example', 'utf8'));
	let buffer3 = Buffer.alloc(7,  'example', 'utf8');
	let buffer4 = Buffer.alloc(13, 37);
	let buffer5 = Buffer.alloc(20, null);

	assert(buffer1.length, 21);
	assert(buffer2.length, 14);
	assert(buffer3.length,  7);
	assert(buffer4.length, 13);
	assert(buffer5.length, 20);

	assert(buffer1.toString('hex'), '6578616d706c656578616d706c656578616d706c65');
	assert(buffer2.toString('hex'), '6578616d706c656578616d706c65');
	assert(buffer3.toString('hex'), '6578616d706c65');
	assert(buffer4.toString('hex'), '25252525252525252525252525');
	assert(buffer5.toString('hex'), '0000000000000000000000000000000000000000');

});

describe('Buffer.byteLength()', function(assert) {

	let buffer1 = Buffer.from('example', 'utf8');

	assert(Buffer.byteLength('example', 'utf8'),                     7);
	assert(Buffer.byteLength(buffer1.toString('base64'), 'base64'),  7);
	assert(Buffer.byteLength(buffer1.toString('binary'), 'binary'),  7);
	assert(Buffer.byteLength('6578616d706c65', 'hex'),               7);
	assert(Buffer.byteLength('6578616d706c656578616d706c65', 'hex'), 14);

});

describe('Buffer.compare()', function(assert) {

	let buffer1 = Buffer.from('foo bar qux', 'utf8');
	let buffer2 = Buffer.from('foo bar foo', 'utf8');

	assert(Buffer.compare(buffer1, buffer2),  1);
	assert(Buffer.compare(buffer2, buffer1), -1);

});

describe('Buffer.concat()', function(assert) {

	let buffer1 = null;
	try {
		buffer1 = Buffer.concat(null, 13);
	} catch (err) {
		buffer1 = null;
		assert(err instanceof TypeError);
	}

	let buffer2 = Buffer.concat([
		Buffer.from('example.com', 'utf8'),
		Buffer.from('6578616d706c652e636f6d', 'hex')
	]);

	assert(buffer1, null);

	assert(buffer2.length,           22);
	assert(buffer2.toString('utf8'), 'example.comexample.com');

});

describe('Buffer.from()', function(assert) {

	let buffer1 = Buffer.from(new Uint8Array([ 1, 3, 3, 7 ]));
	let buffer2 = Buffer.from(Buffer.from('example.com'));
	let buffer3 = Buffer.from(new Array(1,3,3,7));
	let buffer4 = Buffer.from('example.com', 'utf8');
	let buffer5 = Buffer.from('6578616d706c652e636f6d', 'hex');

	assert(buffer1[0], 1);
	assert(buffer1[1], 3);
	assert(buffer1[2], 3);
	assert(buffer1[3], 7);

	assert(buffer3[0], 1);
	assert(buffer3[1], 3);
	assert(buffer3[2], 3);
	assert(buffer3[3], 7);

	assert(buffer1.toString('hex'), '01030307');
	assert(buffer2.toString('hex'), '6578616d706c652e636f6d');
	assert(buffer3.toString('hex'), '01030307');
	assert(buffer4.toString('hex'), '6578616d706c652e636f6d');
	assert(buffer5.toString('hex'), '6578616d706c652e636f6d');

});

describe('Buffer.isBuffer()', function(assert) {

	let buffer1 = Buffer.from(new Uint8Array(1,3,3,7));
	let buffer2 = Buffer.from(Buffer.from('example.com'));
	let buffer3 = Buffer.from(new Array(1,3,3,7));
	let buffer4 = Buffer.from('example.com', 'utf8');
	let buffer5 = Buffer.from('6578616d706c652e636f6d', 'hex');
	let buffer6 = null;
	let buffer7 = [];
	let buffer8 = {};

	assert(typeof Buffer.isBuffer, 'function');

	assert(Buffer.isBuffer(buffer1), true);
	assert(Buffer.isBuffer(buffer2), true);
	assert(Buffer.isBuffer(buffer3), true);
	assert(Buffer.isBuffer(buffer4), true);
	assert(Buffer.isBuffer(buffer5), true);
	assert(Buffer.isBuffer(buffer6), false);
	assert(Buffer.isBuffer(buffer7), false);
	assert(Buffer.isBuffer(buffer8), false);

});

describe('isBuffer()', function(assert) {

	let buffer1 = Buffer.from(new Uint8Array(1,3,3,7));
	let buffer2 = Buffer.from(Buffer.from('example.com'));
	let buffer3 = Buffer.from(new Array(1,3,3,7));
	let buffer4 = Buffer.from('example.com', 'utf8');
	let buffer5 = Buffer.from('6578616d706c652e636f6d', 'hex');
	let buffer6 = null;
	let buffer7 = [];
	let buffer8 = {};

	assert(typeof isBuffer, 'function');

	assert(isBuffer(buffer1), true);
	assert(isBuffer(buffer2), true);
	assert(isBuffer(buffer3), true);
	assert(isBuffer(buffer4), true);
	assert(isBuffer(buffer5), true);
	assert(isBuffer(buffer6), false);
	assert(isBuffer(buffer7), false);
	assert(isBuffer(buffer8), false);

});


describe('Buffer.prototype.toJSON()', function(assert) {

	let buffer1 = Buffer.from('foo', 'utf8');
	let buffer2 = Buffer.from('foo bar', 'utf8');

	assert(buffer1.toJSON(), { type: 'Buffer', data: [ 102, 111, 111 ]});
	assert(JSON.stringify(buffer1), '{"type":"Buffer","data":[102,111,111]}');

	assert(buffer2.toJSON(), { type: 'Buffer', data: [ 102, 111, 111, 32, 98, 97, 114 ]});
	assert(JSON.stringify(buffer2), '{"type":"Buffer","data":[102,111,111,32,98,97,114]}');

});

describe('Buffer.prototype.copy()', function(assert) {

	let buffer1 = Buffer.from('foo', 'utf8');
	let buffer2 = Buffer.from('bar', 'utf8');
	let buffer3 = Buffer.from('foo bar', 'utf8');
	let buffer4 = Buffer.alloc(16).fill('.');
	let buffer5 = Buffer.alloc(16).fill('.');


	buffer1.copy(buffer4);
	buffer2.copy(buffer4, 10);

	buffer3.copy(buffer5, 3, 0);
	buffer3.copy(buffer5, 10, 3, 7);

	assert(buffer4.length, 16);
	assert(buffer4.length, 16);

	assert(buffer4.toString('utf8'), 'foo.......bar...');
	assert(buffer5.toString('utf8'), '...foo bar bar..');


});

describe('Buffer.prototype.fill()', function(assert) {

	let buffer1 = Buffer.alloc(13).fill(null);
	let buffer2 = Buffer.alloc(13).fill('f');
	let buffer3 = Buffer.alloc(13).fill('foo');
	let buffer4 = Buffer.alloc(37).fill('bar');

	assert(buffer1.toString('hex'), '00000000000000000000000000');
	assert(buffer2.toString('hex'), '66666666666666666666666666');
	assert(buffer3.toString('hex'), '666f6f666f6f666f6f666f6f66');
	assert(buffer4.toString('hex'), '62617262617262617262617262617262617262617262617262617262617262617262617262');

});

describe('Buffer.prototype.indexOf()', function(assert) {

	let buffer1 = Buffer.from('foo bar qux bar foo', 'utf8');
	let search2 = Buffer.from('bar', 'utf8');
	let search3 = Buffer.from('qux', 'utf8');
	let search4 = 'not-in-there';

	assert(buffer1.indexOf('foo'),      0);
	assert(buffer1.indexOf('foo', 4),  16);

	assert(buffer1.indexOf('bar'),      4);
	assert(buffer1.indexOf('bar', 4),   4);

	assert(buffer1.indexOf('qux'),      8);
	assert(buffer1.indexOf('qux', 12), -1);

	assert(buffer1.indexOf(search2),      4);
	assert(buffer1.indexOf(search2, 4),   4);

	assert(buffer1.indexOf(search3),      8);
	assert(buffer1.indexOf(search3, 12), -1);

	assert(buffer1.indexOf(search4),     -1);
	assert(buffer1.indexOf(search4, 12), -1);

});

describe('Buffer.prototype.includes()', function(assert) {

	let buffer1 = Buffer.from('foo bar qux bar foo', 'utf8');
	let search2 = Buffer.from('bar', 'utf8');
	let search3 = Buffer.from('qux', 'utf8');
	let search4 = 'not-in-there';

	assert(buffer1.includes('foo'), true);
	assert(buffer1.includes('bar'), true);
	assert(buffer1.includes('qux'), true);
	assert(buffer1.includes('doo'), false);

	assert(buffer1.includes(search2), true);
	assert(buffer1.includes(search3), true);
	assert(buffer1.includes(search4), false);

});

describe('Buffer.prototype.lastIndexOf()', function(assert) {

	let buffer1 = Buffer.from('foo bar qux bar foo', 'utf8');
	let search2 = Buffer.from('bar', 'utf8');
	let search3 = Buffer.from('qux', 'utf8');
	let search4 = 'not-in-there';

	assert(buffer1.lastIndexOf('foo'),    16);
	assert(buffer1.lastIndexOf('foo', 4),  0);

	assert(buffer1.lastIndexOf('bar'),    12);
	assert(buffer1.lastIndexOf('bar', 4),  4);

	assert(buffer1.lastIndexOf('qux'),     8);
	assert(buffer1.lastIndexOf('qux', 12), 8);

	assert(buffer1.lastIndexOf(search2),    12);
	assert(buffer1.lastIndexOf(search2, 4),  4);

	assert(buffer1.lastIndexOf(search3),     8);
	assert(buffer1.lastIndexOf(search3, 12), 8);

	assert(buffer1.indexOf(search4),     -1);
	assert(buffer1.indexOf(search4, 12), -1);

});

describe('Buffer.prototype.map()', function(assert) {

	let buffer1 = null;
	try {
		buffer1 = Buffer.alloc(10).fill('foo').map();
	} catch (err) {
		buffer1 = null;
		assert(err instanceof TypeError);
	}

	let buffer2 = Buffer.alloc(10).fill('bar').map((v) => v + 1);
	let buffer3 = Buffer.alloc(10).map(() => 0xf123);

	assert(buffer1, null);

	assert(buffer2.toString('hex'), '63627363627363627363');
	assert(buffer3.toString('hex'), '23232323232323232323');

});

describe('Buffer.prototype.slice()', function(assert) {

	let buffer1 = Buffer.from('foo bar qux bar foo', 'utf8');
	let buffer2 = buffer1.slice();
	let buffer3 = buffer1.slice(4);
	let buffer4 = buffer1.slice(4, 10);
	let buffer5 = buffer1.slice(-10);

	assert(buffer1.length, 19);
	assert(buffer2.length, 19);
	assert(buffer3.length, 15);
	assert(buffer4.length,  6);
	assert(buffer5.length, 10);

	assert(buffer1.toString('utf8'), 'foo bar qux bar foo');
	assert(buffer2.toString('utf8'), 'foo bar qux bar foo');
	assert(buffer3.toString('utf8'), 'bar qux bar foo');
	assert(buffer4.toString('utf8'), 'bar qu');
	assert(buffer5.toString('utf8'), 'ux bar foo');

});

describe('Buffer.prototype.write()', function(assert) {

	let buffer1 = Buffer.from('foo foo', 'utf8');
	let buffer2 = Buffer.from('bar bar', 'utf8');
	let buffer3 = Buffer.from('qux qux', 'utf8');
	let buffer4 = Buffer.alloc(7);

	buffer1.write('bar');
	buffer2.write('bar', 3);
	buffer3.write('bar', 7);

	try {
		buffer4.write('bar', -10);
	} catch (err) {
		assert(err instanceof RangeError);
	}

	assert(buffer1.length, 7);
	assert(buffer2.length, 7);
	assert(buffer3.length, 7);
	assert(buffer4.length, 7);

	assert(buffer1.toString('utf8'), 'bar foo');
	assert(buffer2.toString('utf8'), 'barbarr');
	assert(buffer3.toString('utf8'), 'qux qux');
	assert(buffer4.toString('utf8'), '\u0000\u0000\u0000\u0000\u0000\u0000\u0000');

});

describe('Buffer.prototype.toString()', function(assert) {

	let buffer1 = Buffer.from('foo foo', 'utf8');
	let buffer2 = Buffer.from('foo bar', 'utf8');

	assert(buffer1.toString('ascii'), 'foo foo');
	assert(buffer2.toString('ascii'), 'foo bar');

	assert(buffer1.toString('base64'), 'Zm9vIGZvbw==');
	assert(buffer2.toString('base64'), 'Zm9vIGJhcg==');

	assert(buffer1.toString('binary'), 'foo foo');
	assert(buffer2.toString('binary'), 'foo bar');

	assert(buffer1.toString('hex'), '666f6f20666f6f');
	assert(buffer2.toString('hex'), '666f6f20626172');

	assert(buffer1.toString('latin1'), 'foo foo');
	assert(buffer2.toString('latin1'), 'foo bar');

	assert(buffer1.toString('utf8'), 'foo foo');
	assert(buffer2.toString('utf8'), 'foo bar');

	assert(buffer1.toString('utf-8'), 'foo foo');
	assert(buffer2.toString('utf-8'), 'foo bar');

});


export default finish('base/Buffer', {
	internet: false,
	network:  false
});

