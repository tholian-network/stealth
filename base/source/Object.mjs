
export const Object = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Object;

if (typeof Object.isObject !== 'function') {

	Object.isObject = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	};

}

export const isObject = Object.isObject;

