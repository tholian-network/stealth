
import { console } from '../../../extern/base.mjs';



const GRAMMAR = {

	/*
	 * root
	 * : style-rule
	 * | at-rule
	 * ;
	 */

	'root': function() {

		let rules = [];

		while (this.token !== null) {

			let rule = null;

			if (this.token.value === '@') {
				rule = this.exec('at-rule');
			} else {
				rule = this.exec('style-rule');
			}

			if (rule !== null) {
				rules.push(rule);
			} else {
				break;
			}

		}

		return {
			type:  'root',
			rules: rules.filter((rule) => rule !== null)
		};

	},

	/*
	 * at-rule
	 * : at-charset
	 * | at-counter-style
	 * | at-font-face
	 * | at-font-feature-values
	 * | at-import
	 * | at-keyframes
	 * | at-media
	 * | at-namespace
	 * | at-page
	 * | at-property
	 * | at-supports
	 * | at-viewport (Working Draft)
	 *
	 *
	 *
	 *
	 * : '@' name '(' component-values ')' '{' declarations '}'
	 * | '@' name '{' declarations '}'
	 * | '@' name '"' parameters '"'
	 * ;
	 */

	'at-rule': function() {

		this.next('@');

		if (this.token !== null) {

			let rule = this.token.value.trim();
			if (rule === 'charset') {
				return this.exec('at-charset');
			} else if (rule === 'counter-style') {
				return this.exec('at-counter-style');
			} else if (rule === 'font-face') {
				return this.exec('at-font-face');
			} else if (rule === 'font-feature-values') {
				return this.exec('at-font-feature-values');
			} else if (rule === 'import') {
				return this.exec('at-import');
			} else if (rule === 'keyframes') {
				return this.exec('at-keyframes');
			} else if (rule === 'media') {
				return this.exec('at-media');
			} else if (rule === 'namespace') {
				return this.exec('at-namespace');
			} else if (rule === 'page') {
				return this.exec('at-page');
			} else if (rule === 'property') {
				return this.exec('at-property');
			} else if (rule === 'supports') {
				return this.exec('at-supports');
			} else if (rule === 'viewport') {
				return this.exec('at-viewport');
			}

		}


		return null;

	},

	/*
	 * at-charset
	 * : 'charset' '"' string '"' ';'
	 * | 'charset' '\'' string '\'' ';'
	 * ;
	 */

	'at-charset': function() {

		this.next('ident');

		let charset = this.next('string');

		this.next(';');

		return {
			name:  '@charset',
			value: charset.value.substr(1, charset.value.length - 2)
		};

	},

	/*
	 * at-import
	 * : 'import' '"' string '"' ';'
	 * | 'import' 'url' '(' '"' string '"' ')' ';'
	 */
	'at-import': function() {
	},

	/*
	 * style-rule (qualified-rule)
	 * : component-values-list '{' declarations '}'
	 * ;
	 */

	'style-rule': function() {

		return null;

	},

	/*
	 * declarations
	 * : list of declaration
	 * ;
	 */

	'declarations': function() {
	},

	/*
	 * declaration
	 * : name ':' value
	 * | name ':' value '!important'
	 * ;
	 */

	'declaration': function() {
	}

};

const SYNTAX = [

	// Ignored
	{ type: null, pattern: new RegExp('^\\s+')                 }, // whitespace
	{ type: null, pattern: new RegExp('^\\/\\*[\\s\\S]*?\\*/') }, // multi-line comment

	// Symbols
	{ type: '@', pattern: '@'                },
	{ type: ';', pattern: ';'                },
	{ type: '{', pattern: new RegExp('^\\{') },
	{ type: '}', pattern: new RegExp('^\\}') },

	// Literals
	{ type: 'ident',  pattern: new RegExp('^[A-Za-z_-\\s]+\\s') },
	{ type: 'string', pattern: new RegExp('^"[^"]*"')           },
	{ type: 'string', pattern: new RegExp('^\'[^\']*\'')        },

];

const SPECIFICATION = {
	grammar: GRAMMAR,
	syntax:  SYNTAX
};


export { SPECIFICATION };

