
import process from 'process';



export const console = (function() {

	const PALETTE = {
		'Boolean':  38,
		'Keyword': 204,
		'Literal': 174,
		'Number':  197,
		'String':   77,
		'Type':    174
	};

	const highlight = function(str, type) {

		let color = PALETTE[type] || null;
		if (color !== null) {
			return '\u001b[38;5;' + color + 'm' + str + '\u001b[39m';
		} else {
			return str;
		}

	};

	const isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};

	const isBuffer = function(buffer) {

		if (buffer instanceof Buffer) {
			return true;
		} else if (Object.prototype.toString.call(buffer) === '[object Buffer]') {
			return true;
		} else if (Object.prototype.toString.call(buffer) === '[object Uint8Array]') {
			return true;
		}


		return false;

	};

	const isDate = function(dat) {
		return Object.prototype.toString.call(dat) === '[object Date]';
	};

	const isError = function(obj) {
		return Object.prototype.toString.call(obj).includes('Error');
	};

	const isFunction = function(fun) {
		return Object.prototype.toString.call(fun) === '[object Function]';
	};

	const isMatrix = function(obj) {

		if (isArray(obj) === true && obj.length > 4) {

			let check = obj.filter((v) => isNumber(v));
			if (check.length === obj.length) {

				let dim = Math.floor(Math.sqrt(obj.length));
				if (dim * dim === obj.length) {
					return true;
				}

			}

		}

		return false;

	};

	const isNumber = function(num) {
		return Object.prototype.toString.call(num) === '[object Number]';
	};

	const isObject = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	};

	const isString = function(str) {
		return Object.prototype.toString.call(str) === '[object String]';
	};

	const INDENT      = '    ';
	const WHITESPACE  = new Array(512).fill(' ').join('');
	const format_date = (n) => (n < 10 ? '0' + n : '' + n);

	const cleanify = function(raw) {

		let str = '';

		for (let r = 0, rl = raw.length; r < rl; r++) {

			let code = raw.charCodeAt(r);
			if (code === 9) {
				str += '\\t';
			} else if (code === 10) {
				str += '\\n';
			} else if (code === 13) {
				str += '\\r';
			} else if (code === 27) {

				if (raw[r + 1] === '[') {

					let index = raw.indexOf('m', r + 2);
					if (index !== -1) {
						r = index;
					}

				}

			} else if (code >= 32 && code <= 127) {
				str += raw.charAt(r);
			}

		}

		str = str.split('\r').join('\\r');
		str = str.split('\n').join('\\n');

		return str;

	};

	const stringify = function(data, indent) {

		indent = isString(indent) ? indent : '';


		let str = '';

		if (
			typeof data === 'boolean'
			|| data === null
			|| data === undefined
			|| (
				typeof data === 'number'
				&& (
					data === Infinity
					|| data === -Infinity
					|| Number.isNaN(data) === true
				)
			)
		) {

			if (data === null) {
				str = indent + highlight('null', 'Keyword');
			} else if (data === undefined) {
				str = indent + highlight('undefined', 'Keyword');
			} else if (data === false) {
				str = indent + highlight('false', 'Boolean');
			} else if (data === true) {
				str = indent + highlight('true', 'Boolean');
			} else if (data === Infinity) {
				str = indent + highlight('Infinity', 'Keyword');
			} else if (data === -Infinity) {
				str = indent + highlight('-Infinity', 'Keyword');
			} else if (Number.isNaN(data) === true) {
				str = indent + highlight('NaN', 'Number');
			}

		} else if (isError(data) === true) {

			let type = Object.prototype.toString.call(data);
			if (type.startsWith('[object') && type.endsWith(']')) {
				type = type.substr(7, type.length - 8).trim();
			}

			let msg   = (data.message || '').trim();
			let stack = (data.stack   || '').trim().split('\n');

			if (msg.length > 0 && stack.length > 0) {

				let origin = null;

				for (let s = 0, sl = stack.length; s < sl; s++) {

					let line = stack[s].trim();
					if (line.includes('(file://') && line.includes(')')) {

						let tmp = line.split('(file://')[1].split(')').shift().trim();
						if (tmp.includes('.mjs')) {
							origin = tmp;
							break;
						}

					}

				}

				str = indent + highlight(type, 'Keyword') + ': ' + highlight('"' + msg + '"', 'String') + '\n';

				if (origin !== null) {
					str += origin;
				}

			} else if (msg.length > 0) {

				str = indent + highlight(type, 'Keyword') + ': ' + highlight('"' + msg + '"', 'String') + '\n';

			}

		} else if (isNumber(data) === true) {

			str = indent + highlight(data.toString(), 'Number');

		} else if (isString(data) === true) {

			str = indent + highlight('"' + cleanify(data) + '"', 'String');

		} else if (isFunction(data) === true) {

			str = '';

			let lines = data.toString().split('\n');

			for (let l = 0, ll = lines.length; l < ll; l++) {

				let line = lines[l];

				if (l > 0 && l < ll - 1) {


					// TODO: Replace trim() with correctly indented \t before


					str += indent + '\t' + line.trim();

				} else {
					str += indent + line.trim();
				}

				if (l < ll - 1) {
					str += '\n';
				}

			}

			str += '\n';

		} else if (isArray(data) === true) {

			if (data.length === 0) {

				str = indent + highlight('[]', 'Literal');

			} else if (isMatrix(data) === true) {

				str  = indent;
				str += highlight('[', 'Literal') + '\n';

				let line = Math.floor(Math.sqrt(data.length));
				let max  = data.reduce((a, b) => Math.max((' ' + a).length, ('' + b).length), '');

				for (let d = 0, dl = data.length; d < dl; d++) {

					let margin = (max - ('' + data[d]).length);

					if (d % line === 0) {

						if (d > 0) {
							str += '\n';
						}

						str += stringify(data[d], '\t' + indent + WHITESPACE.substr(0, margin));

					} else {

						str += WHITESPACE.substr(0, margin);
						str += stringify(data[d]);

					}

					if (d < dl - 1) {
						str += ', ';
					} else {
						str += '  ';
					}

				}

				str += '\n' + indent + highlight(']', 'Literal');

			} else {

				str  = indent;
				str += highlight('[', 'Literal') + '\n';

				for (let d = 0, dl = data.length; d < dl; d++) {

					str += stringify(data[d], '\t' + indent);

					if (d < dl - 1) {
						str += ',';
					}

					str += '\n';

				}

				str += indent + highlight(']', 'Literal');

			}

		} else if (isBuffer(data) === true) {

			str  = indent;
			str += highlight('Buffer', 'Type') + '.from(';

			let tmp = cleanify(data.toString('utf8'));
			if (tmp.length > 0) {
				str += highlight('"' + tmp + '"', 'String');
			}

			str += ', ' + highlight('"utf8"', 'String') + ')';

		} else if (isDate(data) === true) {

			str  = indent;

			str += data.getUTCFullYear()               + '-';
			str += format_date(data.getUTCMonth() + 1) + '-';
			str += format_date(data.getUTCDate())      + 'T';
			str += format_date(data.getUTCHours())     + ':';
			str += format_date(data.getUTCMinutes())   + ':';
			str += format_date(data.getUTCSeconds())   + 'Z';

		} else if (data[Symbol.toStringTag] !== undefined && typeof data.toJSON === 'function') {

			let json = data.toJSON();
			if (
				isObject(json) === true
				&& isString(json.type) === true
				&& isObject(json.data) === true
			) {

				str  = indent;
				str += highlight(json.type, 'Type') + '.from(' + highlight('{', 'Literal') + '\n';

				let keys = Object.keys(json);
				for (let k = 0, kl = keys.length; k < kl; k++) {

					let key = keys[k];

					str += '\t' + indent + highlight('"' + key + '"', 'String') + ': ';
					str += stringify(json[key], '\t' + indent).trim();

					if (k < kl - 1) {
						str += ',';
					}

					str += '\n';

				}

				str += indent + highlight('}', 'Literal') + ')';

			} else {

				let keys = Object.keys(data);
				if (keys.length === 0) {

					str = indent + highlight('{}', 'Literal');

				} else {

					str  = indent;
					str += highlight('{', 'Literal') + '\n';

					for (let k = 0, kl = keys.length; k < kl; k++) {

						let key = keys[k];

						str += '\t' + indent + highlight('"' + key + '"', 'String') + ': ';
						str += stringify(data[key], '\t' + indent).trim();

						if (k < kl - 1) {
							str += ',';
						}

						str += '\n';

					}

					str += indent + highlight('}', 'Literal');

				}

			}

		} else if (isObject(data) || data[Symbol.toStringTag] !== undefined) {

			let keys = Object.keys(data);
			if (keys.length === 0) {

				str = indent + highlight('{}', 'Literal');

			} else {

				str  = indent;

				if (data[Symbol.toStringTag] !== undefined) {
					str += '(' + highlight(data[Symbol.toStringTag] + 'Type') + ') ';
				}

				str += highlight('{', 'Literal') + '\n';

				for (let k = 0, kl = keys.length; k < kl; k++) {

					let key = keys[k];

					str += '\t' + indent + highlight('"' + key + '"', 'String') + ': ';
					str += stringify(data[key], '\t' + indent).trim();

					if (k < kl - 1) {
						str += ',';
					}

					str += '\n';

				}

				str += indent + highlight('}', 'Literal');

			}

		}


		return str;

	};

	const stringify_arguments = function(args, color) {

		color = isString(color) ? color : ('' + color).trim();

		if (args.length === 2 && isString(args[1]) === true) {

			return '\u001b[' + color + 'm' + args[0] + ' ' + args[1] + '\u001b[K\u001b[0m\n';

		} else {

			let chunks    = args.slice(1).map((value) => stringify(value));
			let multiline = chunks.find((value) => value.includes('\n')) !== undefined;
			if (multiline === true) {

				let lines = [];

				if (color !== '') {
					lines.push('\u001b[' + color + 'm' + args[0] + '\u001b[K');
				} else {
					lines.push(args[0]);
				}

				chunks.forEach((raw) => {

					raw.split('\n').forEach((line) => {

						if (line.includes('\t')) {
							line = line.split('\t').join(INDENT);
						}

						if (line.includes('\r')) {
							line = line.split('\r').join('\\r');
						}

						if (color !== '') {
							lines.push('\u001b[' + color + 'm' + line + '\u001b[K');
						} else {
							lines.push(line);
						}

					});

				});

				return lines.join('\n') + '\u001b[0m\n';

			} else {

				if (color !== '') {
					return '\u001b[' + color + 'm' + args[0] + ' ' + chunks.join(', ') + '\u001b[K\u001b[0m\n';
				} else {
					return args[0] + ' ' + chunks.join(', ') + '\u001b[0m\n';
				}

			}

		}

	};

	const BLINK = {
		colors:   [
			16, 17, 18, 19, 20,
			21, 27, 33, 39, 45,
			45, 39, 33, 27, 21,
			20, 19, 18, 17, 16
		],
		index:    0,
		interval: null
	};

	const blink = function() {

		let al   = arguments.length;
		let args = [ '(!)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		if (BLINK.interval === null) {

			BLINK.interval = setInterval(() => {
				BLINK.index++;
			}, (1000 / BLINK.colors.length) * 2);

		}


		let color = BLINK.colors[BLINK.index % BLINK.colors.length] || null;
		if (color !== null) {
			process.stdout.write(stringify_arguments(args, '48;5;' + color));
		} else {
			process.stdout.write(stringify_arguments(args, 40));
		}

	};

	const clear = function(partial) {

		partial = typeof partial === 'boolean' ? partial : false;


		if (partial === true) {

			process.stdout.moveCursor(null, -1);
			process.stdout.clearLine(1);

		} else {

			// clear screen and reset cursor
			process.stdout.write('\x1B[2J\x1B[0f');

			// clear scroll buffer
			process.stdout.write('\u001b[3J');

		}

	};

	const debug = function() {

		let al   = arguments.length;
		let args = [ '(E)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		process.stdout.write(stringify_arguments(args, 41));

	};

	const compare = function(str1, str2) {

		let result = {
			start: '',
			end:   ''
		};

		for (let s = 0, sl = Math.max(str1.length, str2.length); s < sl; s++) {

			if (str1[s] === str2[s]) {
				result.start = result.start + str1[s];
			} else {
				break;
			}

		}

		for (let s = 0; s < Math.min(str2.length, str1.length); s++) {

			if (str1[str1.length - 1 - s] === str2[str2.length - 1 - s]) {
				result.end = str1[str1.length - 1 - s] + result.end;
			} else {
				break;
			}

		}

		return result;

	};

	const diff = function() {

		if (arguments.length === 2) {

			let obj_a  = JSON.stringify(arguments[0], null, '\t').split('\t').join(INDENT).split('\n');
			let obj_b  = JSON.stringify(arguments[1], null, '\t').split('\t').join(INDENT).split('\n');
			let result = [];

			if (obj_a.length > obj_b.length) {

				let new_b = new Array(obj_a.length).fill(null);
				let tmp_a = obj_a.slice();
				let div_a = 0;

				for (let a = 0; a < tmp_a.length; a++) {

					let line_a = tmp_a[tmp_a.length - 1 - a];
					let line_b = obj_b[obj_b.length - 1 - a];

					if (line_a === line_b) {
						new_b[new_b.length - 1 - a] = line_a;
					} else {
						div_a = obj_b.length - 1 - a;
						break;
					}

				}

				for (let a = 0; a <= div_a; a++) {
					new_b[a] = obj_b[a];
				}

				obj_b = new_b;

			} else if (obj_b.length > obj_a.length) {

				let new_a = new Array(obj_b.length).fill(null);
				let tmp_b = obj_b.slice();
				let div_b = 0;

				for (let b = 0; b < tmp_b.length; b++) {

					let line_a = obj_a[obj_a.length - 1 - b];
					let line_b = tmp_b[tmp_b.length - 1 - b];

					if (line_a === line_b) {
						new_a[new_a.length - 1 - b] = line_b;
					} else {
						div_b = obj_a.length - 1 - b;
						break;
					}

				}

				for (let b = 0; b <= div_b; b++) {
					new_a[b] = obj_a[b];
				}

				obj_a = new_a;

			}

			for (let l = 0, ll = Math.max(obj_a.length, obj_b.length); l < ll; l++) {

				let line_a = obj_a[l];
				let line_b = obj_b[l];

				if (line_a === null) {
					result.push([ '+', '', line_b ]);
				} else if (line_b === null) {
					result.push([ '-', line_a, '' ]);
				} else if (line_a === line_b) {
					result.push([ '', line_a, line_b ]);
				} else {
					result.push([ '-+', line_a, line_b ]);
				}

			}

			let max = 0;

			result.forEach((values) => {
				max = Math.max(max, values[1].length, values[2].length);
			});

			result.forEach((values) => {

				let op     = values[0];
				let l_line = values[1];
				let r_line = values[2];
				let l_div  = WHITESPACE.substr(0, max - l_line.length);
				let r_div  = WHITESPACE.substr(0, max - r_line.length);

				if (op === '') {
					process.stdout.write('\u001b[40m' + l_line + l_div + '\u001b[40m' + r_line + r_div + ' \u001b[K\u001b[0m\n');
				} else if (op === '+') {
					process.stdout.write('\u001b[40m' + l_div + '\u001b[42m' + r_line + '\u001b[40m' + r_div + '\u001b[0m\n');
				} else if (op === '-') {
					process.stdout.write('\u001b[41m' + l_line + '\u001b[40m' + l_div + r_div + '\u001b[0m\n');
				} else if (op === '-+') {

					let same = compare(l_line, r_line);
					let temp = '';

					temp += '\u001b[40m' + l_line.substr(0, same.start.length);
					temp += '\u001b[41m' + l_line.substr(same.start.length, l_line.length - same.start.length - same.end.length);
					temp += '\u001b[40m' + l_line.substr(l_line.length - same.end.length);
					temp += l_div;
					temp += r_line.substr(0, same.start.length);
					temp += '\u001b[42m' + r_line.substr(same.start.length, r_line.length - same.start.length - same.end.length);
					temp += '\u001b[40m' + r_line.substr(r_line.length - same.end.length);
					temp += r_div;
					temp += '\u001b[0m\n';

					process.stdout.write(temp);

				}

			});

		}

	};

	const error = function() {

		let al   = arguments.length;
		let args = [ '(E)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		process.stdout.write(stringify_arguments(args, 41));

	};

	const info = function() {

		let al   = arguments.length;
		let args = [ '(I)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		process.stdout.write(stringify_arguments(args, 42));

	};

	const log = function() {

		let al   = arguments.length;
		let args = [ '(L)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		process.stdout.write(stringify_arguments(args, 40));

	};

	const warn = function() {

		let al   = arguments.length;
		let args = [ '(W)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		process.stdout.write(stringify_arguments(args, 43));

	};



	const console = {
		blink: blink,
		clear: clear,
		debug: debug,
		diff:  diff,
		error: error,
		info:  info,
		log:   log,
		warn:  warn
	};


	return console;

})();

