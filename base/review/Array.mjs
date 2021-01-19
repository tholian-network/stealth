
import { describe, finish } from '../../covert/index.mjs';
import { Array, isArray   } from '../source/Array.mjs';



describe('Array.isArray()', function(assert) {

	let array1 = [ 1, 3, 3, 7 ];
	let array2 = new Array(1, 3, 3, 7);

	assert(typeof Array.isArray, 'function');

	assert(Array.isArray(array1), true);
	assert(Array.isArray(array2), true);

});

describe('isArray()', function(assert) {

	let array1 = [ 1, 3, 3, 7 ];
	let array2 = new Array(1, 3, 3, 7);

	assert(typeof isArray, 'function');

	assert(isArray(array1), true);
	assert(isArray(array2), true);

});

describe('Array.prototype.remove()', function(assert) {

	let array1 = [ 1, 3, 3, 7 ];
	let array2 = new Array(1, 3, 3, 7);

	assert(array1.remove(3), array1);
	assert(array2.remove(3), array1);

	assert(array1, [ 1, 7 ]);
	assert(array2, new Array(1, 7));

});

describe('Array.prototype.removeEvery()', function(assert) {

	let array1 = [
		{ num: 1, str: 'one'   },
		{ num: 3, str: 'three' },
		{ num: 3, str: 'three' },
		{ num: 7, str: 'seven' }
	];

	let array2 = [
		{ num: 1, str: 'one'   },
		{ num: 3, str: 'three' },
		{ num: 3, str: 'three' },
		{ num: 7, str: 'seven' }
	];

	let return1 = array1.removeEvery((cell) => cell.num === 3);
	let return2 = array2.removeEvery((cell) => cell.str === 'three');

	assert(return1, array1);
	assert(return2, array2);

	assert(array1, [
		{ num: 1, str: 'one'   },
		{ num: 7, str: 'seven' }
	]);

	assert(array2, [
		{ num: 1, str: 'one'   },
		{ num: 7, str: 'seven' }
	]);

});

describe('Array.prototype.toString()', function(assert) {

	let array1 = [ 1, 3, 3, 7 ];
	let array2 = new Array(1, 3, 3, 7);

	assert(Object.prototype.toString.call(array1), '[object Array]');
	assert(Object.prototype.toString.call(array2), '[object Array]');

	assert(array1.toString(), '1,3,3,7');
	assert(array2.toString(), '1,3,3,7');

});

describe('Array.prototype.valueOf()', function(assert) {

	let array1 = [ 1, 3, 3, 7 ];
	let array2 = new Array(1, 3, 3, 7);

	assert(array1.valueOf(), array1);
	assert(array2.valueOf(), array2);

	assert(JSON.stringify(array1), '[1,3,3,7]');
	assert(JSON.stringify(array2), '[1,3,3,7]');

});


export default finish('base/Array', {
	internet: false,
	network:  false
});

