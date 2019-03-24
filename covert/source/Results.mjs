
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

	assert: function(result) {

		if (this.index < this.data.length) {
			this.data[this.index] = result;
			this.index++;
		}

	},

	complete: function() {

		if (this.index < this.data.length) {
			return false;
		}

		return true;

	},

	render: function() {

		let str = '';

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

		return str;

	}

};

