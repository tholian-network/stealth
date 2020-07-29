
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

if (typeof Array.prototype.removeEvery !== 'function') {

	Array.prototype.removeEvery = function(predicate/*, thisArg */) {

		if (this === null || this === undefined) {
			throw new TypeError('Array.prototype.removeEvery called on null or undefined');
		}

		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}


		let list    = Object(this);
		let length  = list.length >>> 0;
		let thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		let value;

		for (let i = 0; i < length; i++) {

			if (i in list) {

				value = list[i];

				if (!!predicate.call(thisArg, value, i, list) === true) {
					this.splice(i, 1);
					length--;
					i--;
				}

			}

		}

		return this;

	};

}

export const isArray = Array.isArray;

