
export const RegExp = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).RegExp;

if (typeof RegExp.isRegExp !== 'function') {

	RegExp.isRegExp = function(reg) {
		return Object.prototype.toString.call(reg) === '[object RegExp]';
	};

}

export const isRegExp = RegExp.isRegExp;

