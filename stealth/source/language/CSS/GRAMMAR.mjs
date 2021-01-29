
import { console } from '../../../extern/base.mjs';

// TODO: semicolons are OPTIONAL for declarations, but not for rules. semicolons OR { has to come, ALWAYS



const AT_RULES = {
	'@page': [ 'size', 'marks', 'bleed' ]
};

const isVendorPrefix = (str) => {

	if (str.startsWith('-') === true && str.startsWith('--') === false) {
		return true;
	}

	return false;

};

const toVendorPrefix = (str) => {

	if (str.startsWith('-') === true && str.startsWith('--') === false) {
		return str.split('-').slice(0, 2).join('-') + '-';
	}

	return '';

};


const GRAMMAR = {

	/*
	 * root
	 * : style-rule
	 * | at-rule
	 * ;
	 */

	'root': function() {

		let rules = [];

		while (this.token.type !== null) {

			console.log(this.token);

			if (this.token.type === '@') {

				let rule = this.exec('at-rule');
				if (rule.type !== null) {
					rules.push(rule);
				}

			} else if (this.token.type === 'ident') {

				let rule = this.exec('style-rule');
				if (rule.type !== null) {
					rules.push(rule);
				}

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

		this.expect([ '@' ]);

		let rule = this.next([ 'ident' ]);

		if (rule.value === 'charset') {
			return this.exec('at-charset');
		} else if (rule.value === 'import') {
			return this.exec('at-import');



		} else if (rule.value === 'keyframes') {
			return this.exec('at-keyframes');
		} else if (rule.value === 'media') {
			return this.exec('at-media');
		} else if (rule.value === 'page') {
			return this.exec('at-page');
		} else if (rule.value === 'supports') {
			return this.exec('at-supports');
		} else if (rule.value === 'viewport') {
			return this.exec('at-viewport');
		}

	},

	/*
	 * at-charset
	 * : 'charset' string ';'
	 * | 'charset' string ';'
	 * ;
	 */

	'at-charset': function() {

		let ident = this.expect([ 'ident' ]);
		if (ident.value === 'charset') {

			let token = this.next([ 'string' ]);
			if (token.type === 'string') {

				let charset = token.value;

				let check = this.next([ ';' ]);
				if (check.type === ';') {
					this.next();
				} else {

					this.seek(';');
					this.next();

				}

				return {
					type: 'at-rule',
					name: 'charset',
					value: {
						type: 'string',
						value: charset.substr(1, charset.length - 2)
					}
				};

			} else {

				this.seek(';');
				this.next();

			}

		}

	},

	/*
	 * at-import
	 * : 'import' string ';'
	 * | TODO: 'import' string media-type media-query-list ';'
	 * | 'import' url ';'
	 * | TODO: 'import' url media-type media-query-list ';'
	 * ;
	 */

	'at-import': function() {

		let ident = this.expect([ 'ident' ]);
		if (ident.value === 'import') {

			let token = this.next([ 'string', 'url' ]);
			if (token.type === 'string') {

				let url   = token.value;
				let media = null;

				let check = this.next([ ';', 'media-type' ]);
				if (check.type === ';') {

					this.next();

				} else {

					// TODO: media-query-list
					// media = this.exec('media-query-list');

					this.seek(';');
					this.next();

				}

				return {
					type:  'at-rule',
					name:  'import',
					media: media,
					value: {
						type: 'url',
						value: url.substr(1, url.length - 2)
					}
				};

			} else if (token.type === 'url') {

				let url   = token.value;
				let media = null;

				let check = this.next([ ';', 'media-type' ]);
				if (check.type === ';') {

					this.next();

				} else {

					// TODO: media-query-list
					// media = this.exec('media-query-list');

					this.seek(';');
					this.next();

				}

				return {
					type:  'at-rule',
					name:  'import',
					media: media,
					value: {
						type: 'url',
						value: url.substr(5, url.length - 7)
					}
				};

			} else {

				this.seek(';');
				this.next();

			}

		}

	},

	/*
	 * at-keyframes
	 * : 'keyframes' '{' declarations '}'
	 * ;
	 */

	'at-keyframes': function() {
	},

	/*
	 * style-rule (qualified-rule)
	 * : component-values-list '{' declarations '}'
	 * ;
	 */

	'style-rule': function() {

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


export { GRAMMAR };

