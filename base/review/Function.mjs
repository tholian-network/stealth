
import { describe, finish     } from '../../covert/index.mjs';
import { Function, isFunction } from '../source/Function.mjs';



describe('Function.isFunction()', function(assert) {

	let function1 = function() {console.log('test');};
	let function2 = new Function('console.log(\'test\');');

	assert(typeof Function.isFunction, 'function');

	assert(Function.isFunction(function1), true);
	assert(Function.isFunction(function2), true);

});

describe('isFunction()', function(assert) {

	let function1 = function() {console.log('test');};
	let function2 = new Function('console.log(\'test\');');

	assert(typeof isFunction, 'function');

	assert(isFunction(function1), true);
	assert(isFunction(function2), true);

});

describe('Function.prototype.toString()', function(assert) {

	let function1 = function() {console.log('test');};
	let function2 = new Function('console.log(\'test\');');

	assert(Object.prototype.toString.call(function1), '[object Function]');
	assert(Object.prototype.toString.call(function2), '[object Function]');

	assert((function1).toString(), 'function() {console.log(\'test\');}');
	assert((function2).toString(), 'function anonymous(\n) {\nconsole.log(\'test\');\n}');

});

describe('Function.prototype.valueOf()', function(assert) {

	let function1 = function() {console.log('test');};
	let function2 = new Function('console.log(\'test\');');

	assert((function1).valueOf(), function1);
	assert((function2).valueOf(), function2);

	assert(JSON.stringify(function1) === undefined);
	assert(JSON.stringify(function2) === undefined);

});


export default finish('base/Function', {
	internet: false,
	network:  false
});

