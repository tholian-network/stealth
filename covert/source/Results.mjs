
import { Buffer, isArray, isBoolean, isBuffer, isDate, isFunction, isMap, isNumber, isObject, isRegExp, isSet, isString } from '../extern/base.mjs';
import { Filesystem                                                                                                     } from './Filesystem.mjs';



export const isResults = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Results]';
};

const FILESYSTEM = new Filesystem();

const isArrayBuffer = function(obj) {
	return Object.prototype.toString.call(obj) === '[object ArrayBuffer]';
};

const isDataView = function(obj) {
	return Object.prototype.toString.call(obj) === '[object DataView]';
};

const isTypedArray = function(obj) {

	let str = Object.prototype.toString.call(obj);
	let typ = '';
	if (str.startsWith('[') === true && str.includes(' ') === true && str.endsWith(']') === true) {
		typ = str.substr(1, str.length - 2).split(' ').pop();
	}

	if (
		typ === 'Int8Array'
		|| typ === 'Uint8Array'
		|| typ === 'Uint8ClampedArray'
		|| typ === 'Int16Array'
		|| typ === 'Uint16Array'
		|| typ === 'Int32Array'
		|| typ === 'Uint32Array'
		|| typ === 'Float32Array'
		|| typ === 'Float64Array'
		|| typ === 'BigInt64Array'
		|| typ === 'BigUint64Array'
	) {
		return true;
	}

	return false;

};

const clone = function(obj) {

	let target = null;

	if (obj === undefined) {

		target = undefined;

	} else if (obj === null) {

		target = null;

	} else if (obj === Infinity) {

		target = Infinity;

	} else if (obj === -Infinity) {

		target = -Infinity;

	} else if (Number.isNaN(obj) === true) {

		target = NaN;

	} else if (isArray(obj) === true) {

		target = [];

		for (let o = 0, ol = obj.length; o < ol; o++) {
			target[o] = clone(obj[o]);
		}

	} else if (isBuffer(obj) === true) {

		target = Buffer.from(obj.toJSON().data || []);

	} else if (isArrayBuffer(obj) === true) {

		target = obj.slice(0);

	} else if (isDataView(obj) === true) {

		target = new DataView(clone(obj.buffer));

	} else if (isTypedArray(obj) === true) {

		target = new obj.constructor(obj);

	} else if (isDate(obj) === true) {

		let data = null;
		try {
			data = obj.toISOString();
		} catch (err) {
			data = null;
		}

		if (data !== null) {
			target = new Date(data);
		}

	} else if (isBoolean(obj) === true) {

		target = obj;

	} else if (isMap(obj) === true) {

		target = new Map();

		obj.forEach((val, key) => {
			target.set(clone(key), clone(val));
		});

	} else if (isNumber(obj) === true) {

		target = obj;

	} else if (isRegExp(obj) === true) {

		target = new RegExp(obj.source || '', obj.flags || '');

	} else if (isSet(obj) === true) {

		target = new Set();

		obj.forEach((val) => {
			target.add(clone(val));
		});

	} else if (isString(obj) === true) {

		target = obj;

	} else if (isObject(obj) === true) {

		target = {};

		for (let prop in obj) {

			if (Object.prototype.hasOwnProperty.call(obj, prop) === true) {
				target[prop] = clone(obj[prop]);
			}

		}

	} else {

		target = obj;

	}


	return target;

};

