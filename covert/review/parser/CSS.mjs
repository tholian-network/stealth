
import { console } from '../../source/console.mjs';

import { Buffer } from 'buffer';

import { describe, finish } from '../../source/Review.mjs';
import { CSS              } from '../../../stealth/source/parser/CSS.mjs';



const create = (declarations) => {

	let str = '#sandbox > element {\n';

	Object.keys(declarations).forEach((key) => {
		str += '\t' + key + ': ' + declarations[key] + ';\n';
	});

	str += '}\n';


	let buffer = Buffer.from(str, 'utf8');
	let result = null;

	try {
		result = CSS.parse(buffer);
	} catch (err) {
		console.error(err);
	}

	if (result instanceof Object && result.type === 'root') {

		if (result.rules instanceof Array) {
			return result.rules[0].declarations[0];
		}

	}

	return null;

};



describe('CSS.parse/normal', function(assert) {

	let result = create({
		'background-color':      '#ffcc00',
		'background-size':       'contain',
		'background-position':   '13% 37px',
		'background-position-y': '137px'
	});

	assert(result !== null);
	assert(result['background-color'].val,      [ 255, 204, 0, 1 ]);
	assert(result['background-size-x'].val,     'contain');
	assert(result['background-size-y'].val,     'contain');
	assert(result['background-position-x'].ext, '%');
	assert(result['background-position-x'].val, 13);
	assert(result['background-position-y'].ext, 'px');
	assert(result['background-position-y'].val, 137);

});

describe('CSS.parse/animation', function(assert) {

	let result = create({
		'animation': 'ease-out move, 1s ease-in 200ms infinite alternate backwards paused shake'
	});

	assert(result !== null);
	assert(result['animation-duration'].length === 2);
	assert(result['animation-duration'].map((e) => e.ext), [ 's', 's' ]);
	assert(result['animation-duration'].map((e) => e.val), [ 0, 1 ]);
	assert(result['animation-timing-function'].length === 2);
	assert(result['animation-timing-function'].map((e) => e.val), [ 'ease-out', 'ease-in' ]);
	assert(result['animation-delay'].length === 2);
	assert(result['animation-delay'].map((e) => e.ext), [ 's', 'ms' ]);
	assert(result['animation-delay'].map((e) => e.val), [ 0, 200 ]);
	assert(result['animation-iteration-count'].length === 2);
	assert(result['animation-iteration-count'].map((e) => e.typ), [ 'number', 'other' ]);
	assert(result['animation-iteration-count'].map((e) => e.val), [ 1, 'infinite' ]);
	assert(result['animation-direction'].length === 2);
	assert(result['animation-direction'].map((e) => e.val), [ 'normal', 'alternate' ]);
	assert(result['animation-fill-mode'].length === 2);
	assert(result['animation-fill-mode'].map((e) => e.val), [ 'none', 'backwards' ]);
	assert(result['animation-play-state'].length === 2);
	assert(result['animation-play-state'].map((e) => e.val), [ 'running', 'paused' ]);
	assert(result['animation-name'].length === 2);
	assert(result['animation-name'].map((e) => e.val), [ 'move', 'shake' ]);

});

describe('CSS.parse/animation-delay', function(assert) {

	let result1 = create({
		'animation-delay': '13ms'
	});

	let result2 = create({
		'animation-delay': '13ms, 37s'
	});

	assert(result1 !== null);
	assert(result1['animation-delay'][0].ext, 'ms');
	assert(result1['animation-delay'][0].val, 13);

	assert(result2 !== null);
	assert(result2['animation-delay'][0].ext, 'ms');
	assert(result2['animation-delay'][0].val, 13);
	assert(result2['animation-delay'][1].ext, 's');
	assert(result2['animation-delay'][1].val, 37);

});

describe('CSS.parse/animation-direction', function(assert) {

	let result1 = create({
		'animation-direction': 'normal'
	});

	let result2 = create({
		'animation-direction': 'reverse, alternate'
	});

	assert(result1 !== null);
	assert(result1['animation-direction'][0].val, 'normal');

	assert(result2 !== null);
	assert(result2['animation-direction'][0].val, 'reverse');
	assert(result2['animation-direction'][1].val, 'alternate');

});

describe('CSS.parse/animation-duration', function(assert) {
});

describe('CSS.parse/animation-fill-mode', function(assert) {
});

