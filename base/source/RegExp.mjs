
if (typeof RegExp.isRegExp !== 'function') {

	RegExp.isRegExp = function(reg) {
		return Object.prototype.toString.call(reg) === '[object RegExp]';
	};

}

