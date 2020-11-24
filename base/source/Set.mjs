
export const Set = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Set;

if (typeof Set.isSet !== 'function') {

	Set.isSet = function(set) {
		return Object.prototype.toString.call(set) === '[object Set]';
	};

}

export const isSet = Set.isSet;

