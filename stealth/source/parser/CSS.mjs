
import { isArray, isBuffer, isNumber, isObject, isString } from '../BASE.mjs';
import { COLORS                                          } from './CSS/COLORS.mjs';
import { NORMAL                                          } from './CSS/NORMAL.mjs';
import { SHORTHAND                                       } from './CSS/SHORTHAND.mjs';



const ALPHABET   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const OPERATORS  = [ '+', '-', '*', '/', ',' ];
const MINIFY_MAP = {
	'\t': ' ',
	'\n': '',
	'{ ': '{',
	' {': '{',
	' }': '}',
	'} ': '}',
	': ': ':',
	' :': ':',
	', ': ',',
	' ,': ',',
	'* ': '*',
	' *': '*',
	'/ ': '/',
	' /': '/',
	'- ': '-',
	' -': '-',
	'+ ': '+',
	' +': '+'
};

const minify_css = function(str) {

	Object.keys(MINIFY_MAP).forEach((key) => {

		let index = str.indexOf(key);
		let val   = MINIFY_MAP[key];

		while (index !== -1) {
			str   = str.substr(0, index) + val + str.substr(index + key.length);
			index = str.indexOf(key, index + val.length);
		}

	});


	let dbl = str.indexOf('  ');

	while (dbl !== -1) {
		str = str.substr(0, dbl) + ' ' + str.substr(dbl + 2);
		dbl = str.indexOf('  ', dbl);
	}


	str = strip_comments(str.trim());


	return str;

};

export const clone = function(object) {
	return JSON.parse(JSON.stringify(object));
};

export const filter = function(search, limit) {

	search = isObject(search) ? search : {};
	limit  = isObject(limit)  ? limit  : { min: 0, max: 1 };


	let result = [];
	let values = this;
	if (values.length > 0) {

		let min = isNumber(limit.min) ? limit.min : 1;
		let max = isNumber(limit.max) ? limit.max : 1;

		for (let v = 0, vl = values.length; v < vl; v++) {

			let value = values[v];
			let valid = false;

			for (let key in search) {

				let val = value[key];
				if (val !== null && isString(val)) {

					if (search[key].includes(val)) {
						valid = true;
						break;
					}

				}

			}

			if (valid === true) {
				result.push(value);
			}

			if (result.length >= max) {
				break;
			}

		}

		if (result.length >= min && result.length <= max) {

			result.forEach((other) => {

				let index = values.indexOf(other);
				if (index !== -1) {
					values.splice(index, 1);
				}

			});

		}

	}


	return result;

};

export const has = function(search, limit) {

	search = isObject(search) ? search : {};
	limit  = isObject(limit)  ? limit  : { min: 0, max: 1 };


	let result = [];
	let values = this;
	if (values.length > 0) {

		let min = isNumber(limit.min) ? limit.min : 1;
		let max = isNumber(limit.max) ? limit.max : 1;

		for (let v = 0, vl = values.length; v < vl; v++) {

			let value = values[v];
			let valid = null;

			for (let key in search) {

				let val = value[key];
				if (val !== null && isString(val)) {

					if (search[key].includes(val)) {
						valid = true;
						break;
					} else if (valid === true) {
						valid = false;
						break;
					}

				}

			}

			if (valid === true) {
				result.push(value);
			} else if (valid === false) {
				break;
			}

			if (result.length >= max) {
				break;
			}

		}

		if (result.length >= min && result.length <= max) {
			return true;
		}

	}


	return false;

};

export const match = function(search) {

	search = isObject(search) ? search : {};


	let value = this;
	if (isArray(value) === true) {

		let result = [];

		for (let v = 0, vl = value.length; v < vl; v++) {

			let valid = null;

			for (let key in search) {

				let val = value[v][key];
				if (val !== null && isString(val)) {

					if (search[key].includes(val)) {
						valid = true;
						break;
					}

				}

			}

			result.push(valid);

		}

		if (result.includes(false) === false) {
			return true;
		}


		return false;

	} else if (isObject(value) === true) {

		let valid = null;

		for (let key in search) {

			let val = value[key];
			if (val !== null && isString(val)) {

				if (search[key].includes(val)) {
					valid = true;
					break;
				}

			}

		}

		if (valid === true) {
			return true;
		}

	}


	return false;

};

