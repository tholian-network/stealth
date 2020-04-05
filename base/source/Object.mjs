
if (typeof Object.isObject !== 'function') {

	Object.isObject = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	};

}