describe('CSS.parse/animation-iteration-count', function(assert) {
});

describe('CSS.parse/animation-name', function(assert) {
});

describe('CSS.parse/animation-play-state', function(assert) {
});

describe('CSS.parse/animation-timing-function', function(assert) {
});

describe('CSS.parse/background', function(assert) {

	let result = create({
		'background': 'url(\'/path/to/image.jpg\') top 13px repeat no-repeat fixed border-box content-box #ff0000'
	});

	assert(result !== null);
	assert(result['background-image'].typ,      'url');
	assert(result['background-image'].val,      '/path/to/image.jpg');
	assert(result['background-position-x'].ext, null);
	assert(result['background-position-x'].val, 'top');
	assert(result['background-position-y'].ext, 'px');
	assert(result['background-position-y'].val, 13);
	assert(result['background-repeat-x'].val,   'repeat');
	assert(result['background-repeat-y'].val,   'no-repeat');
	assert(result['background-attachment'].val, 'fixed');
	assert(result['background-origin'].val,     'border-box');
	assert(result['background-clip'].val,       'content-box');
	assert(result['background-color'].val,      [ 255, 0, 0, 1 ]);

});

describe('CSS.parse/border', function(assert) {

	let result = create({
		'border': 'medium dotted #ff00cc'
	});

	assert(result !== null);
	assert(result['border-top-width'].val,    'medium');
	assert(result['border-right-width'].val,  'medium');
	assert(result['border-bottom-width'].val, 'medium');
	assert(result['border-left-width'].val,   'medium');
	assert(result['border-top-style'].val,    'dotted');
	assert(result['border-right-style'].val,  'dotted');
	assert(result['border-bottom-style'].val, 'dotted');
	assert(result['border-left-style'].val,   'dotted');
	assert(result['border-top-color'].val,    [ 255, 0, 204, 1 ]);
	assert(result['border-right-color'].val,  [ 255, 0, 204, 1 ]);
	assert(result['border-bottom-color'].val, [ 255, 0, 204, 1 ]);
	assert(result['border-left-color'].val,   [ 255, 0, 204, 1 ]);

});

describe('CSS.parse/border-radius', function(assert) {

	let result = create({
		'border-radius': '1em 2px 3% / 4px 5px 6px 7px'
	});

	assert(result !== null);
	assert(result['border-top-left-radius'][0].ext,     'em');
	assert(result['border-top-left-radius'][0].val,     1);
	assert(result['border-top-left-radius'][1].ext,     'px');
	assert(result['border-top-left-radius'][1].val,     4);
	assert(result['border-top-right-radius'][0].ext,    'px');
	assert(result['border-top-right-radius'][0].val,    2);
	assert(result['border-top-right-radius'][1].ext,    'px');
	assert(result['border-top-right-radius'][1].val,    5);
	assert(result['border-bottom-right-radius'][0].ext, '%');
	assert(result['border-bottom-right-radius'][0].val, 3);
	assert(result['border-bottom-right-radius'][1].ext, 'px');
	assert(result['border-bottom-right-radius'][1].val, 6);
	assert(result['border-bottom-left-radius'][0].ext,  'px');
	assert(result['border-bottom-left-radius'][0].val,  2);
	assert(result['border-bottom-left-radius'][1].ext,  'px');
	assert(result['border-bottom-left-radius'][1].val,  7);

});

describe('CSS.parse/column-rule', function(assert) {

	let result = create({
		'column-rule': '13px dashed #ffcc00'
	});

	assert(result !== null);
	assert(result['column-rule-width'].ext, 'px');
	assert(result['column-rule-width'].val, 13);
	assert(result['column-rule-style'].ext, null);
	assert(result['column-rule-style'].val, 'dashed');
	assert(result['column-rule-color'].ext, null);
	assert(result['column-rule-color'].val, [ 255, 204, 0, 1 ]);

});

describe('CSS.parse/columns', function(assert) {

	let result = create({
		'columns':     'auto 13',
		'column-gap':  '37%',
		'column-fill': 'balance',
		'column-span': 'all'
	});

	assert(result !== null);
	assert(result['column-count'].ext, null);
	assert(result['column-count'].val, 13);
	assert(result['column-fill'].val,  'balance');
	assert(result['column-gap'].ext,   '%');
	assert(result['column-gap'].val,   37);
	assert(result['column-span'].val,  'all');
	assert(result['column-width'].val, 'auto');

});

