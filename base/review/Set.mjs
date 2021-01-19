
import { describe, finish } from '../../covert/index.mjs';
import { Set, isSet       } from '../source/Set.mjs';



describe('Set.isSet()', function(assert) {

	let set1 = new Set();
	let set2 = new Set([ 1, 3, 3, 7 ]);

	assert(typeof Set.isSet, 'function');

	assert(Set.isSet(set1), true);
	assert(Set.isSet(set2), true);

});

describe('isSet()', function(assert) {

	let set1 = new Set();
	let set2 = new Set([ 1, 3, 3, 7 ]);

	assert(typeof isSet, 'function');

	assert(isSet(set1), true);
	assert(isSet(set2), true);

});

describe('Set.prototype.toString()', function(assert) {

	let set1 = new Set();
	let set2 = new Set([ 1, 3, 3, 7 ]);

	assert(Object.prototype.toString.call(set1), '[object Set]');
	assert(Object.prototype.toString.call(set2), '[object Set]');

	assert((set1).toString(), '[object Set]');
	assert((set2).toString(), '[object Set]');

});

describe('Set.prototype.valueOf()', function(assert) {

	let set1 = new Set();
	let set2 = new Set([ 1, 3, 3, 7 ]);

	assert((set1).valueOf(), new Set());
	assert((set2).valueOf(), new Set([ 1, 3, 7 ]));

	assert(JSON.stringify(set1), '{}');
	assert(JSON.stringify(set2), '{}');

});


export default finish('base/Set', {
	internet: false,
	network:  false
});

