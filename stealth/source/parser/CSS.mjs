
import { isArray, isBuffer, isObject, isString } from '../../extern/base.mjs';
import { Parser                                } from '../../source/language/Parser.mjs';
import { SPECIFICATION                         } from '../../source/language/CSS/SPECIFICATION.mjs';






const CSS = {

	compare: function(a, b) {
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


		let parser = new Parser({ grammar: SPECIFICATION.grammar, syntax:  SPECIFICATION.syntax });
		let tree  = { type: 'root', rules: [] };

		if (raw !== null) {

			tree = parser.parse(raw);

		}

		return tree;

	},

	render: function(tree) {
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

