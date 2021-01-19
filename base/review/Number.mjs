
import { describe, finish } from '../../covert/index.mjs';
import { Number, isNumber } from '../source/Number.mjs';



describe('Number.isNumber()', function(assert) {

	let number1 = 13.37;
	let number2 = new Number(13.37);

	assert(typeof Number.isNumber, 'function');

	assert(Number.isNumber(number1), true);
	assert(Number.isNumber(number2), true);

});

describe('isNumber()', function(assert) {

	let number1 = 13.37;
	let number2 = new Number(13.37);

	assert(typeof isNumber, 'function');

	assert(isNumber(number1), true);
	assert(isNumber(number2), true);

});

describe('Number.prototype.toString()', function(assert) {

	let number1 = 13.37;
	let number2 = new Number(13.37);

	assert(Object.prototype.toString.call(number1), '[object Number]');
	assert(Object.prototype.toString.call(number2), '[object Number]');

	assert((number1).toString(), '13.37');
	assert((number2).toString(), '13.37');

});

describe('Number.prototype.valueOf()', function(assert) {

	let number1 = 13.37;
	let number2 = new Number(13.37);

	assert((number1).valueOf(), 13.37);
	assert((number2).valueOf(), 13.37);

	assert(JSON.stringify(number1), '13.37');
	assert(JSON.stringify(number2), '13.37');

});


export default finish('base/Number', {
	internet: false,
	network:  false
});

