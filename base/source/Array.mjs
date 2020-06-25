
export const Array = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Array;

if (typeof Array.isArray !== 'function') {

	Array.isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};

}

if (typeof Array.prototype.remove !== 'function') {

	Array.prototype.remove = function(value) {

		let index = this.indexOf(value);

		while (index !== -1) {

			this.splice(index, 1);

			index = this.indexOf(value);

		}

		return this;

	};

}

export const isArray = Array.isArray;

