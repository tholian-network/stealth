
import { describe, finish } from '../../covert/index.mjs';
import { Object, isObject } from '../source/Object.mjs';



describe('Object.isObject()', function(assert) {

	let object1 = { foo: 'bar' };
	let object2 = new Object({ foo: 'bar' });

	assert(typeof Object.isObject, 'function');

	assert(Object.isObject(object1), true);
	assert(Object.isObject(object2), true);

});

describe('isObject()', function(assert) {

	let object1 = { foo: 'bar' };
	let object2 = new Object({ foo: 'bar' });

	assert(typeof isObject, 'function');

	assert(isObject(object1), true);
	assert(isObject(object2), true);

});

describe('Object.prototype.toString()', function(assert) {

	let object1 = { foo: 'bar' };
	let object2 = new Object({ foo: 'bar' });

	assert(Object.prototype.toString.call(object1), '[object Object]');
	assert(Object.prototype.toString.call(object2), '[object Object]');

	assert((object1).toString(), '[object Object]');
	assert((object2).toString(), '[object Object]');

});

describe('Object.prototype.valueOf()', function(assert) {

	let object1 = { foo: 'bar' };
	let object2 = new Object({ foo: 'bar' });

	assert((object1).valueOf(), object1);
	assert((object2).valueOf(), object2);

	assert(JSON.stringify(object1), '{"foo":"bar"}');
	assert(JSON.stringify(object2), '{"foo":"bar"}');

});


export default finish('base/Object', {
	internet: false,
	network:  false
});

