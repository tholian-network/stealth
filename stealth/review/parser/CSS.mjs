
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
	let import3 = CSS.parse('@import "/path/to/file.css" screen;');
	let import4 = CSS.parse('@import "/path/to/file.css" print and (orientation: landscape) and (min-width: 100px);');

	assert(import1, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'import',
			media: null,
			value: {
				type: 'url',
				value: '/path/to/file.css'
			}
		}]
	});

	assert(import2, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'import',
			media: null,
			value: {
				type: 'url',
				value: 'https://example.com/path/to/file.css'
			}
		}]
	});

	assert(import3, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'import',
			media: {
				type: 'media-query',
				value: 'screen',
				query: null
			},
			value: {
				type: 'url',
				value: '/path/to/file.css'
			}
		}]
	});

	assert(import4, {
		type: 'root',
		rules: [{
			type: 'at-rule',
			name: 'import',
			media: {
				type: 'media-query',
				value: 'print',
				query: [{
					'orientation': 'landscape',
					'min-width': {
						type: 'length',
						value: '100px'
					}
				}]
			},
			value: {
				type: 'url',
				value: '/path/to/file.css'
			}
		}]
	});

});

describe('CSS.parse()/@keyframes', function(assert) {

	let keyframes1 = CSS.parse('@keyframes my-animation-name { 0% { color: \'#ff0000\'; background: transparent } 50% { color: "#0000ff"; background: "#ff0000"; } 137% { color: "#ff0000" } }');
	// let keyframes2 = CSS.parse('@keyframes my-animation-name { from { color: \'#ff0000\'; } to { color: "#0000ff" } }');

	console.log(keyframes1);

});

describe('CSS.parse()/@page', function(assert) {

	let page1 = CSS.parse('@page { margin: 2cm; }');
	let page2 = CSS.parse('@page :left { margin-left: 3cm; }');
	let page3 = CSS.parse('@page :right { margin-right: 3cm; }');
	let page4 = CSS.parse('@page :blank { @top-center { content: none; } }');

});


export default finish('stealth/parser/CSS', {
	internet: false,
	network:  false
});

