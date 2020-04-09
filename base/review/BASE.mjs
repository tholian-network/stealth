
import { Array,   Boolean,   Date,   Function,   Number,   Object,   RegExp,   String   } from '../../stealth/source/BASE.mjs';
import { isArray, isBoolean, isDate, isFunction, isNumber, isObject, isRegExp, isString } from '../../stealth/source/BASE.mjs';
import { describe, finish                                                               } from '../source/Review.mjs';
import { Buffer, isBuffer                                                               } from '../../base/build/browser/BASE.mjs';



const toString = (data) => {
	return Object.prototype.toString.call(data);
};


describe('Buffer', function(assert) {
});

describe('Buffer.alloc', function(assert) {

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

	assert((buffer1).toString('hex'), '6578616d706c656578616d706c656578616d706c65');
	assert((buffer2).toString('hex'), '6578616d706c656578616d706c65');
	assert((buffer3).toString('hex'), '6578616d706c65');
	assert((buffer4).toString('hex'), '25252525252525252525252525');
	assert((buffer5).toString('hex'), '0000000000000000000000000000000000000000');

});

describe('Buffer.byteLength', function(assert) {

	let buffer1 = Buffer.from('example', 'utf8');

	assert(Buffer.byteLength('example', 'utf8'),                     7);
	assert(Buffer.byteLength(buffer1.toString('base64'), 'base64'),  7);
	assert(Buffer.byteLength(buffer1.toString('binary'), 'binary'),  7);
	assert(Buffer.byteLength('6578616d706c65', 'hex'),               7);
	assert(Buffer.byteLength('6578616d706c656578616d706c65', 'hex'), 14);

});

describe('Buffer.concat', function(assert, console) {

	let buffer1 = Buffer.concat(null, 13);
	let buffer2 = Buffer.concat([
		Buffer.from('example.com', 'utf8'),
		Buffer.from('6578616d706c652e636f6d', 'hex')
	]);

	console.warn(buffer2.toString('utf8'));

});

describe('Buffer.from', function(assert) {

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

	assert((buffer1).toString('hex'), '01030307');
	assert((buffer2).toString('hex'), '6578616d706c652e636f6d');
	assert((buffer3).toString('hex'), '01030307');
	assert((buffer4).toString('hex'), '6578616d706c652e636f6d');
	assert((buffer5).toString('hex'), '6578616d706c652e636f6d');

});

describe('Buffer.isBuffer', function(assert) {

	let buffer1 = Buffer.from(new Uint8Array(1,3,3,7));
	let buffer2 = Buffer.from(Buffer.from('example.com'));
	let buffer3 = Buffer.from(new Array(1,3,3,7));
	let buffer4 = Buffer.from('example.com', 'utf8');
	let buffer5 = Buffer.from('6578616d706c652e636f6d', 'hex');
	let buffer6 = null;
	let buffer7 = [];
	let buffer8 = {};

	assert(typeof Buffer.isBuffer, 'function');
	assert(Buffer.isBuffer, isBuffer);

	assert(isBuffer(buffer1), true);
	assert(isBuffer(buffer2), true);
	assert(isBuffer(buffer3), true);
	assert(isBuffer(buffer4), true);
	assert(isBuffer(buffer5), true);
	assert(isBuffer(buffer6), false);
	assert(isBuffer(buffer7), false);
	assert(isBuffer(buffer8), false);

});

describe('buffer.serialize', function(assert) {
});

describe('buffer.copy', function(assert) {
});

describe('buffer.fill', function(assert) {
});

describe('buffer.map', function(assert) {
});

describe('buffer.slice', function(assert) {
});

describe('buffer.write', function(assert) {
});

describe('buffer.toString', function(assert) {
});

describe('Date', function(assert) {


});


export default finish('base/BASE');

