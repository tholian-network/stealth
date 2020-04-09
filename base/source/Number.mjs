
export const Number = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Number;

if (typeof Number.isNumber !== 'function') {

	Number.isNumber = function(num) {
		return Object.prototype.toString.call(num) === '[object Number]';
	};

}

export const isNumber = Number.isNumber;

