
export const Date = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Date;

if (typeof Date.isDate !== 'function') {

	Date.isDate = function(dat) {
		return Object.prototype.toString.call(dat) === '[object Date]';
	};

}

export const isDate = Date.isDate;

