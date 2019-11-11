
import { Buffer } from 'buffer';

import { describe, finish } from '../../source/Review.mjs';

import { CSS } from '../../../stealth/source/parser/CSS.mjs';

const create = (selectors, declarations) => {

	let str = '';

	str += selectors.join(',\n') + ' {\n';

	declarations.forEach((ch) => {
		str += '\t' + ch[0] + ': ' + ch[1] + ';\n';
	});

	str += '}\n';

	return Buffer.from(str, 'utf8');

};


describe('CSS.parse/normal', function(assert, debug) {

	let declarations = [
		[ 'background-color',      'rgba(255, 13%, 0, 17.5%)' ],
		[ 'background-size',       'contain'                  ],
		[ 'background-color',      '#ffcc00'                  ],
		[ 'background-position',   '13% 37px'                ],
		[ 'background-position-y', '137px'                    ]
	];

	let buffer = create([ 'body > main' ], declarations);
	let result = null;
	try {
		result = CSS.parse(buffer);
	} catch (err) {
		console.error(err);
	}

	console.log(result);
	let rule   = result.rules[0];

	debug(result);

	assert(rule.declarations[0]['background-color'] === '#ff0000');

	console.log(result);

});

describe('CSS.parse/shorthand', function(assert) {
});


// describe('CSS.parse/selector', function(assert) {
//
// 	let declarations = [
// 		[ 'border-radius', '3px 4px 5px / 13px 14px 15px 16px' ]
// 		// [ 'background',            'url(\'/path/to/image.jpg\') top 13px repeat no-repeat #ff0000' ],
// 		// [ 'background-color',      'rgba(255, 13%, 0, 17.5%)' ],
// 		// [ 'background-size',       'contain'                  ],
// 		// [ 'background-size',       '70%'                      ],
// 		// [ 'background-color',      '#ffcc00'                  ],
// 		// [ 'background-position',   '13px 37px'                ],
// 		// [ 'background-position-x', '37px'                     ]
// 	];
//
// 	let buffer = create([ 'body > main' ], declarations);
//
// 	console.info(declarations.map((v) => v[0] + ': ' + v[1]).join('\n'));
//
// 	let result = null;
// 	try {
// 		result = CSS.parse(buffer);
// 	} catch (err) {
// 		console.error(err);
// 	}
//
//
// 	console.info('RESULT');
// 	console.warn(JSON.stringify(result, null, '\t'));
//
// 	assert(false);
//
// });

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

