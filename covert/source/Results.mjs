
import { isArray, isBoolean, isDate, isFunction, isNumber, isObject, isRegExp, isString } from '../../stealth/source/BASE.mjs';



const diff = function(aobject, bobject) {

	aobject = aobject !== undefined ? aobject : undefined;
	bobject = bobject !== undefined ? bobject : undefined;


	if (aobject === bobject) {

		return false;

	} else if (isArray(aobject) === true && isArray(bobject) === true) {

		for (let a = 0, al = aobject.length; a < al; a++) {

			if (bobject[a] !== undefined) {

				if (aobject[a] !== null && bobject[a] !== null) {

					let is_different = diff(aobject[a], bobject[a]);
					if (is_different === true) {

						if (isObject(aobject[a]) === true) {

							if (Object.keys(aobject[a].length > 0)) {
								return true;
							}

						} else {

							return true;

						}

					}

				}

			} else {

				return true;

			}

		}

	} else if (isBoolean(aobject) === true && isBoolean(bobject) === true) {

		return aobject !== bobject;

	} else if (isDate(aobject) === true && isDate(bobject) === true) {

		let astr = aobject.toString();
		let bstr = bobject.toString();

		if (astr !== bstr) {
			return true;
		}

	} else if (isFunction(aobject) === true && isFunction(bobject) === true) {

		let astr = aobject.toString();
		let bstr = bobject.toString();

		if (astr !== bstr) {
			return true;
		}

	} else if (isNumber(aobject) === true && isNumber(bobject) === true) {

		return aobject !== bobject;

	} else if (isObject(aobject) === true && isObject(bobject) === true) {

		let akeys = Object.keys(aobject);
		let bkeys = Object.keys(bobject);

		if (akeys.length !== bkeys.length) {
			return true;
		}


		for (let a = 0, al = akeys.length; a < al; a++) {

			let key = akeys[a];

			if (bobject[key] !== undefined) {

				if (aobject[key] !== null && bobject[key] !== null) {

					let is_different = diff(aobject[key], bobject[key]);
					if (is_different === true) {

						if (isObject(aobject[key]) === true) {

							if (Object.keys(aobject[key].length > 0)) {
								return true;
							}

						} else {

							return true;

						}

					}

				}

			} else {

				return true;

			}

		}

	} else if (isRegExp(aobject) === true && isRegExp(bobject) === true) {

		let astr = aobject.toString();
		let bstr = bobject.toString();

		if (astr !== bstr) {
			return true;
		}

	} else if (isString(aobject) === true && isString(bobject) === true) {

		return aobject !== bobject;

	} else if (aobject !== bobject) {

		return true;

	}


	return false;

};



export const Results = function(length) {

	length = isNumber(length) ? length : 0;


	this.data   = new Array(length).fill(null);
	this.index  = 0;
	this.length = length;

};


Results.from = function(data) {

	let length = 0;

	if (isFunction(data) === true) {

		let body = data.toString().split('\n').slice(1, -1);
		if (body.length > 0) {

			body.map((line) => line.trim()).forEach((line) => {

				if (line.startsWith('assert(')) {
					length++;
				}

			});

		}

	} else if (isNumber(data) === true) {

		if (Number.isNaN(data) === false) {
			length = (data | 0);
		}

	}

	return new Results(length);

};


Results.prototype = {

	assert: function(result, expect) {

		result = result !== undefined ? result : undefined;
		expect = expect !== undefined ? expect : undefined;


		if (result !== undefined && expect !== undefined) {

			if (this.index < this.data.length) {
				this.data[this.index] = diff(result, expect) === false;
				this.index++;
			}

		} else if (result === true || result === false) {

			if (this.index < this.data.length) {
				this.data[this.index] = result;
				this.index++;
			}

		} else {

			if (this.index < this.data.length) {
				this.data[this.index] = null;
				this.index++;
			}

		}

	},

	complete: function() {

		if (this.index < this.data.length) {
			return false;
		}

		return true;

	},

	current: function() {

		return this.index;

	},

	includes: function(result) {

		if (isBoolean(result) === true || result === null) {
			return this.data.includes(result);
		}

		return false;

	},

	render: function() {

		let str = '';

		if (this.data.length > 0) {

			str += '|';

			for (let d = 0, dl = this.data.length; d < dl; d++) {

				let value = this.data[d];
				if (value === null) {
					str += '?';
				} else if (value === true) {
					str += '+';
				} else if (value === false) {
					str += '-';
				} else {
					str += '?';
				}

			}

			str += '|';

		} else {

			str += '| no assert() calls |';

		}

		return str;

	},

	reset: function() {

		for (let d = 0, dl = this.data.length; d < dl; d++) {
			this.data[d] = null;
		}

		this.index = 0;

	}

};

