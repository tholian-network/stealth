
import process from 'process';

import { isArray, isBuffer, isDate, isFunction, isNumber, isObject, isString } from './BASE.mjs';



const isMatrix = function(value) {

	if (isArray(value)) {

		return value.find((v) => {
			return (isArray(v) || isFunction(v) || isObject(v));
		}) === undefined;

	}

	return false;

};

const INDENT      = '    ';
const WHITESPACE  = new Array(512).fill(' ').join('');
const format_date = (n) => (n < 10 ? '0' + n : '' + n);

const cleanify = function(raw) {

	let str = '';

	for (let r = 0, rl = raw.length; r < rl; r++) {

		if (raw.charCodeAt(r) <= 127) {
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

	} else if (isNumber(data)) {

		str = indent + data.toString();

	} else if (isString(data)) {

		str = indent + '"' + data + '"';

	} else if (isFunction(data)) {

		let body   = data.toString().split('\n');
		let offset = 0;

		let first = body.find((ch) => ch.startsWith('\t')) || null;
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

	} else if (isArray(data)) {


		if (data.length === 0) {

			str = indent + '[]';

		} else if (isMatrix(data)) {

			str  = indent;
			str += '[';

			for (let d = 0, dl = data.length; d < dl; d++) {

				if (d === 0) {
					str += ' ';
				}

				str += stringify(data[d]);

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

				str += stringify(data[d], '\t' + indent);

				if (d < dl - 1) {
					str += ',';
				}

				str += '\n';

			}

			str += indent + ']';

		}

	} else if (isBuffer(data)) {

		str  = indent;
		str += 'Buffer.from(\'';

		let tmp = cleanify(data.toString('utf8'));
		if (tmp.length > 0) {
			str += tmp;
		}

		str += '\', \'utf8\')';

	} else if (isDate(data)) {

		str  = indent;

		str += data.getUTCFullYear()               + '-';
		str += format_date(data.getUTCMonth() + 1) + '-';
		str += format_date(data.getUTCDate())      + 'T';
		str += format_date(data.getUTCHours())     + ':';
		str += format_date(data.getUTCMinutes())   + ':';
		str += format_date(data.getUTCSeconds())   + 'Z';

	} else if (isObject(data)) {

		let keys = Object.keys(data);
		if (keys.length === 0) {

			str = indent + '{}';

		} else {

			str  = indent;
			str += '{\n';

			for (let k = 0, kl = keys.length; k < kl; k++) {

				let key = keys[k];

				str += '\t' + indent + '"' + key + '": ';
				str += stringify(data[key], '\t' + indent).trim();

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

const stringify_arguments = function(args) {

	let output  = [];
	let columns = process.stdout.columns;

	for (let a = 0, al = args.length; a < al; a++) {

		let value = args[a];
		let o     = 0;

		if (isFunction(value) === true) {

			let tmp = (value).toString().split('\n');

			for (let t = 0, tl = tmp.length; t < tl; t++) {
				output.push(tmp[t].replace(/\t/g, INDENT));
			}

			o = output.length - 1;

		} else if (isArray(value) === true || isObject(value) === true) {

			let tmp = stringify(value).split('\n');
			if (tmp.length > 1) {

				for (let t = 0, tl = tmp.length; t < tl; t++) {
					output.push(tmp[t].replace(/\t/g, INDENT));
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

		} else if (isString(value) === true && value.includes('\n')) {

			let tmp = value.split('\r\n').join('\\r\\n').split('\n');

			for (let t = 0, tl = tmp.length; t < tl; t++) {
				output.push(tmp[t].replace(/\t/g, INDENT));
			}

			o = output.length - 1;

		} else {

			let chunk = output[o];
			if (chunk === undefined) {
				output[o] = ('' + value).replace(/\t/g, INDENT).trim();
			} else {
				output[o] = (chunk + (' ' + value).replace(/\t/g, INDENT)).trim();
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
				output[o] = line + WHITESPACE.substr(0, maxl - line.length);
			}

		}

		return output.join('\n');

	} else {

		let line = output[0];
		let maxl = columns - 2;
		if (line.length > maxl) {
			line = line.substr(0, maxl);
		} else {
			line = line + WHITESPACE.substr(0, maxl - line.length);
		}

		return line;

	}

};



export const clear = function(partial) {

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

export const debug = function() {

	let al   = arguments.length;
	let args = [ '(E)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stderr.write('\u001b[41m\u001b[97m ' + stringify_arguments(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

export const error = function() {

	let al   = arguments.length;
	let args = [ '(E)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stderr.write('\u001b[41m\u001b[97m ' + stringify_arguments(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

export const info = function() {

	let al   = arguments.length;
	let args = [ '(I)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[42m\u001b[97m ' + stringify_arguments(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

export const log = function() {

	let al   = arguments.length;
	let args = [ '(L)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[49m\u001b[97m ' + stringify_arguments(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

export const warn = function() {

	let al   = arguments.length;
	let args = [ '(W)' ];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[43m\u001b[97m ' + stringify_arguments(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

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

export const blink = function() {

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
		process.stdout.write('\u001b[48;5;' + color + 'm\u001b[97m ' + stringify_arguments(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');
	} else {
		process.stdout.write('\u001b[49m\u001b[97m ' + stringify_arguments(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');
	}

};



export const console = {

	blink: blink,
	clear: clear,
	debug: debug,
	error: error,
	info:  info,
	log:   log,
	warn:  warn

};


export default console;

