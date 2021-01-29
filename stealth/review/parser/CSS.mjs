
import { Buffer           } from '../../../base/index.mjs';
import { describe, finish } from '../../../covert/index.mjs';
import { CSS              } from '../../../stealth/source/parser/CSS.mjs';



describe('CSS.parse()/@charset', function(assert) {

	let charset1 = CSS.parse('@charset "utf-8";');
	let charset2 = CSS.parse('@charset \'iso-8859-1\';');

	assert(charset1, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'charset',
			value: {
				type: 'string',
				value: 'utf-8'
			}
		}]
	});

	assert(charset2, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'charset',
			value: {
				type: 'string',
				value: 'iso-8859-1'
			}
		}]
	});

});

describe('CSS.parse()/@import', function(assert) {

	let import1 = CSS.parse('@import "/path/to/file.css";');
	let import2 = CSS.parse('@import url("https://example.com/path/to/file.css");');
	let import3 = CSS.parse('@import "/path/to/file.css" screen');
	let import4 = CSS.parse('@import "/path/to/file.css" print and (orientation: landscape) and (min-width: 100px);');

	assert(import1, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'import',
			value: {
				type: 'url',
				value: '/path/to/file.css'
			},
			media: null
		}]
	});

	assert(import2, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'import',
			value: {
				type: 'url',
				value: 'https://example.com/path/to/file.css'
			},
			media: null
		}]
	});

	assert(import3, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'import',
			value: {
				type: 'url',
				value: '/path/to/file.css'
			},
			media: {
				type: 'media-query',
				value: 'screen',
				query: null
			}
		}]
	});

	assert(import4, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'import',
			value: {
				type: 'url',
				value: '/path/to/file.css'
			},
			media: {
				type:  'media-query',
				value: 'print',
				query: {
					type: 'media-query-list',
					value: [
					]
				}

				// 	'orientation': 'landscape',
				// 	'min-width': {
				// 		type:  'number',
				// 		unit:  'pixel',
				// 		value: 100
				// 	}
			}
		}]
	});

});


export default finish('stealth/parser/CSS', {
	internet: false,
	network:  false
});

