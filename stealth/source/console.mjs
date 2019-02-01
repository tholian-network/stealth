
import process from 'process';



const _INDENT     = '    ';
const _WHITESPACE = new Array(512).fill(' ').join('');

const _format_date = function(n) {
	return n < 10 ? '0' + n : '' + n;
};

const _stringify = function(data, indent) {

	indent = typeof indent === 'string' ? indent : '';


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
				|| isNaN(data) === true
			)
		)
	) {

		if (data === null) {
			str = indent + 'null';
		} else if (data === undefined) {
			str = indent + 'undefined';
		} else if (data === false) {
			str = indent + 'false';
		} else if (data === true) {
			str = indent + 'true';
		} else if (data === Infinity) {
			str = indent + 'Infinity';
		} else if (data === -Infinity) {
			str = indent + '-Infinity';
		} else if (isNaN(data) === true) {
			str = indent + 'NaN';
		}

	} else if (typeof data === 'number') {

		str = indent + data.toString();

	} else if (typeof data === 'string') {

		str = indent + '"' + data + '"';

	} else if (typeof data === 'function') {

		let body   = data.toString().split('\n');
		let offset = 0;

		let first = body.find(ch => ch.startsWith('\t')) || null;
		if (first !== null) {

			let check = /(^\t+)/g.exec(first);
			if (check !== null) {
				offset = Math.max(0, check[0].length - indent.length);
			}

		}


		for (let b = 0, bl = body.length; b < bl; b++) {

			let line = body[b];
			if (line.startsWith('\t')) {
				str += indent + line.substr(offset);
			} else {
				str += indent + line;
			}

			str += '\n';

		}

	} else if (data instanceof Array) {

		let is_primitive = data.find(val => val instanceof Object || typeof val === 'function') === undefined;
		let dimension    = Math.sqrt(data.length, 2);
		let is_matrix    = dimension === (dimension | 0);

		if (data.length === 0) {

			str = indent + '[]';

		} else if (is_primitive === true && is_matrix === true) {

			let max = 0;

			for (let d = 0, dl = data.length; d < dl; d++) {
				max = Math.max(max, (data[d]).toString().length);
			}


			str  = indent;
			str += '[\n';

			for (let y = 0; y < dimension; y++) {

				str += '\t' + indent;

				for (let x = 0; x < dimension; x++) {

					let tmp = (data[x + y * dimension]).toString();
					if (tmp.length < max) {
						str += _WHITESPACE.substr(0, max - tmp.length);
					}

					str += tmp;

					if (x < dimension - 1) {
						str += ', ';
					}

				}

				if (y < dimension - 1) {
					str += ',';
				}

				str += '\n';

			}

			str += indent + ']';

		} else if (is_primitive === true) {

			str  = indent;
			str += '[';

			for (let d = 0, dl = data.length; d < dl; d++) {

				if (d === 0) {
					str += ' ';
				}

				str += _stringify(data[d]);

				if (d < dl - 1) {
					str += ', ';
				} else {
					str += ' ';
				}

			}

			str += ']';

		} else {

			str  = indent;
			str += '[\n';

			for (let d = 0, dl = data.length; d < dl; d++) {

				str += _stringify(data[d], '\t' + indent);

				if (d < dl - 1) {
					str += ',';
				}

				str += '\n';

			}

			str += indent + ']';

		}

	} else if (data instanceof Date) {

		str  = indent;

		str += data.getUTCFullYear()                + '-';
		str += _format_date(data.getUTCMonth() + 1) + '-';
		str += _format_date(data.getUTCDate())      + 'T';
		str += _format_date(data.getUTCHours())     + ':';
		str += _format_date(data.getUTCMinutes())   + ':';
		str += _format_date(data.getUTCSeconds())   + 'Z';

	} else if (data instanceof Object) {

		let keys = Object.keys(data);
		if (keys.length === 0) {

			str = indent + '{}';

		} else {

			str  = indent;
			str += '{\n';

			for (let k = 0, kl = keys.length; k < kl; k++) {

				let key = keys[k];

				str += '\t' + indent + '"' + key + '": ';
				str += _stringify(data[key], '\t' + indent).trim();

				if (k < kl - 1) {
					str += ',';
				}

				str += '\n';

			}

			str += indent + '}';

		}

	}


	return str;

};

const _args_to_string = function(args) {

	let output  = [];
	let columns = process.stdout.columns;

	for (let a = 0, al = args.length; a < al; a++) {

		let value = args[a];
		let o     = 0;

		if (typeof value === 'function') {

			let tmp = (value).toString().split('\n');

			for (let t = 0, tl = tmp.length; t < tl; t++) {
				output.push(tmp[t].replace(/\t/g, _INDENT));
			}

			o = output.length - 1;

		} else if (value instanceof Object) {

			let tmp = _stringify(value).split('\n');
			if (tmp.length > 1) {

				for (let t = 0, tl = tmp.length; t < tl; t++) {
					output.push(tmp[t].replace(/\t/g, _INDENT));
				}

				o = output.length - 1;

			} else {

				let chunk = output[o];
				if (chunk === undefined) {
					output[o] = tmp[0].trim();
				} else {
					output[o] = (chunk + ' ' + tmp[0]).trim();
				}

			}

		} else if (typeof value === 'string' && value.includes('\n')) {

			let tmp = value.split('\n');

			for (let t = 0, tl = tmp.length; t < tl; t++) {
				output.push(tmp[t].replace(/\t/g, _INDENT));
			}

			o = output.length - 1;

		} else {

			let chunk = output[o];
			if (chunk === undefined) {
				output[o] = ('' + value).replace(/\t/g, _INDENT).trim();
			} else {
				output[o] = (chunk + (' ' + value).replace(/\t/g, _INDENT)).trim();
			}

		}

	}


	let ol = output.length;
	if (ol > 1) {

		for (let o = 0; o < ol; o++) {

			let line = output[o];
			let maxl = (o === 0 || o === ol - 1) ? (columns - 1) : columns;
			if (line.length > maxl) {
				output[o] = line.substr(0, maxl);
			} else {
				output[o] = line + _WHITESPACE.substr(0, maxl - line.length);
			}

		}

		return output.join('\n');

	} else {

		let line = output[0];
		let maxl = columns - 2;
		if (line.length > maxl) {
			line = line.substr(0, maxl);
		} else {
			line = line + _WHITESPACE.substr(0, maxl - line.length);
		}

		return line;

	}

};




export const clear = function() {

	// clear screen and reset cursor
	process.stdout.write('\x1B[2J\x1B[0f');

	// clear scroll buffer
	process.stdout.write('\u001b[3J');

};

export const info = function() {

	let al   = arguments.length;
	let args = [ '(I)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[42m\u001b[97m ' + _args_to_string(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

export const log = function() {

	let al   = arguments.length;
	let args = [ '(L)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[49m\u001b[97m ' + _args_to_string(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

export const warn = function() {

	let al   = arguments.length;
	let args = [ '(W)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[43m\u001b[97m ' + _args_to_string(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

export const error = function() {

	let al   = arguments.length;
	let args = [ '(E)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stderr.write('\u001b[41m\u001b[97m ' + _args_to_string(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};


export const console = {
	clear: clear,
	log:   log,
	info:  info,
	warn:  warn,
	error: error
};


export default console;

