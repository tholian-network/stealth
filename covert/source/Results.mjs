
const diff = function(aobject, bobject) {

	aobject = aobject !== undefined ? aobject : undefined;
	bobject = bobject !== undefined ? bobject : undefined;


	if (aobject === bobject) {

		return false;

	} else if (aobject instanceof Array && bobject instanceof Array) {

		for (let a = 0, al = aobject.length; a < al; a++) {

			if (bobject[a] !== undefined) {

				if (aobject[a] !== null && bobject[a] !== null) {

					if (aobject[a] instanceof Object && bobject[a] instanceof Object) {

						if (diff(aobject[a], bobject[a]) === true) {

							// Allows aobject[a].builds = {} and bobject[a].builds = { stuff: {}}
							if (Object.keys(aobject[a]).length > 0) {
								return true;
							}

						}

					} else if (typeof aobject[a] !== typeof bobject[a]) {
						return true;
					} else if (aobject[a] !== bobject[a]) {
						return true;
					}

				}

			} else {
				return true;
			}

		}

	} else if (aobject instanceof Date && bobject instanceof Date) {

		let astr = aobject.toString();
		let bstr = bobject.toString();

		if (astr !== bstr) {
			return true;
		}

	} else if (aobject instanceof RegExp && bobject instanceof RegExp) {

		let astr = aobject.toString();
		let bstr = bobject.toString();

		if (astr !== bstr) {
			return true;
		}

	} else if (aobject instanceof Object && bobject instanceof Object) {

		let akeys = Object.keys(aobject);
		let bkeys = Object.keys(bobject);

		if (akeys.length !== bkeys.length) {
			return true;
		}


		for (let a = 0, al = akeys.length; a < al; a++) {

			let key = akeys[a];

			if (bobject[key] !== undefined) {

				if (aobject[key] !== null && bobject[key] !== null) {

					if (aobject[key] instanceof Object && bobject[key] instanceof Object) {

						if (diff(aobject[key], bobject[key]) === true) {

							// Allows aobject[key].builds = {} and bobject[key].builds = { stuff: {}}
							if (Object.keys(aobject[key]).length > 0) {
								return true;
							}

						}

					} else if (typeof aobject[key] !== typeof bobject[key]) {
						return true;
					} else if (aobject[key] !== bobject[key]) {
						return true;
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



export const Results = function(length) {

	length = typeof length === 'number' ? length : 0;


	this.data   = new Array(length).fill(null);
	this.index  = 0;
	this.length = length;

};


Results.from = function(data) {

	let length = 0;

	if (typeof data === 'function') {

		let body = data.toString().split('\n').slice(1, -1);
		if (body.length > 0) {

			body.map((line) => line.trim()).forEach((line) => {

				if (line.startsWith('assert(')) {
					length++;
				}

			});

		}

	} else if (typeof data === 'number') {

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

		if (typeof result === 'boolean' || result === null) {
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

	}

};

