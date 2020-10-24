
import { isArray, isBuffer, isNumber, isString } from '../../extern/base.mjs';



const seek = function(string, min, search, limit) {

	string = isString(string) ? string : null;
	min    = isNumber(min)    ? min    : 0;
	search = isArray(search)  ? search : [];
	limit  = isArray(limit)   ? limit  : [];


	let chunk = null;
	let index = -1;
	let match = null;

	if (string !== null) {

		let max_index = string.length;

		if (limit.length > 0) {

			for (let l = 0, ll = limit.length; l < ll; l++) {

				let tmp_index = string.indexOf(limit[l], index);
				if (tmp_index !== -1) {

					if (tmp_index < max_index) {
						max_index = tmp_index;
					}

				}

			}

		}

		if (search.length > 0) {

			index = min;

			for (let s = 0, sl = search.length; s < sl; s++) {

				let tmp_index = string.indexOf(search[s], index);
				if (tmp_index !== -1) {

					if (tmp_index < max_index) {

						chunk = string.substr(index, tmp_index - index);
						index = tmp_index;
						match = search[s];

						break;

					}

				}

			}

		}

		if (index === -1) {

			if (max_index < string.length) {
				chunk = string.substr(index, max_index - index);
				index = max_index;
				match = string.charAt(max_index);
			}

		}

	}

	return {
		chunk: chunk,
		index: index,
		match: match
	};

};

const METADATA = [
	'base',
	'link',
	'meta',
	'noscript',
	'script',
	'style',
	'template',
	'title'
];

// TODO: FLOWROOT_ELEMENTS = []
// TODO: FLOW_ELEMENTS = []
// TODO: INLINE_ELEMENTS = []

const ELEMENT = {

	'html': {
		'parent':   [],
		'children': [ 'body', 'head' ],
		'closes':   []
	},

	'head': {
		'parent':   [ 'html' ],
		'children': [ 'meta', 'link' ],
		'closes':   []
	},

	'body': {
		'parent':   [ 'html' ],
		'children': [],
		'closes':   [ 'head', 'link', 'script' ]
	}

};

const Element = function(type) {

	this.type       = type;
	this.attributes = {};
	this.children   = [];

};



const HTML = {

	compare: function(a, b) {
		// TODO: Compare HTML trees!?
	},

	filter: function(tree) {

		return tree;

	},

	isHTML: function(tree) {

		return false;

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
		}



		if (raw !== null) {

			let index = 0;
			let tree  = new Element('html');

			while (index < raw.length) {

				let start = raw.charAt(index);
				if (start === '<') {

					let result = seek(raw, index, [ '>' ], [ '<', '/', '>' ]);
					if (result.match === '>') {

						// TODO: Parse result.chunk

					}

				}

				index++;

			}

			return tree;

		}

		return null;

	},

	render: function(tree) {

		return null;

	},

	sort: function(a, b) {
		// TODO: Sort HTML trees!?
	}

};


export { HTML };

