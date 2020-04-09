
import { describe, finish } from '../../covert/index.mjs';
import { Array, isArray   } from '../source/Array.mjs';



describe('Array', function(assert) {

	let array1 = [ 1, 3, 3, 7 ];
	let array2 = new Array(1, 3, 3, 7);

	assert(typeof Array.isArray, 'function');
	assert(Array.isArray, isArray);

	assert(isArray(array1), true);
	assert(isArray(array2), true);

	assert(Object.prototype.toString.call(array1), '[object Array]');
	assert(Object.prototype.toString.call(array2), '[object Array]');

	assert(array1.toString(), '1,3,3,7');
	assert(array2.toString(), '1,3,3,7');

	assert(array1.valueOf(), array1);
	assert(array2.valueOf(), array2);

	assert(JSON.stringify(array1), '[1,3,3,7]');
	assert(JSON.stringify(array2), '[1,3,3,7]');

});


export default finish('base/Array');

