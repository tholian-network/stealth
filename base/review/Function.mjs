
import { describe, finish     } from '../../covert/index.mjs';
import { Function, isFunction } from '../source/Function.mjs';



describe('Function', function(assert) {

	let function1 = function() {console.log('test');};
	let function2 = new Function('console.log(\'test\');');

	assert(typeof Function.isFunction, 'function');
	assert(Function.isFunction, isFunction);

	assert(isFunction(function1), true);
	assert(isFunction(function2), true);

	assert(Object.prototype.toString.call(function1), '[object Function]');
	assert(Object.prototype.toString.call(function2), '[object Function]');

	assert((function1).toString(), 'function() {console.log(\'test\');}');
	assert((function2).toString(), 'function anonymous(\n) {\nconsole.log(\'test\');\n}');

	assert((function1).valueOf(), function1);
	assert((function2).valueOf(), function2);

	assert(JSON.stringify(function1) === undefined);
	assert(JSON.stringify(function2) === undefined);

});


export default finish('base/Function');