describe('CSS.parse/flex', function(assert) {

	let result1 = create({
		'flex': 'initial'
	});

	let result2 = create({
		'flex': '1 1 fit-content'
	});

	assert(result1 !== null);
	assert(result1['flex-grow'].val,   0);
	assert(result1['flex-shrink'].val, 1);
	assert(result1['flex-basis'].val,  'auto');

	assert(result2 !== null);
	assert(result2['flex-grow'].val,   1);
	assert(result2['flex-shrink'].val, 1);
	assert(result2['flex-basis'].val,  'fit-content');

});

describe('CSS.parse/flex-flow', function(assert) {

	let result1 = create({
		'flex-flow': 'column-reverse wrap-reverse'
	});

	let result2 = create({
		'flex-flow': 'row nowrap'
	});

	assert(result1 !== null);
	assert(result1['flex-direction'].val, 'column-reverse');
	assert(result1['flex-wrap'].val,      'wrap-reverse');

	assert(result2 !== null);
	assert(result2['flex-direction'].val, 'row');
	assert(result2['flex-wrap'].val,      'nowrap');

});

describe('CSS.parse/font', function(assert) {

	let result = create({
		'font': 'italic bold condensed 13px/37px "Times New Roman", "Arial", Sedana, sans-serif'
	});

	assert(result !== null);
	assert(result['font-style'].val,     'italic');
	assert(result['font-weight'].val,    'bold');
	assert(result['font-stretch'].val,   'condensed');
	assert(result['font-size'].ext,      'px');
	assert(result['font-size'].val,      13);
	assert(result['line-height'].ext,    'px');
	assert(result['line-height'].val,    37);
	assert(result['font-family'].length, 4);
	assert(result['font-family'][0].val, 'Times New Roman');
	assert(result['font-family'][1].val, 'Arial');
	assert(result['font-family'][2].val, 'Sedana');
	assert(result['font-family'][3].val, 'sans-serif');

});

describe('CSS.parse/inset', function(assert) {

	let result1 = create({
		'inset': '1em 2px 3% 4pt'
	});

	let result2 = create({
		'inset': '1px 2% 3pt'
	});

	let result3 = create({
		'inset': '1% 2px'
	});

	let result4 = create({
		'inset': '1337px'
	});

	assert(result1 !== null);
	assert(result1['top'].ext,    'em');
	assert(result1['top'].val,    1);
	assert(result1['right'].ext,  'px');
	assert(result1['right'].val,  2);
	assert(result1['bottom'].ext, '%');
	assert(result1['bottom'].val, 3);
	assert(result1['left'].ext,   'pt');
	assert(result1['left'].val,   4);

	assert(result2 !== null);
	assert(result2['top'].ext,    'px');
	assert(result2['top'].val,    1);
	assert(result2['right'].ext,  '%');
	assert(result2['right'].val,  2);
	assert(result2['bottom'].ext, 'pt');
	assert(result2['bottom'].val, 3);
	assert(result2['left'].ext,   '%');
	assert(result2['left'].val,   2);

	assert(result3 !== null);
	assert(result3['top'].ext,    '%');
	assert(result3['top'].val,    1);
	assert(result3['right'].ext,  'px');
	assert(result3['right'].val,  2);
	assert(result3['bottom'].ext, '%');
	assert(result3['bottom'].val, 1);
	assert(result3['left'].ext,   'px');
	assert(result3['left'].val,   2);

	assert(result4 !== null);
	assert(result4['top'].ext,    'px');
	assert(result4['top'].val,    1337);
	assert(result4['right'].ext,  'px');
	assert(result4['right'].val,  1337);
	assert(result4['bottom'].ext, 'px');
	assert(result4['bottom'].val, 1337);
	assert(result4['left'].ext,   'px');
	assert(result4['left'].val,   1337);

});

describe('CSS.parse/list-style', function(assert) {

	let result = create({
		'list-style': 'circle url("/path/to/image.png") outside'
	});

	assert(result !== null);
	assert(result['list-style-type'].val,     'circle');
	assert(result['list-style-image'].val,    '/path/to/image.png');
	assert(result['list-style-position'].val, 'outside');

});

