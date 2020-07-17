
import { isArray, isFunction, isNumber } from '../extern/base.mjs';



export const isTimeline = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Timeline]';
};

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



const Timeline = function(length) {

	length = isNumber(length) ? length : 0;


	this.data   = new Array(length).fill(null);
	this.index  = 0;
	this.length = length;
	this.start  = null;

};


Timeline.isTimeline = isTimeline;


Timeline.from = function(data) {

	if (isFunction(data) === true) {

		let length = 0;
		let body   = data.toString().split('\n').slice(1, -1);

		if (body.length > 0) {

			body.map((line) => line.trim()).forEach((line) => {

				if (line.startsWith('assert(')) {
					length++;
				}

			});

		}

		return new Timeline(length);

	} else if (isArray(data) === true) {

		let length   = data.length;
		let timeline = new Timeline(length);

		data.forEach((value, d) => {

			if (isNumber(value) === true) {
				timeline.data[d] = value;
			} else {
				timeline.data[d] = null;
			}

		});

		return timeline;

	} else if (isNumber(data) === true) {

		if (Number.isNaN(data) === false) {
			return new Timeline((data | 0));
		}

	}


	return new Timeline(0);

};


Timeline.prototype = {

	[Symbol.toStringTag]: 'Timeline',

	toJSON: function() {

		return {
			'type': 'Timeline',
			'data': this.data.slice()
		};

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

	progress: function() {

		if (this.start !== null) {
			return Date.now() - this.start;
		}


		return 0;

	},

	includes: function(time) {

		if (isNumber(time) === true || time === null) {
			return this.data.includes(time);
		}

		return false;

	},

	render: function() {

		let str = '';

		if (this.data.length > 0) {

			str += '|';

			for (let d = 0, dl = this.data.length; d < dl; d++) {

				let time = this.data[d];
				if (time !== null) {
					str += prettify(time);
				} else if (time === null) {
					str += '  ?  ';
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

	reset: function() {

		for (let d = 0, dl = this.data.length; d < dl; d++) {
			this.data[d] = null;
		}

		this.index = 0;
		this.start = null;

	},

	time: function() {

		if (this.start === null) {

			this.start = Date.now();

		} else {

			if (this.index < this.data.length) {
				this.data[this.index] = (Date.now() - this.start);
				this.index++;
			}

		}

	}

};


export { Timeline };