const parse_condition = function(str) {
	return [ str.trim() ];
};

const parse_declaration = function(str) {

	let key    = str.split(':')[0].trim();
	let val    = str.split(':').slice(1).join(':').trim();
	let result = {};

	if (typeof NORMAL[key] === 'function') {
		NORMAL[key](parse_values(val), result);
	} else if (typeof SHORTHAND[key] === 'function') {
		SHORTHAND[key](parse_values(val), result);
	} else {
		result[key] = parse_value(val);
	}

	return result;

};

const parse_number = function(str) {

	str = str.trim();


	if (str.includes('.')) {

		let num = parseFloat(str);
		if (Number.isNaN(num) === false) {
			return parseFloat(num.toFixed(2));
		}

	} else {

		let num = parseInt(str, 10);
		if (Number.isNaN(num) === false) {
			return num;
		}

	}


	return null;

};

const parse_selector = function(str) {
	return str.trim().split(',').map((ch) => ch.trim());
};

export const parse_values = function(raw) {

	let chunk  = '';
	let result = [];

	for (let r = 0, rl = raw.length; r < rl; r++) {

		let chr = raw[r];
		if (chr === '(') {

			let index = raw.indexOf(')', r + 1);
			if (index !== -1) {

				chunk += raw.substr(r, index - r + 1);
				result.push(parse_value(chunk));

				chunk = '';
				r = index;

			}

		} else if (chr === '"' || chr === '\'') {

			let index = raw.indexOf(chr, r + 1);
			if (index !== -1) {

				chunk = chunk.trim();

				if (chunk.length > 0) {
					result.push(parse_value(chunk));
					chunk = '';
				}

				result.push(parse_value(raw.substr(r, index - r + 1)));
				r = index;

			}

		} else if (OPERATORS.includes(chr)) {

			let last = raw[r - 1] || '';
			let next = raw[r + 1] || '';

			if (chr === '-' && ALPHABET.includes(last) && ALPHABET.includes(next)) {

				chunk += chr;

			} else {

				chunk = chunk.trim();

				if (chunk.length > 0) {
					result.push(parse_value(chunk));
					chunk = '';
				}

				result.push(parse_value(chr));

			}

		} else if (chr === ' ') {

			chunk = chunk.trim();

			if (chunk.length > 0) {
				result.push(parse_value(chunk));
				chunk = '';
			}

		} else {

			chunk += chr;

		}

	}


	chunk = chunk.trim();

	if (chunk.length > 0) {
		result.push(parse_value(chunk));
		chunk = '';
	}


	return result;

};