describe('CSS.parse/margin', function(assert) {

	let result1 = create({
		'margin': '1em 2px 3% 4pt'
	});

	let result2 = create({
		'margin': '1px 2% 3pt'
	});

	let result3 = create({
		'margin': '1% 2px'
	});

	let result4 = create({
		'margin': '1337px'
	});

	assert(result1 !== null);
	assert(result1['margin-top'].ext,    'em');
	assert(result1['margin-top'].val,    1);
	assert(result1['margin-right'].ext,  'px');
	assert(result1['margin-right'].val,  2);
	assert(result1['margin-bottom'].ext, '%');
	assert(result1['margin-bottom'].val, 3);
	assert(result1['margin-left'].ext,   'pt');
	assert(result1['margin-left'].val,   4);

	assert(result2 !== null);
	assert(result2['margin-top'].ext,    'px');
	assert(result2['margin-top'].val,    1);
	assert(result2['margin-right'].ext,  '%');
	assert(result2['margin-right'].val,  2);
	assert(result2['margin-bottom'].ext, 'pt');
	assert(result2['margin-bottom'].val, 3);
	assert(result2['margin-left'].ext,   '%');
	assert(result2['margin-left'].val,   2);

	assert(result3 !== null);
	assert(result3['margin-top'].ext,    '%');
	assert(result3['margin-top'].val,    1);
	assert(result3['margin-right'].ext,  'px');
	assert(result3['margin-right'].val,  2);
	assert(result3['margin-bottom'].ext, '%');
	assert(result3['margin-bottom'].val, 1);
	assert(result3['margin-left'].ext,   'px');
	assert(result3['margin-left'].val,   2);

	assert(result4 !== null);
	assert(result4['margin-top'].ext,    'px');
	assert(result4['margin-top'].val,    1337);
	assert(result4['margin-right'].ext,  'px');
	assert(result4['margin-right'].val,  1337);
	assert(result4['margin-bottom'].ext, 'px');
	assert(result4['margin-bottom'].val, 1337);
	assert(result4['margin-left'].ext,   'px');
	assert(result4['margin-left'].val,   1337);

});

describe('CSS.parse/outline', function(assert) {

	let result = create({
		'outline': '#ff00cc dotted medium'
	});

	assert(result !== null);
	assert(result['outline-color'].val, [ 255, 0, 204, 1 ]);
	assert(result['outline-style'].val, 'dotted');
	assert(result['outline-width'].val, 'medium');

});

describe('CSS.parse/overflow', function(assert) {

	let result1 = create({
		'overflow': 'visible'
	});

	let result2 = create({
		'overflow': 'auto scroll'
	});

	assert(result1 !== null);
	assert(result1['overflow-x'].val, 'visible');
	assert(result1['overflow-y'].val, 'visible');

	assert(result2 !== null);
	assert(result2['overflow-x'].val, 'auto');
	assert(result2['overflow-y'].val, 'scroll');

});

describe('CSS.parse/padding', function(assert) {

	let result1 = create({
		'padding': '1em 2px 3% 4pt'
	});

	let result2 = create({
		'padding': '1px 2% 3pt'
	});

	let result3 = create({
		'padding': '1% 2px'
	});

	let result4 = create({
		'padding': '1337px'
	});

	assert(result1 !== null);
	assert(result1['padding-top'].ext,    'em');
	assert(result1['padding-top'].val,    1);
	assert(result1['padding-right'].ext,  'px');
	assert(result1['padding-right'].val,  2);
	assert(result1['padding-bottom'].ext, '%');
	assert(result1['padding-bottom'].val, 3);
	assert(result1['padding-left'].ext,   'pt');
	assert(result1['padding-left'].val,   4);

	assert(result2 !== null);
	assert(result2['padding-top'].ext,    'px');
	assert(result2['padding-top'].val,    1);
	assert(result2['padding-right'].ext,  '%');
	assert(result2['padding-right'].val,  2);
	assert(result2['padding-bottom'].ext, 'pt');
	assert(result2['padding-bottom'].val, 3);
	assert(result2['padding-left'].ext,   '%');
	assert(result2['padding-left'].val,   2);

	assert(result3 !== null);
	assert(result3['padding-top'].ext,    '%');
	assert(result3['padding-top'].val,    1);
	assert(result3['padding-right'].ext,  'px');
	assert(result3['padding-right'].val,  2);
	assert(result3['padding-bottom'].ext, '%');
	assert(result3['padding-bottom'].val, 1);
	assert(result3['padding-left'].ext,   'px');
	assert(result3['padding-left'].val,   2);

	assert(result4 !== null);
	assert(result4['padding-top'].ext,    'px');
	assert(result4['padding-top'].val,    1337);
	assert(result4['padding-right'].ext,  'px');
	assert(result4['padding-right'].val,  1337);
	assert(result4['padding-bottom'].ext, 'px');
	assert(result4['padding-bottom'].val, 1337);
	assert(result4['padding-left'].ext,   'px');
	assert(result4['padding-left'].val,   1337);

});

