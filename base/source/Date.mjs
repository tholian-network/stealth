
if (typeof Date.isDate !== 'function') {

	Date.isDate = function(dat) {
		return Object.prototype.toString.call(dat) === '[object Date]';
	};

}

