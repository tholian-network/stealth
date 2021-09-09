
import { isArray, isFunction, isNumber, isObject, isString } from '../extern/base.mjs';



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

const trace_reference = function() {

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

			if (line !== null) {
				line = parseInt(line, 10);
			}

			if (
				file !== null
				&& file.endsWith('.mjs') === true
				&& line !== null
				&& Number.isNaN(line) === false
			) {

				return {
					file: file,
					line: line
				};

			}

		}

	}


	return null;

};



const Timeline = function(stack) {

	stack = isArray(stack) ? stack : [];


	this.count  = null;
	this.data   = new Array(stack.length).fill(null);
	this.length = stack.length;
	this.stack  = stack;
	this.start  = null;


	if (stack.length > 0) {

		if (stack[0].code === null) {
			this.count = 0;
		}

	}

};


Timeline.isTimeline = isTimeline;


Timeline.from = function(func, link) {

	if (
		isFunction(func) === true
		&& isObject(link) === true
		&& isString(link.file) === true
		&& isNumber(link.line) === true
	) {

		let body  = func.toString().split('\n').slice(1, -1);
		let stack = [];

		if (body.length > 0) {

			body.map((line) => line.trim()).forEach((line, l) => {

				if (line.startsWith('assert(') === true) {

					stack.push({
						code: line,
						file: link.file,
						line: link.line + (l + 1)
					});

				}

			});

		}

		return new Timeline(stack);

	} else if (isNumber(func) === true) {

		let stack = [];

		for (let s = 0; s < func; s++) {

			stack.push({
				code: null,
				file: null,
				line: (s + 1)
			});

		}

		return new Timeline(stack);

	}


	return null;

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

		let complete = true;

		for (let s = 0, sl = this.stack.length; s < sl; s++) {

			if (this.data[s] === null) {
				complete = false;
				break;
			}

		}

		return complete;

	},

	current: function() {

		let index = null;

		if (this.count !== null) {
			index = this.count;
		} else {
			index = this.stack.findIndex((entry, e) => {
				return this.data[e] === null;
			}) || null;
		}

		return index;

	},

	progress: function() {

		if (this.start !== null) {
			return Date.now() - this.start;
		}


		return 0;

	},

	includes: function(time) {

		if (isNumber(time) === true || time === null) {

			if (this.data.includes(time) === true) {
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

		if (this.count !== null) {
			this.count = 0;
		}

		this.start = null;

	},

	time: function() {

		if (this.start === null) {

			this.start = Date.now();

		} else {

			let entry = null;
			let index = -1;
			let link  = trace_reference();

			if (link !== null) {

				index = this.stack.findIndex((other) => {

					if (
						other.file === link.file
						&& other.line === link.line
					) {
						return true;
					}

					return false;

				});

			}


			if (index !== -1) {

				// Timeline.from(Function) Mode
				entry = this.stack[index];

			} else if (this.count !== null) {

				// Timeline.from(Number) Mode
				index = this.count;
				entry = this.stack[index];

				this.count++;

			}


			if (
				entry !== null
				&& index !== -1
				&& this.data[index] === null
			) {

				this.data[index] = (Date.now() - this.start);

			} else if (
				entry !== null
				&& index !== -1
				&& this.data[index] !== null
			) {

				// Results already throwing a SyntaxError

			}

		}

	}

};


export { Timeline };

