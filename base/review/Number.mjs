
import { describe, finish } from '../../covert/index.mjs';
import { Number, isNumber } from '../source/Number.mjs';



describe('Number', function(assert) {

	let number1 = 13.37;
	let number2 = new Number(13.37);

	assert(typeof Number.isNumber, 'function');
	assert(Number.isNumber, isNumber);

	assert(isNumber(number1), true);
	assert(isNumber(number2), true);

	assert(Object.prototype.toString.call(number1), '[object Number]');
	assert(Object.prototype.toString.call(number2), '[object Number]');

	assert((number1).toString(), '13.37');
	assert((number2).toString(), '13.37');

	assert((number1).valueOf(), 13.37);
	assert((number2).valueOf(), 13.37);

	assert(JSON.stringify(number1), '13.37');
	assert(JSON.stringify(number2), '13.37');

});


export default finish('base/Number');

