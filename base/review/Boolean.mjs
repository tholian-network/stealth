
import { describe, finish   } from '../../covert/index.mjs';
import { Boolean, isBoolean } from '../source/Boolean.mjs';



describe('Boolean.isBoolean()', function(assert) {

	let boolean1 = true;
	let boolean2 = false;
	let boolean3 = new Boolean(true);
	let boolean4 = new Boolean(false);

	assert(typeof Boolean.isBoolean, 'function');

	assert(Boolean.isBoolean(boolean1), true);
	assert(Boolean.isBoolean(boolean2), true);
	assert(Boolean.isBoolean(boolean3), true);
	assert(Boolean.isBoolean(boolean4), true);

});

describe('isBoolean()', function(assert) {

	let boolean1 = true;
	let boolean2 = false;
	let boolean3 = new Boolean(true);
	let boolean4 = new Boolean(false);

	assert(typeof isBoolean, 'function');

	assert(isBoolean(boolean1), true);
	assert(isBoolean(boolean2), true);
	assert(isBoolean(boolean3), true);
	assert(isBoolean(boolean4), true);

});

describe('Boolean.prototype.toString()', function(assert) {

	let boolean1 = true;
	let boolean2 = false;
	let boolean3 = new Boolean(true);
	let boolean4 = new Boolean(false);

	assert(Object.prototype.toString.call(boolean1), '[object Boolean]');
	assert(Object.prototype.toString.call(boolean2), '[object Boolean]');
	assert(Object.prototype.toString.call(boolean3), '[object Boolean]');
	assert(Object.prototype.toString.call(boolean4), '[object Boolean]');

	assert((boolean1).toString(), 'true');
	assert((boolean2).toString(), 'false');
	assert((boolean3).toString(), 'true');
	assert((boolean4).toString(), 'false');

});

describe('Boolean.prototype.valueOf()', function(assert) {

	let boolean1 = true;
	let boolean2 = false;
	let boolean3 = new Boolean(true);
	let boolean4 = new Boolean(false);

	assert((boolean1).valueOf(), true);
	assert((boolean2).valueOf(), false);
	assert((boolean3).valueOf(), true);
	assert((boolean4).valueOf(), false);

	assert(JSON.stringify(boolean1), 'true');
	assert(JSON.stringify(boolean2), 'false');
	assert(JSON.stringify(boolean3), 'true');
	assert(JSON.stringify(boolean4), 'false');

});


export default finish('base/Boolean', {
	internet: false,
	network:  false
});

