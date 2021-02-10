
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
	 * : [ ... style-rule, ... at-rule ]
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

				console.log(rules);
				break;
			} else if (this.token.type === 'ident') {

				let rule = this.exec('style-rule');
				if (rule.type !== null) {
					rules.push(rule);
				}

			} else {

				// TODO: range([ ';', '{' ])
				// and then ignore unsupported rule

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
	 * | TODO: at-font-face
	 * | at-import
	 * | at-keyframes
	 * | TODO: at-media
	 * | TODO: at-page
	 * | TODO: at-supports
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
		}

	},

	/*
	 * at-charset
	 * : 'charset' string ';'
	 * ;
	 */

	'at-charset': function() {

		let ident = this.expect([ 'ident' ]);
		if (ident.value === 'charset') {

			let token = this.next([ 'string' ]);
			if (token.type === 'string') {

				let value = token.value;

				let check = this.range([ ';' ]);
				if (check[check.length - 1].type === ';') {
					this.next();
				}

				return {
					type: 'at-rule',
					name: 'charset',
					value: {
						type: 'string',
						value: value.substr(1, value.length - 2)
					}
				};

			} else {
				this.range([ ';' ]);
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

				let media = null;
				let value = token.value;

				let check = this.next([ ';', 'media-type' ]);
				if (check.type === ';') {

					this.next();

				} else if (check.type === 'media-type') {

					let tokens = this.range([ ';' ]);
					if (tokens.length > 0) {

						console.warn(tokens);

					}

					media = {
						type:  'media-query',
						value: check.value,
						query: null
					};

					this.next();

				}

				return {
					type:  'at-rule',
					name:  'import',
					media: media,
					value: {
						type: 'url',
						value: value.substr(1, value.length - 2)
					}
				};

			} else if (token.type === 'url') {

				let media = null;
				let value = token.value;

				let check = this.next([ ';', 'media-type' ]);
				if (check.type === ';') {

					this.next();

				} else if (check.type === 'media-type') {

					let tokens = this.range([ ';' ]);
					if (tokens.length > 0) {

						console.warn(tokens);

					}

					media = {
						type:  'media-query',
						value: check.value,
						query: null
					};

					this.next();

				}

				return {
					type:  'at-rule',
					name:  'import',
					media: media,
					value: {
						type: 'url',
						value: value.substr(5, value.length - 7)
					}
				};

			} else {

				this.range([ ';' ]);
				this.next();

			}

		}

	},

	/*
	 * at-keyframes
	 * : 'keyframes' ident '{' [ 'from' '{' declarations '}', to '{' declarations '}' ] '}'
	 * | 'keyframes' ident '{' [ ... number 'percentage' '{' declarations '}' ] '}'
	 * | 'keyframes' string '{' [ 'from' '{' declarations '}', to '{' declarations '}' ] '}'
	 * | 'keyframes' string '{' [ ... number 'percentage' '{' declarations '}' ] '}'
	 * ;
	 */

	'at-keyframes': function() {

		let ident = this.expect([ 'ident' ]);
		if (ident.value === 'keyframes') {

			let keyframes = {
				name:  null,
				rules: []
			};

			let name = this.next([ 'ident', 'string' ]);
			if (name.type === 'ident') {
				keyframes.name = name.value;
			} else if (name.type === 'string') {
				keyframes.name = name.value.substr(1, name.value.length - 2);
			}

			this.next();

			let check_block1 = this.expect([ '{' ]);
			if (check_block1.type === '{') {

				while (this.token.type !== '}') {

					let rule = {
						selector:     null,
						declarations: []
					};

					let selector = this.next([ 'ident', 'number' ]);
					if (selector.type === 'ident') {

						if (selector.value === 'from') {
							rule.selector = '0%';
						} else if (selector.value === 'to') {
							rule.selector = '100%';
						}

					} else if (selector.type === 'number') {

						this.next();
						this.expect([ 'percentage' ]);

						rule.selector = selector.value + '%';

					}

					this.next();

					let check1 = this.expect([ '{' ]);
					if (check1.type === '{') {

						this.next();

						let declarations = this.exec('declarations');
						if (declarations.length > 0) {
							rule.declarations = declarations;
						}

					}

					let check2 = this.expect([ '}' ]);
					if (check2.type === '}') {

						if (rule.selector !== null && rule.declarations.length > 0) {
							keyframes.rules.push(rule);
						}

						this.next();

					} else {
						this.range([ '}' ]);
						this.next();
					}

				}

			}

			let check_block2 = this.expect([ '}' ]);
			if (check_block2.type === '}') {

				this.next();

				if (keyframes.name !== null && keyframes.rules.length > 0) {
					return keyframes;
				}

			} else {
				this.range([ '}' ]);
				this.next();
			}

		}

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
	 * : [ ... ident ':' value ]
	 * ;
	 */

	// TODO: Verify that declarations stops _BEFORE_ the '}' character,
	// so that next() will return '}'

	'declarations': function() {

		let declarations = [];

		while (this.token.type !== null && this.token.type !== '}') {

			let declaration = {
				name:      null,
				value:     null,
				important: false
			};

			let name = this.expect([ 'ident' ]);
			if (name.type === 'ident') {
				declaration.name = name.value;
			}

			let colon = this.next([ ':' ]);
			if (colon.type === ':') {

				let value = this.range([ ';', '}' ]);
				if (value.length > 2) {

					// TODO: Complex value
					// background: url("what/ever.jpg") !important;
					// background: #ff0000 scroll scroll 0px;

				} else if (value.length === 2) {

					let simple = value[0];
					if (simple.type === 'string') {
						declaration.value = simple;
					} else if (simple.type === 'url') {
						declaration.value = simple;
					} else if (simple.type === 'ident') {
						declaration.value = simple;
					}

					if (value[1].type === ';') {
						this.range(';');
						this.next();
					}

				} else if (value.length === 1) {
					this.next();
				} else {
					break;
				}

			} else {
				break;
			}

			if (declaration.name !== null && declaration.value !== null) {
				declarations.push(declaration);
			}

		}

		return declarations;

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

