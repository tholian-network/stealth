
if (typeof String.isString !== 'function') {

	String.isString = function(str) {
		return Object.prototype.toString.call(str) === '[object String]';
	};

}

