
import { Buffer, isBuffer, isString } from '../POLYFILLS.mjs';


const MINIFY_MAP = {
	'\n': '',
	'\t': '',
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

const SHORTHAND_MAP = {
	'background': {
		// TODO: Figure out a value: real-key structure
	},
	'border': {
		// TODO: like above
	},
	'margin': {
	},
	'padding': {
	},
	'transform': {
	}
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

		let key = ch.split(':')[0];
		let val = ch.split(':').slice(1).join(':');

		let is_shorthand = SHORTHAND_MAP[key] !== undefined;
		if (is_shorthand === true) {

			let map = parse_shorthand(SHORTHAND_MAP[key], val);

			for (let k in map) {
				declarations[k] = map[k] || declarations[k];
			}

		} else {

			declarations[key] = parse_value(val);

		}

	});

	return declarations;

};

const parse_selector = function(str) {
	return str.trim().split(',').map((ch) => ch.trim());
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

