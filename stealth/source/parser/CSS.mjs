
import { Buffer, isBuffer } from '../POLYFILLS.mjs';

import NORMAL    from './CSS/NORMAL.mjs';
import SHORTHAND from './CSS/SHORTHAND.mjs';

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

	return strip_comments(str.trim());

};

const parse_condition = function(str) {
	return [ str.trim() ];
};

const parse_declarations = function(str) {

	let declarations = {};

	if (str.endsWith(';')) {
		str = str.substr(0, str.length - 1);
	}

	str.split(';').forEach((ch) => {

		let key       = ch.split(':')[0];
		let val       = ch.split(':').slice(1).join(':');
		let normal    = NORMAL[key]    || null;
		let shorthand = SHORTHAND[key] || null;

		if (normal !== null) {

			let map = normal(parse_values(val)) || null;
			if (map !== null) {

				for (let k in map) {

					let v = map[k] || null;
					if (v !== null) {
						declarations[k] = map[k];
					}

				}

			}

		} else if (shorthand !== null) {

			let map = shorthand(parse_values(val)) || null;
			if (map !== null) {

				for (let k in map) {

					let v = map[k] || null;
					if (v !== null) {
						declarations[k] = map[k];
					}

				}

			}

		} else {

			declarations[key] = parse_value(val);

		}

	});

	return declarations;

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

const parse_values = function(str) {
	return str.split(' ').filter((v) => v.trim() !== '').map((v) => parse_value(v));
};

const parse_value = function(str) {

	let value = null;

	if (str.startsWith('calc(') && str.endsWith(')')) {

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

	} else if (
		str.startsWith('#')
		|| (
			str.startsWith('rgb(')
			|| str.startsWith('rgba(')
		) && str.endsWith(')')
	) {

		if (str.startsWith('#')) {

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
					parseInt(tmp.substr(0, 1) + tmp.substr(0, 1), 16),
					parseInt(tmp.substr(1, 1) + tmp.substr(1, 1), 16),
					parseInt(tmp.substr(2, 1) + tmp.substr(2, 1), 16),
					parseInt(tmp.substr(3, 1) + tmp.substr(3, 1), 16) / 255
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

		} else {

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

		}

	} else if (
		(
			str.startsWith('hsl(')
			|| str.startsWith('hsla(')
		) && str.endsWith(')')
	) {

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
		str.endsWith('cm')
		|| str.endsWith('em')
		|| str.endsWith('ex')
		|| str.endsWith('in')
		|| str.endsWith('lh')
		|| str.endsWith('mm')
		|| str.endsWith('pc')
		|| str.endsWith('pt')
		|| str.endsWith('px')
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

	} else if (str.endsWith('rem')) {

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

	} else if (str.endsWith('ms')) {

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

	} else if (str.endsWith('s')) {

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

	} else if (str.endsWith('vmax') || str.endsWith('vmin')) {

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

	} else if (str.endsWith('vh') || str.endsWith('vw')) {

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

	} else if (/^([0-9]+)$/g.test(str) === true) {

		let num = parse_number(str);
		if (num !== null) {

			value = {
				ext: null,
				raw: num.toString(),
				typ: 'number',
				val: num
			};

		}

	} else if (
		(str.startsWith('\'') && str.endsWith('\''))
		|| (str.startsWith('"') && str.endsWith('"'))
	) {

		let tmp = str.substr(1, str.length - 2);
		if (tmp.length > 0) {

			value = {
				ext: null,
				raw: '\'' + tmp.toString() + '\'',
				typ: 'string',
				val: tmp
			};

		}

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

						parse_declarations(line);

					} else {
						// Invalid CSS Syntax
					}

				}

			});

			return Buffer.from(content, 'utf8');

		}

	},

	render: function(buffer) {

		// TODO: Implement me

	}

};


export const isCSS   = CSS.isCSS;
export const parse   = CSS.parse;
export const render  = CSS.render;

export { CSS };

