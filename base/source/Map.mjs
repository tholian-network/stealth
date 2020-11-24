
export const Map = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Map;

if (typeof Map.isMap !== 'function') {

	Map.isMap = function(map) {
		return Object.prototype.toString.call(map) === '[object Map]';
	};

}

export const isMap = Map.isMap;

