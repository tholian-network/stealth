
if (typeof Array.isArray !== 'function') {

	Array.isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};

}

