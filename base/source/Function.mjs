
if (typeof Function.isFunction !== 'function') {

	Function.isFunction = function(fun) {
		return Object.prototype.toString.call(fun) === '[object Function]';
	};

}

