
export const Function = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Function;

if (typeof Function.isFunction !== 'function') {

	Function.isFunction = function(fun) {
		return Object.prototype.toString.call(fun) === '[object Function]';
	};

}

export const isFunction = Function.isFunction;

