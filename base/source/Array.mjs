
export const Array = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Array;

if (typeof Array.isArray !== 'function') {

	Array.isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};

}

export const isArray = Array.isArray;

