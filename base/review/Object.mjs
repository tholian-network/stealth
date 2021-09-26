
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

describe('Object.clone()', function(assert) {

	let object1 = { foo: 'bar' };
	let object2 = new Object({ foo: 'bar' });
	let object3 = { foo: 'bar', qux: [ 1, 3, 3, 7 ] };
	let object4 = new Object({ foo: 'bar', qux: [ 1, 3, 3, 7 ] });

	let target3 = {};
	let target4 = {};
	let clone1  = Object.clone(null,    object1);
	let clone2  = Object.clone(null,    object2);
	let clone3  = Object.clone(target3, object3);
	let clone4  = Object.clone(target4, object4);

	assert(isObject(clone1), true);
	assert(isObject(clone2), true);
	assert(isObject(clone3), true);
	assert(isObject(clone4), true);

	assert(object1 === clone1, false);
	assert(object2 === clone2, false);
	assert(object3 === clone3, false);
	assert(object4 === clone4, false);

	assert(target3 === clone3, true);
	assert(target4 === clone4, true);

	assert(object1, clone1);
	assert(object2, clone2);
	assert(object3, clone3);
	assert(object4, clone4);

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

