
if (typeof Boolean.isBoolean !== 'function') {

	Boolean.isBoolean = function(bol) {
		return Object.prototype.toString.call(bol) === '[object Boolean]';
	};

}

