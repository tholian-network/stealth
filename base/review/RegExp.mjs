
import { describe, finish } from '../../covert/index.mjs';
import { RegExp, isRegExp } from '../source/RegExp.mjs';



describe('RegExp.isRegExp()', function(assert) {

	let regexp1 = /foo\/bar/g;
	let regexp2 = new RegExp('foo/bar', 'g');

	assert(typeof RegExp.isRegExp, 'function');

	assert(RegExp.isRegExp(regexp1), true);
	assert(RegExp.isRegExp(regexp2), true);

});

describe('isRegExp()', function(assert) {

	let regexp1 = /foo\/bar/g;
	let regexp2 = new RegExp('foo/bar', 'g');

	assert(typeof isRegExp, 'function');

	assert(isRegExp(regexp1), true);
	assert(isRegExp(regexp2), true);

});

describe('RegExp.prototype.toString()', function(assert) {

	let regexp1 = /foo\/bar/g;
	let regexp2 = new RegExp('foo/bar', 'g');

	assert(Object.prototype.toString.call(regexp1), '[object RegExp]');
	assert(Object.prototype.toString.call(regexp2), '[object RegExp]');

	assert((regexp1).toString(), '/foo\\/bar/g');
	assert((regexp2).toString(), '/foo\\/bar/g');

});

describe('RegExp.prototype.valueOf()', function(assert) {

	let regexp1 = /foo\/bar/g;
	let regexp2 = new RegExp('foo/bar', 'g');

	assert((regexp1).valueOf(), regexp1);
	assert((regexp2).valueOf(), regexp2);

	assert(JSON.stringify(regexp1), '{}');
	assert(JSON.stringify(regexp2), '{}');

});


export default finish('base/RegExp', {
	internet: false,
	network:  false
});

