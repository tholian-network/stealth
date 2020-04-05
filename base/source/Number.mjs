
if (typeof Number.isNumber !== 'function') {

	Number.isNumber = function(num) {
		return Object.prototype.toString.call(num) === '[object Number]';
	};

}

