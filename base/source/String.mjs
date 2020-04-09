
export const String = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).String;

if (typeof String.isString !== 'function') {

	String.isString = function(str) {
		return Object.prototype.toString.call(str) === '[object String]';
	};

}

export const isString = String.isString;

