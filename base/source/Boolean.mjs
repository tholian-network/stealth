
export const Boolean = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Boolean;

if (typeof Boolean.isBoolean !== 'function') {

	Boolean.isBoolean = function(bol) {
		return Object.prototype.toString.call(bol) === '[object Boolean]';
	};

}

export const isBoolean = Boolean.isBoolean;

