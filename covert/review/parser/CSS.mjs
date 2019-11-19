
import { console } from '../../source/console.mjs';

import { Buffer } from 'buffer';

import { describe, finish } from '../../source/Review.mjs';

import { CSS } from '../../../stealth/source/parser/CSS.mjs';

const create = (selector, declarations) => {

	let str = selector + ' {\n';

	declarations.forEach((ch) => {
		str += '\t' + ch[0] + ': ' + ch[1] + ';\n';
	});

	str += '}\n';

	return Buffer.from(str, 'utf8');

};

const query = (selector, tree) => {

	let declarations = [];

	if (tree instanceof Object && tree.type === 'root') {

		if (tree.rules instanceof Array) {

			for (let r = 0, rl = tree.rules.length; r < rl; r++) {

				let rule = tree.rules[r];
				if (rule.query.includes(selector)) {
					declarations.push.apply(declarations, rule.declarations);
				}

			}

		}

	}

	return declarations;

};


describe('CSS.parse/normal', function(assert) {

	let buffer = create('body > main', [
		[ 'background-color',      'rgba(255, 13%, 0, 17.5%)' ],
		[ 'background-size',       'contain'                  ],
		[ 'background-color',      '#ffcc00'                  ],
		[ 'background-position',   '13% 37px'                 ],
		[ 'background-position-y', '137px'                    ]
	]);

	let result       = CSS.parse(buffer);
	let declarations = query('body > main', result);

	assert(declarations.length > 0);
	assert(declarations[0]['background-color'].val, [ 255, 204, 0, 1 ]);
	assert(declarations[0]['background-size-x'].val, 'contain');
	assert(declarations[0]['background-size-y'].val, 'contain');
	assert(declarations[0]['background-position-x'].ext, '%');
	assert(declarations[0]['background-position-x'].val, 13);
	assert(declarations[0]['background-position-y'].ext, 'px');
	assert(declarations[0]['background-position-y'].val, 137);

});

describe('CSS.parse/background', function(assert) {

	let buffer = create('body > main', [
		[ 'background', 'url(\'/path/to/image.jpg\') top 13px repeat no-repeat fixed border-box content-box #ff0000' ],
	]);

	let result       = CSS.parse(buffer);
	let declarations = query('body > main', result);

	assert(declarations.length > 0);
	assert(declarations[0]['background-image'].val,      '/path/to/image.jpg');
	assert(declarations[0]['background-position-x'].ext, null);
	assert(declarations[0]['background-position-x'].val, 'top');
	assert(declarations[0]['background-position-y'].ext, 'px');
	assert(declarations[0]['background-position-y'].val, 13);
	assert(declarations[0]['background-repeat-x'].val,   'repeat');
	assert(declarations[0]['background-repeat-y'].val,   'no-repeat');
	assert(declarations[0]['background-attachment'].val, 'fixed');
	assert(declarations[0]['background-origin'].val,     'border-box');
	assert(declarations[0]['background-clip'].val,       'content-box');
	assert(declarations[0]['background-color'].val,      [ 255, 0, 0, 1 ]);

});

describe('CSS.parse/border', function(assert) {

	let buffer = create('body > main', [
		[ 'border', 'medium dotted #ff00cc' ]
	]);

	let result       = CSS.parse(buffer);
	let declarations = query('body > main', result);

	assert(declarations[0]['border-top-width'].val,    'medium');
	assert(declarations[0]['border-right-width'].val,  'medium');
	assert(declarations[0]['border-bottom-width'].val, 'medium');
	assert(declarations[0]['border-left-width'].val,   'medium');
	assert(declarations[0]['border-top-style'].val,    'dotted');
	assert(declarations[0]['border-right-style'].val,  'dotted');
	assert(declarations[0]['border-bottom-style'].val, 'dotted');
	assert(declarations[0]['border-left-style'].val,   'dotted');
	assert(declarations[0]['border-top-color'].val,    [ 255, 0, 204, 1 ]);
	assert(declarations[0]['border-right-color'].val,  [ 255, 0, 204, 1 ]);
	assert(declarations[0]['border-bottom-color'].val, [ 255, 0, 204, 1 ]);
	assert(declarations[0]['border-left-color'].val,   [ 255, 0, 204, 1 ]);

});

describe('CSS.parse/border-radius', function(assert) {

	let buffer = create('body > main', [
		[ 'border-radius', '1px 2px 3% / 4px 5px 6px 7px' ]
	]);

	let result       = CSS.parse(buffer);
	let declarations = query('body > main', result);

	assert(declarations.length > 0);

	assert(declarations[0]['border-top-left-radius'][0].ext, 'px');
	assert(declarations[0]['border-top-left-radius'][0].val, 1);
	assert(declarations[0]['border-top-left-radius'][1].ext, 'px');
	assert(declarations[0]['border-top-left-radius'][1].val, 4);

	assert(declarations[0]['border-top-right-radius'][0].ext, 'px');
	assert(declarations[0]['border-top-right-radius'][0].val, 2);
	assert(declarations[0]['border-top-right-radius'][1].ext, 'px');
	assert(declarations[0]['border-top-right-radius'][1].val, 5);

	assert(declarations[0]['border-bottom-right-radius'][0].ext, '%');
	assert(declarations[0]['border-bottom-right-radius'][0].val, 3);
	assert(declarations[0]['border-bottom-right-radius'][1].ext, 'px');
	assert(declarations[0]['border-bottom-right-radius'][1].val, 6);

	assert(declarations[0]['border-bottom-left-radius'][0].ext, 'px');
	assert(declarations[0]['border-bottom-left-radius'][0].val, 2);
	assert(declarations[0]['border-bottom-left-radius'][1].ext, 'px');
	assert(declarations[0]['border-bottom-left-radius'][1].val, 7);

});

describe('CSS.parse/font', function(assert) {

	let buffer = create('body > main', [
		[ 'font', 'italic bold condensed 13px/37px "Times New Roman", "Arial", Sedana, sans-serif' ]
	]);

	let result = null;
	try {
		result = CSS.parse(buffer);
	} catch (err) {
		console.error(err);
	}
	let declarations = query('body > main', result);

	assert(declarations.length > 0);

	console.log(declarations);

});

// describe('CSS.parse/selectors', function(assert) {
// 	// TODO: Multiple selectors test
// 	assert(false);
// });
//
// describe('CSS.parse/font-face', function(assert) {
// 	// TODO: @font-face test
// 	assert(false);
// });
//
// describe('CSS.parse/import', function(assert) {
// 	// TODO: @import test
// 	assert(false);
// });
//
// describe('CSS.parse/media', function(assert) {
// 	// TODO: @media test
// 	assert(false);
// });
//
// describe('CSS.parse/page', function(assert) {
// 	// TODO: @page test
// 	assert(false);
// });
//
// describe('CSS.parse/supports', function(assert) {
// 	// TODO: @supports test
// 	assert(false);
// });



export default finish('parser/CSS');