const diff = function(aobject, bobject) {

	aobject = aobject !== undefined ? aobject : undefined;
	bobject = bobject !== undefined ? bobject : undefined;


	if (Number.isNaN(aobject) === true && Number.isNaN(bobject) === true) {

		return false;

	} else if (aobject === bobject) {

		return false;

	} else if (isArray(aobject) === true && isArray(bobject) === true) {

		if (aobject.length !== bobject.length) {
			return true;
		}

		for (let a = 0, al = aobject.length; a < al; a++) {

			if (bobject[a] !== undefined) {

				if (aobject[a] !== null && bobject[a] !== null) {

					let is_different = diff(aobject[a], bobject[a]);
					if (is_different === true) {

						if (isObject(aobject[a]) === true) {

							if (Object.keys(aobject[a]).length > 0) {
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

	} else if (isBuffer(aobject) === true && isBuffer(bobject) === true) {

		return aobject.toString('hex') !== bobject.toString('hex');

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

	} else if (isMap(aobject) === true && isMap(bobject) === true) {

		let avalues = Array.from(aobject);
		let bvalues = Array.from(bobject);

		if (avalues.length !== bvalues.length) {
			return true;
		}

		for (let a = 0, al = avalues.length; a < al; a++) {

			if (bvalues[a] !== undefined && avalues[a][0] !== undefined && bvalues[a][0] !== undefined) {

				if (avalues[a][0] === bvalues[a][0]) {

					let is_different = diff(avalues[a][1], bvalues[a][1]);
					if (is_different === true) {
						return true;
					}

				} else {

					return true;

				}

			} else {

				return true;

			}

		}

	} else if (isNumber(aobject) === true && isNumber(bobject) === true) {

		if (aobject === bobject) {

			return false;

		} else {

			// Allow 16ms of variance due to timing issues via setTimeout()
			if ((aobject).toString().length === 13 && (bobject).toString().length === 13) {

				if (aobject >= bobject - 8 && aobject <= bobject + 8) {
					return false;
				}

			}

			return true;

		}

	} else if (isRegExp(aobject) === true && isRegExp(bobject) === true) {

		let astr = aobject.toString();
		let bstr = bobject.toString();

		if (astr !== bstr) {
			return true;
		}

	} else if (isSet(aobject) === true && isSet(bobject) === true) {

		let avalues = Array.from(aobject);
		let bvalues = Array.from(bobject);

		if (avalues.length !== bvalues.length) {
			return true;
		}

		for (let a = 0, al = avalues.length; a < al; a++) {

			if (bvalues[a] !== undefined) {

				if (avalues[a] !== null && bvalues[a] !== null) {

					let is_different = diff(avalues[a], bvalues[a]);
					if (is_different === true) {

						if (isObject(avalues[a]) === true) {

							if (Object.keys(avalues[a]).length > 0) {
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

	} else if (isString(aobject) === true && isString(bobject) === true) {

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

	} else if (aobject !== bobject) {

		return true;

	}


	return false;

};

const trace_assert = function() {

	let stack = [];

	try {
		throw new Error();
	} catch (err) {
		stack = err.stack.trim().split('\n');
		// Remove unnecessary function calls
		stack = stack.slice(4);
	}

	if (stack.length > 0) {

		let origin = null;

		for (let s = 0, sl = stack.length; s < sl; s++) {

			let line = stack[s].trim();
			if (line.includes('(file://') === true && line.includes(')') === true) {

				let tmp = line.split('(file://')[1].split(')').shift().trim();
				if (tmp.includes('/review/') === true && tmp.includes('.mjs') === true) {
					origin = tmp;
					break;
				}

			} else if (line.includes('file://') === true) {

				let tmp = line.split('file://')[1].trim();
				if (tmp.includes('/review/') === true && tmp.includes('.mjs') === true) {
					origin = tmp;
					break;
				}

			}

		}

		if (origin !== null) {

			let file = origin.split(':')[0] || null;
			let line = origin.split(':')[1] || null;

			if (file !== null && file.endsWith('.mjs') === true && line !== null) {

				let code = FILESYSTEM.read(file, 'utf8');
				if (code !== null) {

					let lines = code.split('\n');
					let check = lines[line - 1].trim();

					if (check.startsWith('assert(') === true && check.endsWith(');') === true) {
						return check.substr(0, check.length - 1) + ' in line #' + line;
					} else if (check.startsWith('assert(') === true) {
						return 'assert() in line #' + line;
					}

				}

			}

		}

	}


	return null;

};



const Results = function(length) {

	length = isNumber(length) ? length : 0;


	this.data   = new Array(length).fill(null);
	this.index  = 0;
	this.length = length;
	this.stack  = new Array(length).fill(null);

};


Results.isResults = isResults;


Results.from = function(data) {

	if (isFunction(data) === true) {

		let length = 0;
		let body   = data.toString().split('\n').slice(1, -1);

		if (body.length > 0) {

			body.map((line) => line.trim()).forEach((line) => {

				if (line.startsWith('assert(') === true) {
					length++;
				}

			});

		}

		return new Results(length);

	} else if (isArray(data) === true) {

		let length  = data.length;
		let results = new Results(length);

		data.forEach((value, d) => {

			if (isBoolean(value) === true) {
				results.data[d] = value;
			} else {
				results.data[d] = null;
			}

		});

		return results;

	} else if (isNumber(data) === true) {

		if (Number.isNaN(data) === false) {
			return new Results((data | 0));
		}

	}


	return new Results(0);

};


Results.prototype = {

	[Symbol.toStringTag]: 'Results',

	toJSON: function() {

		return {
			'type': 'Results',
			'data': this.data.slice()
		};

	},

	assert: function(result, expect) {

		result = result !== undefined ? result : undefined;
		expect = expect !== undefined ? expect : undefined;


		if (result !== undefined && expect !== undefined) {

			if (this.index < this.data.length) {

				if (diff(result, expect) === true) {

					this.data[this.index]  = false;
					this.stack[this.index] = {
						assert: trace_assert(),
						diff:   [ clone(result), clone(expect) ]
					};

				} else {

					this.data[this.index]  = true;
					this.stack[this.index] = {
						assert: null,
						diff:   null
					};

				}

				this.index++;

			}

		} else if (expect !== undefined) {

			if (this.index < this.data.length) {

				this.data[this.index]  = false;
				this.stack[this.index] = {
					assert: trace_assert(),
					diff:   [ null, clone(expect) ]
				};

				this.index++;

			}

		} else if (result === true || result === false) {

			if (this.index < this.data.length) {

				if (result === false) {

					this.data[this.index]  = false;
					this.stack[this.index] = {
						assert: trace_assert(),
						diff:   [ false, true ]
					};

				} else {

					this.data[this.index]  = true;
					this.stack[this.index] = {
						assert: null,
						diff:   null
					};

				}

				this.index++;

			}

		} else {

			if (this.index < this.data.length) {

				this.data[this.index]  = null;
				this.stack[this.index] = {
					assert: trace_assert(),
					diff:   [ null, true ]
				};

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

			if (this.data.includes(result) === true) {
				return true;
			}

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


export { Results };

