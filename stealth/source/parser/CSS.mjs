
import { isArray, isBuffer, isObject, isString } from '../../extern/base.mjs';
import { Parser                                } from '../../source/language/Parser.mjs';
import { GRAMMAR                               } from '../../source/language/CSS/GRAMMAR.mjs';
import { SYNTAX                                } from '../../source/language/CSS/SYNTAX.mjs';



const CSS = {

	compare: function(a, b) {

		// TODO: Can CSS trees be compared to each other?

	},

	isCSS: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			// TODO: Validate Payload (tree)

		}

		return false;

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
		}


		let parser = new Parser({ grammar: GRAMMAR, syntax: SYNTAX });
		let tree   = { type: 'root', rules: [] };

		if (raw !== null) {

			tree = parser.parse(raw);

		}

		return tree;

	},

	render: function(tree) {

		// TODO: Render CSS tree into Buffer

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((tree) => {
				return CSS.isCSS(tree) === true;
			}).sort((a, b) => {
				return CSS.compare(a, b);
			});

		}


		return [];

	}

};


export { CSS };