export const parse_value = function(str) {

	let value = null;

	if (OPERATORS.includes(str)) {

		value = {
			ext: null,
			raw: str,
			typ: 'operator',
			val: str
		};

	} else if (str.startsWith('attr(') && str.endsWith(')')) {

		// TODO: attr() support

	} else if (str.startsWith('calc(') && str.endsWith(')')) {

		// TODO: calc() support

	} else if (str.startsWith('url(') && str.endsWith(')')) {

		let url = str.substr(4, str.length - 5);

		if (url.startsWith('\'')) url = url.substr(1);
		if (url.startsWith('"'))  url = url.substr(1);
		if (url.endsWith('\''))   url = url.substr(0, url.length - 1);
		if (url.endsWith('"'))    url = url.substr(0, url.length - 1);

		value = {
			ext: null,
			raw: 'url("' + url + '")',
			typ: 'url',
			val: url
		};

	} else if (str.endsWith('grad') || str.endsWith('turn')) {

		let ext = str.substr(str.length - 4);
		let num = parse_number(str.substr(0, str.length - 4));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + ext,
				typ: 'angle',
				val: num
			};

		}

	} else if (str.endsWith('deg') || str.endsWith('rad')) {

		let ext = str.substr(str.length - 3);
		let num = parse_number(str.substr(0, str.length - 3));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + ext,
				typ: 'angle',
				val: num
			};

		}

	} else if (str.startsWith('#')) {

		let tmp = str.substr(1);
		if (tmp.length === 8) {

			let nums = [
				parseInt(tmp.substr(0, 2), 16),
				parseInt(tmp.substr(2, 2), 16),
				parseInt(tmp.substr(4, 2), 16),
				parseInt(tmp.substr(6, 2), 16)
			];

			value = {
				ext: null,
				raw: 'rgba(' + nums.join(',') + ')',
				typ: 'color',
				val: nums
			};

		} else if (tmp.length === 6) {

			let nums = [
				parseInt(tmp.substr(0, 2), 16),
				parseInt(tmp.substr(2, 2), 16),
				parseInt(tmp.substr(4, 2), 16),
				1
			];

			value = {
				ext: null,
				raw: 'rgba(' + nums.join(',') + ')',
				typ: 'color',
				val: nums
			};

		} else if (tmp.length === 4) {

			let nums = [
				parse_value(tmp.substr(0, 1) + tmp.substr(0, 1)),
				parse_value(tmp.substr(1, 1) + tmp.substr(1, 1)),
				parse_value(tmp.substr(2, 1) + tmp.substr(2, 1)),
				parse_value(tmp.substr(3, 1) + tmp.substr(3, 1)) / 255
			];

			value = {
				ext: null,
				raw: 'rgba(' + nums.join(',') + ')',
				typ: 'color',
				val: nums
			};

		} else if (tmp.length === 3) {

			let nums = [
				parseInt(tmp.substr(0, 1) + tmp.substr(0, 1), 16),
				parseInt(tmp.substr(1, 1) + tmp.substr(1, 1), 16),
				parseInt(tmp.substr(2, 1) + tmp.substr(2, 1), 16),
				1
			];

			value = {
				ext: null,
				raw: 'rgba(' + nums.join(',') + ')',
				typ: 'color',
				val: nums
			};

		}

	} else if (COLORS[str] !== undefined) {

		let nums = COLORS[str];

		value = {
			ext: null,
			raw: 'rgba(' + nums.join(',') + ')',
			typ: 'color',
			val: nums
		};

	} else if ((str.startsWith('rgb(') || str.startsWith('rgba(')) && str.endsWith(')')) {

		let tmp1 = str.split('(').pop().split(')').shift();
		let tmp2 = tmp1.split(',').map((v) => v.trim());

		if (tmp2.length === 3) {

			let nums = tmp2.map((v) => {

				let val = 0;

				if (v.endsWith('%')) {
					val = parse_number(v.substr(0, v.length - 1)) / 100 * 255;
				} else {
					val = parse_number(v);
				}

				if (val < 0)   val = 0;
				if (val > 255) val = 255;

				return val;

			});

			if (nums.length === 3) {
				nums.push(1);
			}

			value = {
				ext: null,
				raw: 'rgba(' + nums.join(',') + ')',
				typ: 'color',
				val: nums
			};

		} else if (tmp2.length === 4) {

			let nums = tmp2.map((v, n) => {

				let val = 0;

				if (n < 3) {

					if (v.endsWith('%')) {
						val = parse_number(v.substr(0, v.length - 1)) / 100 * 255;
					} else {
						val = parse_number(v);
					}

					if (val < 0)   val = 0;
					if (val > 255) val = 255;

				} else {

					if (v.endsWith('%')) {
						val = parse_number(v.substr(0, v.length - 1)) / 100;
					} else {
						val = parse_number(v);
					}

					if (val < 0) val = 0;
					if (val > 1) val = 1;

				}

				return val;

			});

			value = {
				ext: null,
				raw: 'rgba(' + nums.join(',') + ')',
				typ: 'color',
				val: nums
			};

		}

	} else if ((str.startsWith('hsl(')|| str.startsWith('hsla(')) && str.endsWith(')')) {

		// TODO: hsl/a color support

	} else if (str.endsWith('%')) {

		let ext = str.substr(str.length - 1);
		let num = parse_number(str.substr(0, str.length - 1));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + '%',
				typ: 'percentage',
				val: num
			};

		}

	} else if (
		str.charAt(0).match(/^([0-9]+)/g) !== null
		&& (
			str.endsWith('cm')
			|| str.endsWith('em')
			|| str.endsWith('ex')
			|| str.endsWith('in')
			|| str.endsWith('lh')
			|| str.endsWith('mm')
			|| str.endsWith('pc')
			|| str.endsWith('pt')
			|| str.endsWith('px')
		)
	) {

		let ext = str.substr(str.length - 2);
		let num = parse_number(str.substr(0, str.length - 2));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + ext,
				typ: 'length',
				val: num
			};

		}

	} else if (str.charAt(0).match(/^([0-9]+)/g) !== null && str.endsWith('rem')) {

		let ext = str.substr(str.length - 3);
		let num = parse_number(str.substr(0, str.length - 3));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + ext,
				typ: 'length',
				val: num
			};

		}

	} else if (str.charAt(0).match(/^([0-9]+)/g) !== null && str.endsWith('ms')) {

		let ext = str.substr(str.length - 2);
		let num = parse_number(str.substr(0, str.length - 2));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + ext,
				typ: 'time',
				val: num
			};

		}

	} else if (str.charAt(0).match(/^([0-9]+)/g) !== null && str.endsWith('s')) {

		let ext = str.substr(str.length - 1);
		let num = parse_number(str.substr(0, str.length - 1));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + ext,
				typ: 'time',
				val: num
			};

		}

	} else if (str.charAt(0).match(/^([0-9]+)/g) !== null && (str.endsWith('vmax') || str.endsWith('vmin'))) {

		let ext = str.substr(str.length - 4);
		let num = parse_number(str.substr(0, str.length - 4));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + ext,
				typ: 'viewport-length',
				val: num
			};

		}

	} else if (str.charAt(0).match(/^([0-9]+)/g) !== null && (str.endsWith('vh') || str.endsWith('vw'))) {

		let ext = str.substr(str.length - 2);
		let num = parse_number(str.substr(0, str.length - 2));
		if (num !== null) {

			value = {
				ext: ext,
				raw: num.toString() + ext,
				typ: 'viewport-length',
				val: num
			};

		}

	} else if (/^([0-9.]+)$/g.test(str) === true) {

		let num = parse_number(str);
		if (num !== null) {

			value = {
				ext: null,
				raw: num.toString(),
				typ: 'number',
				val: num
			};

		}

	} else if ((str.startsWith('\'') && str.endsWith('\'')) || (str.startsWith('"') && str.endsWith('"'))) {

		let tmp = str.substr(1, str.length - 2);
		if (tmp.length > 0) {

			value = {
				ext: null,
				raw: '\'' + tmp.toString() + '\'',
				typ: 'string',
				val: tmp
			};

		}

	} else if (str !== str.toLowerCase()) {

		value = {
			ext: null,
			raw: '\'' + str + '\'',
			typ: 'string',
			val: str
		};

	} else {

		value = {
			ext: null,
			raw: str,
			typ: 'other',
			val: str
		};

	}


	return value;

};

