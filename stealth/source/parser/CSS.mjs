
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

const minify_css = function(str) {

	Object.keys(MINIFY_MAP).forEach((key) => {

		let index = str.indexOf(key);
		let val   = MINIFY_MAP[key];

		while (index !== -1) {
			str   = str.substr(0, index) + val + str.substr(index + key.length);
			index = str.indexOf(key, index + val.length);
		}

	});

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
			let position = 0;
			let state    = {
				comment:  false,
				selector: false,
				special:  false
			};


			// XXX: Idea: Rule-based parsing
			// meaning }* has to be split correctly
			// also respecting @ rules

			// TODO: Read CSS 2.1/3 specification
			// and figure out allowed charset for selectors
			// and whether or not elements and selectors can
			// have utf8 characterset as well.
			//
			// If it is ascii+special chars only, it would
			// ease up the parsing process by allowing to
			// use a simple split() call that would allow
			// parsing each rule correctly


			// TODO: Implement me

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

