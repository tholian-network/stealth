
import { describe, finish } from '../../covert/index.mjs';
import { String, isString } from '../source/String.mjs';



describe('String.isString()', function(assert) {

	let string1 = 'example.com';
	let string2 = new String('example.com');

	assert(typeof String.isString, 'function');
	assert(String.isString, isString);

	assert(String.isString(string1), true);
	assert(String.isString(string2), true);

});

describe('isString()', function(assert) {

	let string1 = 'example.com';
	let string2 = new String('example.com');

	assert(typeof isString, 'function');

	assert(isString(string1), true);
	assert(isString(string2), true);

});

describe('String.prototype.toString()', function(assert) {

	let string1 = 'example.com';
	let string2 = new String('example.com');

	assert(Object.prototype.toString.call(string1), '[object String]');
	assert(Object.prototype.toString.call(string2), '[object String]');

	assert((string1).toString(), 'example.com');
	assert((string2).toString(), 'example.com');

});

describe('String.prototype.valueOf()', function(assert) {

	let string1 = 'example.com';
	let string2 = new String('example.com');

	assert((string1).valueOf(), 'example.com');
	assert((string2).valueOf(), 'example.com');

	assert(JSON.stringify(string1), '"example.com"');
	assert(JSON.stringify(string2), '"example.com"');

});


export default finish('base/String', {
	internet: false,
	network:  false
});

