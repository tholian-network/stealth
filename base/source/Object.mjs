
export const Object = (typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this)).Object;

if (typeof Object.isObject !== 'function') {

	Object.isObject = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	};

}

if (typeof Object.clone !== 'function') {

	Object.clone = function(target) {

		target = target instanceof Object ? target : {};


		for (let a = 1, al = arguments.length; a < al; a++) {

			let source = arguments[a];
			if (source) {

				for (let prop in source) {

					if (Object.prototype.hasOwnProperty.call(source, prop) === true) {

						let other_value = source[prop];
						if (other_value instanceof Array) {

							target[prop] = [];
							Object.clone(target[prop], source[prop]);

						} else if (other_value instanceof Object) {

							target[prop] = {};
							Object.clone(target[prop], source[prop]);

						} else {

							target[prop] = source[prop];

						}

					}

				}

			}

		}


		return target;

	};

}

export const isObject = Object.isObject;