describe('CSS.parse/place-content', function(assert) {

	let result1 = create({
		'place-content': 'flex-start'
	});

	let result2 = create({
		'place-content': 'flex-start unsafe'
	});

	let result3 = create({
		'place-content': 'invalid'
	});

	assert(result1 !== null);
	assert(result1['align-content'].val,   'flex-start');
	assert(result1['justify-content'].val, 'flex-start');

	assert(result2 !== null);
	assert(result2['align-content'].val,   'flex-start');
	assert(result2['justify-content'].val, 'unsafe');

	assert(result3 !== null);
	assert(result3['align-content'] === undefined);
	assert(result3['justify-content'] === undefined);

});

describe('CSS.parse/place-items', function(assert) {

	let result1 = create({
		'place-items': 'flex-start'
	});

	let result2 = create({
		'place-items': 'flex-start auto'
	});

	let result3 = create({
		'place-items': 'invalid'
	});

	assert(result1 !== null);
	assert(result1['align-items'].val,   'flex-start');
	assert(result1['justify-items'].val, 'flex-start');

	assert(result2 !== null);
	assert(result2['align-items'].val,   'flex-start');
	assert(result2['justify-items'].val, 'auto');

	assert(result3 !== null);
	assert(result3['align-items'] === undefined);
	assert(result3['justify-items'] === undefined);

});

describe('CSS.parse/place-self', function(assert) {

	let result1 = create({
		'place-self': 'flex-start'
	});

	let result2 = create({
		'place-self': 'flex-start auto'
	});

	let result3 = create({
		'place-self': 'invalid'
	});

	assert(result1 !== null);
	assert(result1['align-self'].val,   'flex-start');
	assert(result1['justify-self'].val, 'flex-start');

	assert(result2 !== null);
	assert(result2['align-self'].val,   'flex-start');
	assert(result2['justify-self'].val, 'auto');

	assert(result3 !== null);
	assert(result3['align-self'] === undefined);
	assert(result3['justify-self'] === undefined);

});

describe('CSS.parse/text-decoration', function(assert) {

	let result = create({
		'text-decoration': 'underline dashed #ffcc00'
	});

	assert(result !== null);
	assert(result['text-decoration-line'].val,  'underline');
	assert(result['text-decoration-style'].val, 'dashed');
	assert(result['text-decoration-color'].val, [ 255, 204, 0, 1 ]);

});

describe('CSS.parse/text-emphasis', function(assert) {

	let result1 = create({
		'text-emphasis': 'circle #ff0000'
	});

	let result2 = create({
		'text-emphasis': '"foo" #ffcc00'
	});

	assert(result1 !== null);
	assert(result1['text-emphasis-style'].val, 'circle');
	assert(result1['text-emphasis-color'].val, [ 255, 0, 0, 1 ]);

	assert(result2 !== null);
	assert(result2['text-emphasis-style'].val, 'f');
	assert(result2['text-emphasis-color'].val, [ 255, 204, 0, 1 ]);

});

describe('CSS.parse/transition', function(assert) {

	let result = create({
		'transition': 'margin-left ease-out, padding 1s ease-in 200ms'
	});

	assert(result !== null);
	assert(result['transition-property'].length === 2);
	assert(result['transition-property'].map((e) => e.val), [ 'margin-left', 'padding' ]);
	assert(result['transition-timing-function'].length === 2);
	assert(result['transition-timing-function'].map((e) => e.val), [ 'ease-out', 'ease-in' ]);
	assert(result['transition-duration'].length === 2);
	assert(result['transition-duration'].map((e) => e.ext), [ 's', 's' ]);
	assert(result['transition-duration'].map((e) => e.val), [ 0, 1 ]);
	assert(result['transition-delay'].length === 2);
	assert(result['transition-delay'].map((e) => e.ext), [ 's', 'ms' ]);
	assert(result['transition-delay'].map((e) => e.val), [ 0, 200 ]);

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

