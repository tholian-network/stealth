
const prettify = (milliseconds) => {

	if (milliseconds < 10) {
		return '  ' + milliseconds + 'ms';
	} else if (milliseconds < 100) {
		return ' ' + milliseconds + 'ms';
	} else if (milliseconds < 1000) {
		return milliseconds + 'ms';
	} else {

		let seconds = Math.round(milliseconds / 1000);
		if (seconds < 10) {
			return '  ' + seconds + 's ';
		} else if (seconds < 100) {
			return ' ' + seconds + 's ';
		}

	}

	return '  ?  ';

};



export const Timeline = function(length) {

	length = typeof length === 'number' ? length : 0;


	this.data   = new Array(length).fill(null);
	this.index  = 0;
	this.length = length;
	this.start  = null;

};


Timeline.from = function(data) {

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


	return new Timeline(length);

};


Timeline.prototype = {

	complete: function() {

		if (this.index < this.data.length) {
			return false;
		}

		return true;

	},

	current: function() {

		return this.index;

	},

	progress: function() {

		if (this.start !== null) {
			return Date.now() - this.start;
		}


		return 0;

	},

	includes: function(time) {

		if (typeof time === 'number' || time === null) {
			return this.data.includes(time);
		}

		return false;

	},

	render: function() {

		let start = this.start;
		let str   = '';

		if (start !== null && this.data.length > 0) {

			str += '|';

			for (let d = 0, dl = this.data.length; d < dl; d++) {

				let now = this.data[d];
				if (now === null) {
					str  += '  ?  ';
					start = now;
				} else if (start === null) {
					str  += '  ?  ';
					start = now;
				} else if (start !== null) {
					str  += prettify(now - start);
					start = now;
				}

				if (d < dl - 1) {
					str += '|';
				}

			}

			str += '|';

		} else {

			str += '| no assert() calls |';

		}

		return str;

	},

	time: function(reset) {

		reset = typeof reset === 'boolean' ? reset : false;


		if (reset === true) {

			this.index = 0;
			this.start = Date.now();

			for (let d = 0, dl = this.data.length; d < dl; d++) {
				this.data[d] = null;
			}

		} else {

			if (this.index < this.data.length) {
				this.data[this.index] = Date.now();
				this.index++;
			}

		}

	}

};