export const shift = function(search, limit) {

	search = isObject(search) ? search : {};
	limit  = isObject(limit)  ? limit  : { min: 0, max: 1 };


	let result = [];
	let values = this;
	if (values.length > 0) {

		let min = isNumber(limit.min) ? limit.min : 1;
		let max = isNumber(limit.max) ? limit.max : 1;

		for (let v = 0, vl = values.length; v < vl; v++) {

			let value = values[v];
			let valid = false;

			for (let key in search) {

				let val = value[key];
				if (val !== null && isString(val)) {

					if (search[key].includes(val)) {
						valid = true;
						break;
					}

				}

			}

			if (valid === true) {
				result.push(value);
			} else {
				break;
			}

			if (result.length >= max) {
				break;
			}

		}

		if (result.length >= min && result.length <= max) {
			values.splice(0, result.length);
		}

	}


	return result;

};

export const split = function(search) {

	search = isObject(search) ? search : {};

	let result = [];
	let values = this;
	if (values.length > 0) {

		let stack = [];

		for (let v = 0, vl = values.length; v < vl; v++) {

			let value = values[v];
			if (match.call(value, search) === true) {

				result.push(stack);
				stack = [];

			} else {

				stack.push(value);

			}

		}

		if (result.includes(stack) === false) {
			result.push(stack);
		}

	}

	return result;

};

const strip_comments = function(str) {

	let index1 = str.indexOf('/*');
	let index2 = str.indexOf('*/', index1 + 1);

	while (index1 !== -1 && index2 !== -1) {

		str    = str.substr(0, index1) + str.substr(index2 + 2);
		index1 = str.indexOf('/*');
		index2 = str.indexOf('*/', index1 + 1);

	}

	if (index1 !== -1) {
		str = str.substr(0, index1);
	}

	return str.trim();

};



const CSS = {

	isCSS: function(tree) {

		// TODO: Implement checks against tree structure

	},

	parse: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			let content  = minify_css(buffer.toString('utf8'));
			let current  = { query: [], rules: [], type: 'unknown' };
			let pointer  = null;
			let tree     = { query: [], resources: [], rules: [], type: 'root' };
			let state    = {
				condition: false,
				rule:      false
			};

			pointer = tree;


			content.split('{').join('{\n').split('}').join('\n}\n').split('\n').forEach((line) => {

				if (line.endsWith('{')) {

					if (line.startsWith('@')) {

						if (line.startsWith('@media') || line.startsWith('@supports')) {

							state.condition = true;

							current = {
								query: parse_condition(line.substr(6, line.length - 7).trim()),
								rules: [],
								type:  'condition'
							};

							if (tree.rules.includes(current) === false) {
								tree.rules.push(current);
							}

							pointer = current;

						} else if (line.startsWith('@page')) {

							state.rule = true;

							current = {
								type:         'rule-page',
								query:        parse_selector(line.substr(5, line.length - 6).trim()),
								declarations: []
							};

							pointer = current;

							if (tree.rules.includes(current) === false) {
								tree.rules.push(current);
							}

						} else if (line.startsWith('@font-face')) {

							state.rule = true;

							current = {
								type:         'rule-font',
								query:        [],
								declarations: []
							};

							pointer = current;

							if (tree.rules.includes(current) === false) {
								tree.rules.push(current);
							}

						} else if (line.startsWith('@import')) {

							// TODO: parse import url('') statement
							// and push URL object to tree.resources[]

						} else if (line.startsWith('@keyframes')) {

							// TODO: parse keyframes statement

						}

					} else {

						if (state.condition === true) {

							state.rule = true;

							current = {
								type:         'rule',
								query:        parse_selector(line.substr(0, line.length - 1).trim()),
								declarations: []
							};

							pointer.rules.push(current);

						} else {

							state.rule = true;

							current = {
								type:         'rule',
								query:        parse_selector(line.substr(0, line.length - 1).trim()),
								declarations: []
							};

							tree.rules.push(current);

						}

					}

				} else if (line.trim() === '}') {

					if (state.rule === true) {

						state.rule = false;

						if (state.condition === true) {
							// Keep pointer
							current = null;
						} else {
							pointer = tree;
							current = null;
						}

					} else if (state.condition === true) {

						state.condition = false;
						pointer = tree;
						current = null;

					}

				} else if (line.trim() !== '') {

					if (current !== null && current.type.startsWith('rule')) {
						current.declarations.push(CSS.parse_chunk(line));
					} else {
						// Invalid CSS Syntax
					}

				}

			});


			return tree;

		}


		return null;

	},

	parse_chunk: function(str) {

		str = isString(str) ? str : '';


		if (str.endsWith(';')) {
			str = str.substr(0, str.length - 1);
		}

		if (str.includes(';')) {

			let result = {};

			let declarations = str.split(';');
			if (declarations.length > 0) {

				declarations.forEach((declaration) => {

					let tmp = parse_declaration(declaration);
					if (Object.keys(tmp).length > 0) {

						Object.keys(tmp).forEach((key) => {
							result[key] = tmp[key];
						});

					}

				});

			}

			return result;

		} else {

			if (str.includes(':')) {

				return parse_declaration(str);

			} else {

				if (str.includes(',')) {

					return parse_values(str);

				} else if (str.includes(' ')) {

					return parse_values(str);

				} else {

					return parse_value(str);

				}

			}

		}

	},

	render: function(buffer) {

		// TODO: Implement me

	}

};


export const isCSS       = CSS.isCSS;
export const parse       = CSS.parse;
export const parse_chunk = CSS.parse_chunk;
export const render      = CSS.render;

export { CSS };

