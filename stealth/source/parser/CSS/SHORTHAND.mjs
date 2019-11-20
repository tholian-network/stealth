
import { console } from '../../console.mjs';

import { clone, find, has, match, parse_value } from '../CSS.mjs';

import { NORMAL } from './NORMAL.mjs';
import { STYLES } from './STYLES.mjs';



export const SHORTHAND = {

	/*
	 * UNSUPPORTED
	 */

	'offset': () => {},



	/*
	 * SUPPORTED
	 */

	'animation': () => {
		// TODO: animation
	},

	'background': (values, result) => {

		let color = find.call(values, STYLES['background-color']);
		if (color.length > 0) {
			NORMAL['background-color'](color, result);
		}

		let image = find.call(values, STYLES['background-image']);
		if (image.length > 0) {
			NORMAL['background-image'](image, result);
		}

		let position = find.call(values, STYLES['background-position'], { min: 1, max: 2 });
		if (position.length > 0) {
			NORMAL['background-position'](position, result);
		}

		let repeat = find.call(values, STYLES['background-repeat'], { min: 1, max: 2 });
		if (repeat.length > 0) {
			NORMAL['background-repeat'](repeat, result);
		}

		let attachment = find.call(values, STYLES['background-attachment']);
		if (attachment.length > 0) {
			NORMAL['background-attachment'](attachment, result);
		}


		// XXX: background-clip has same values as background-origin
		let boxes = find.call(values, STYLES['background-clip'], { min: 1, max: 2 });
		if (boxes.length === 2) {
			NORMAL['background-origin']([ boxes[0] ], result);
			NORMAL['background-clip']([ boxes[1] ], result);
		} else if (boxes.length === 1) {
			NORMAL['background-origin']([ boxes[0] ], result);
			NORMAL['background-clip']([ boxes[0] ], result);
		}


		// XXX: Technically a spec violation, but most people are idiots.
		let color_bg = find.call(values, STYLES['background-color']);
		if (color_bg.length > 0) {
			NORMAL['background-color'](color_bg, result);
		}

	},

	'border': (values, result) => {

		let width = find.call(values, STYLES['border-width']);
		if (width.length > 0) {
			SHORTHAND['border-width']([ width[0] ], result);
		}

		let style = find.call(values, STYLES['border-style']);
		if (style.length > 0) {
			SHORTHAND['border-style']([ style[0] ], result);
		}

		let color = find.call(values, STYLES['border-color']);
		if (color.length > 0) {
			SHORTHAND['border-color']([ color[0] ], result);
		}

	},

	'border-bottom': (values, result) => {

		let width = find.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['border-bottom-width']([ width[0] ], result);
		}

		let style = find.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['border-bottom-style']([ style[0] ], result);
		}

		let color = find.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['border-bottom-color']([ color[0] ], result);
		}

	},

	'border-color': (values, result) => {

		let color = find.call(values, STYLES['border-color'], { min: 1, max: 4 });
		if (color.length === 4) {
			NORMAL['border-top-color']([ color[0] ], result);
			NORMAL['border-right-color']([ color[1] ], result);
			NORMAL['border-bottom-color']([ color[2] ], result);
			NORMAL['border-left-color']([ color[3] ], result);
		} else if (color.length === 3) {
			NORMAL['border-top-color']([ color[0] ], result);
			NORMAL['border-right-color']([ color[1] ], result);
			NORMAL['border-bottom-color']([ color[2] ], result);
			NORMAL['border-left-color']([ color[1] ], result);
		} else if (color.length === 2) {
			NORMAL['border-top-color']([ color[0] ], result);
			NORMAL['border-right-color']([ color[1] ], result);
			NORMAL['border-bottom-color']([ color[0] ], result);
			NORMAL['border-left-color']([ color[1] ], result);
		} else if (color.length === 1) {
			NORMAL['border-top-color']([ color[0] ], result);
			NORMAL['border-right-color']([ color[0] ], result);
			NORMAL['border-bottom-color']([ color[0] ], result);
			NORMAL['border-left-color']([ color[0] ], result);
		}

	},

	'border-left': (values, result) => {

		let width = find.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['border-left-width']([ width[0] ], result);
		}

		let style = find.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['border-left-style']([ style[0] ], result);
		}

		let color = find.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['border-left-color']([ color[0] ], result);
		}

	},

	'border-radius': (values, result) => {

		let filtered = {
			'top-left':     [],
			'top-right':    [],
			'bottom-right': [],
			'bottom-left':  []
		};


		let has_slash = has.call(values, {
			'val': [ '/' ]
		}, { min: 1, max: 1 });
		if (has_slash === true) {

			let before = find.call(values, {
				'typ': [ 'length', 'percentage' ]
			}, { min: 1, max: 4 });

			// strip out the slash
			find.call(values, {
				'val': [ '/' ]
			}, { min: 1, max: 1 });

			let after = find.call(values, {
				'typ': [ 'length', 'percentage' ]
			}, { min: 1, max: 4 });

			if (before.length === 4) {
				filtered['top-left'].push(clone(before[0]));
				filtered['top-right'].push(clone(before[1]));
				filtered['bottom-right'].push(clone(before[2]));
				filtered['bottom-left'].push(clone(before[3]));
			} else if (before.length === 3) {
				filtered['top-left'].push(clone(before[0]));
				filtered['top-right'].push(clone(before[1]));
				filtered['bottom-right'].push(clone(before[2]));
				filtered['bottom-left'].push(clone(before[1]));
			} else if (before.length === 2) {
				filtered['top-left'].push(clone(before[0]));
				filtered['top-right'].push(clone(before[1]));
				filtered['bottom-right'].push(clone(before[0]));
				filtered['bottom-left'].push(clone(before[1]));
			} else if (before.length === 1) {
				filtered['top-left'].push(clone(before[0]));
				filtered['top-right'].push(clone(before[0]));
				filtered['bottom-right'].push(clone(before[0]));
				filtered['bottom-left'].push(clone(before[0]));
			}

			if (after.length === 4) {
				filtered['top-left'].push(clone(after[0]));
				filtered['top-right'].push(clone(after[1]));
				filtered['bottom-right'].push(clone(after[2]));
				filtered['bottom-left'].push(clone(after[3]));
			} else if (after.length === 3) {
				filtered['top-left'].push(clone(after[0]));
				filtered['top-right'].push(clone(after[1]));
				filtered['bottom-right'].push(clone(after[2]));
				filtered['bottom-left'].push(clone(after[1]));
			} else if (after.length === 2) {
				filtered['top-left'].push(clone(after[0]));
				filtered['top-right'].push(clone(after[1]));
				filtered['bottom-right'].push(clone(after[0]));
				filtered['bottom-left'].push(clone(after[1]));
			} else if (after.length === 1) {
				filtered['top-left'].push(clone(after[0]));
				filtered['top-right'].push(clone(after[0]));
				filtered['bottom-right'].push(clone(after[0]));
				filtered['bottom-left'].push(clone(after[0]));
			}

		} else {

			let radius = find.call(values, {
				'typ': [ 'length', 'percentage' ]
			}, { min: 1, max: 4 });

			if (radius.length === 4) {
				filtered['top-left'].push(clone(radius[0]));
				filtered['top-right'].push(clone(radius[1]));
				filtered['bottom-right'].push(clone(radius[2]));
				filtered['bottom-left'].push(clone(radius[3]));
			} else if (radius.length === 3) {
				filtered['top-left'].push(clone(radius[0]));
				filtered['top-right'].push(clone(radius[1]));
				filtered['bottom-right'].push(clone(radius[2]));
				filtered['bottom-left'].push(clone(radius[1]));
			} else if (radius.length === 2) {
				filtered['top-left'].push(clone(radius[0]));
				filtered['top-right'].push(clone(radius[1]));
				filtered['bottom-right'].push(clone(radius[0]));
				filtered['bottom-left'].push(clone(radius[1]));
			} else if (radius.length === 1) {
				filtered['top-left'].push(clone(radius[0]));
				filtered['top-right'].push(clone(radius[0]));
				filtered['bottom-right'].push(clone(radius[0]));
				filtered['bottom-left'].push(clone(radius[0]));
			}

		}

		if (filtered['top-left'].length > 0) {
			NORMAL['border-top-left-radius'](filtered['top-left'], result);
		}

		if (filtered['top-right'].length > 0) {
			NORMAL['border-top-right-radius'](filtered['top-right'], result);
		}

		if (filtered['bottom-right'].length > 0) {
			NORMAL['border-bottom-right-radius'](filtered['bottom-right'], result);
		}

		if (filtered['bottom-left'].length > 0) {
			NORMAL['border-bottom-left-radius'](filtered['bottom-left'], result);
		}

	},

	'border-right': (values, result) => {

		let width = find.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['border-right-width']([ width[0] ], result);
		}

		let style = find.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['border-right-style']([ style[0] ], result);
		}

		let color = find.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['border-right-color']([ color[0] ], result);
		}

	},

	'border-style': (values, result) => {

		let style = find.call(values, STYLES['border-style'], { min: 1, max: 4 });
		if (style.length === 4) {
			NORMAL['border-top-style']([ style[0] ], result);
			NORMAL['border-right-style']([ style[1] ], result);
			NORMAL['border-bottom-style']([ style[2] ], result);
			NORMAL['border-left-style']([ style[3] ], result);
		} else if (style.length === 3) {
			NORMAL['border-top-style']([ style[0] ], result);
			NORMAL['border-right-style']([ style[1] ], result);
			NORMAL['border-bottom-style']([ style[2] ], result);
			NORMAL['border-left-style']([ style[1] ], result);
		} else if (style.length === 2) {
			NORMAL['border-top-style']([ style[0] ], result);
			NORMAL['border-right-style']([ style[1] ], result);
			NORMAL['border-bottom-style']([ style[0] ], result);
			NORMAL['border-left-style']([ style[1] ], result);
		} else if (style.length === 1) {
			NORMAL['border-top-style']([ style[0] ], result);
			NORMAL['border-right-style']([ style[0] ], result);
			NORMAL['border-bottom-style']([ style[0] ], result);
			NORMAL['border-left-style']([ style[0] ], result);
		}

	},

	'border-top': (values, result) => {

		let width = find.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['border-top-width']([ width[0] ], result);
		}

		let style = find.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['border-top-style']([ style[0] ], result);
		}

		let color = find.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['border-top-color']([ color[0] ], result);
		}

	},

	'border-width': (values, result) => {

		let width = find.call(values, STYLES['border-width'], { min: 1, max: 4 });
		if (width.length === 4) {
			NORMAL['border-top-width']([ width[0] ], result);
			NORMAL['border-right-width']([ width[1] ], result);
			NORMAL['border-bottom-width']([ width[2] ], result);
			NORMAL['border-left-width']([ width[3] ], result);
		} else if (width.length === 3) {
			NORMAL['border-top-width']([ width[0] ], result);
			NORMAL['border-right-width']([ width[1] ], result);
			NORMAL['border-bottom-width']([ width[2] ], result);
			NORMAL['border-left-width']([ width[1] ], result);
		} else if (width.length === 2) {
			NORMAL['border-top-width']([ width[0] ], result);
			NORMAL['border-right-width']([ width[1] ], result);
			NORMAL['border-bottom-width']([ width[0] ], result);
			NORMAL['border-left-width']([ width[1] ], result);
		} else if (width.length === 1) {
			NORMAL['border-top-width']([ width[0] ], result);
			NORMAL['border-right-width']([ width[0] ], result);
			NORMAL['border-bottom-width']([ width[0] ], result);
			NORMAL['border-left-width']([ width[0] ], result);
		}

	},

	'column-rule': (values, result) => {

		let width = find.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['column-rule-width']([ width[0] ], result);
		}

		let style = find.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['column-rule-style']([ style[0] ], result);
		}

		let color = find.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['column-rule-color']([ color[0] ], result);
		}

	},

	'columns': (values, result) => {

		let width = find.call(values, STYLES['column-width']);
		if (width.length > 0) {
			NORMAL['column-width']([ width[0] ], result);
		}

		let count = find.call(values, STYLES['column-count']);
		if (count.length > 0) {
			NORMAL['column-count']([ count[0] ], result);
		}

	},

	'flex': (values, result) => {

		if (values.length === 1) {

			let keyword = values[0];
			if (keyword.val === 'initial') {
				values = [ '0', '1', 'auto' ].map((v) => parse_value(v));
			} else if (keyword.val === 'auto') {
				values = [ '1', '1', 'auto' ].map((v) => parse_value(v));
			} else if (keyword.val === 'none') {
				values = [ '0', '0', 'auto' ].map((v) => parse_value(v));
			}

		}


		let grow = find.call(values, STYLES['flex-grow']);
		if (grow.length > 0) {
			NORMAL['flex-grow']([ grow[0] ], result);
		}

		let shrink = find.call(values, STYLES['flex-shrink']);
		if (shrink.length > 0) {
			NORMAL['flex-shrink']([ shrink[0] ], result);
		}

		let basis = find.call(values, STYLES['flex-basis']);
		if (basis.length > 0) {
			NORMAL['flex-basis']([ basis[0] ], result);
		}

	},

	'flex-flow': (values, result) => {

		let direction = find.call(values, STYLES['flex-direction']);
		if (direction.length > 0) {
			NORMAL['flex-direction']([ direction[0] ], result);
		}

		let wrap = find.call(values, STYLES['flex-wrap']);
		if (wrap.length > 0) {
			NORMAL['flex-wrap']([ wrap[0] ], result);
		}

	},

	'font': (values, result) => {

		let style = find.call(values, STYLES['font-style']);
		if (style.length > 0) {
			NORMAL['font-style']([ style[0] ], result);
		}

		let check = values[0];
		if (match.call(check, [ STYLES['font-weight'], STYLES['font-stretch'], STYLES['font-size'] ]) === false) {
			values.splice(0, 1);
		}

		let weight = find.call(values, STYLES['font-weight']);
		if (weight.length > 0) {
			NORMAL['font-weight']([ weight[0] ], result);
		}

		let stretch = find.call(values, STYLES['font-stretch']);
		if (stretch.length > 0) {
			NORMAL['font-stretch']([ stretch[0] ], result);
		}


		let has_slash = has.call(values, {
			'val': [ '/' ]
		}, { min: 1, max: 1 });
		if (has_slash === true) {

			let before = find.call(values, STYLES['font-size']);

			// strip out the slash
			find.call(values, {
				'val': [ '/' ]
			}, { min: 1, max: 1 });

			let after = find.call(values, STYLES['line-height']);

			if (before.length === 1 && after.length === 1) {

				NORMAL['font-size']([ before[0] ], result);
				NORMAL['line-height']([ after[0] ], result);

			}

		} else {

			let size = find.call(values, STYLES['font-size']);
			if (size.length > 0) {
				NORMAL['font-size']([ size[0] ], result);
			}

		}


		if (values.length > 0) {

			let probably_family = false;

			let first_value = values[0];
			if (
				first_value.raw.includes('"')
				|| first_value.raw.includes('\'')
				|| first_value.raw.includes(',')
				|| first_value.raw.toLowerCase() !== first_value.raw
			) {
				probably_family = true;
			}

			if (probably_family === true) {

				let family = parse_value(values.map((val) => val.raw).join(' '));
				if (family.typ === 'string' || family.typ === 'other') {
					NORMAL['font-family']([ family ], result);
				}

			} else {

				let first_value = values.find((value) => {

					if (
						value.raw.includes('"')
						|| value.raw.includes('\'')
						|| value.raw.includes(',')
						|| value.raw.toLowerCase() !== value.raw
					) {
						return true;
					}

					return false;

				}) || null;

				if (first_value !== null) {

					let family = parse_value(values.slice(values.indexOf(first_value)).map((val) => val.raw).join(' '));
					if (family.typ === 'string' || family.typ === 'other') {
						NORMAL['font-family']([ family ], result);
					}

				}

			}

		}

	},

	'grid':            () => {},
	'grid-area':       () => {},
	'grid-column':     () => {},
	'grid-row':        () => {},
	'grid-template':   () => {},

	'list-style': (values, result) => {

		let type = find.call(values, STYLES['list-style-type']);
		if (type.length === 1) {
			NORMAL['list-style-type']([ type[0] ], result);
		}

		let image = find.call(values, STYLES['list-style-image']);
		if (image.length > 0) {
			NORMAL['list-style-image'](image, result);
		}

		let position = find.call(values, STYLES['list-style-position']);
		if (position.length > 0) {
			NORMAL['list-style-position']([ position[0] ], result);
		}

	},

	'margin': (values, result) => {

		let margin = find.call(values, STYLES['margin'], { min: 1, max: 4 });
		if (margin.length === 4) {
			NORMAL['margin-top']([ margin[0] ], result);
			NORMAL['margin-right']([ margin[1] ], result);
			NORMAL['margin-bottom']([ margin[2] ], result);
			NORMAL['margin-left']([ margin[3] ], result);
		} else if (margin.length === 3) {
			NORMAL['margin-top']([ margin[0] ], result);
			NORMAL['margin-right']([ margin[1] ], result);
			NORMAL['margin-bottom']([ margin[2] ], result);
			NORMAL['margin-left']([ margin[1] ], result);
		} else if (margin.length === 2) {
			NORMAL['margin-top']([ margin[0] ], result);
			NORMAL['margin-right']([ margin[1] ], result);
			NORMAL['margin-bottom']([ margin[0] ], result);
			NORMAL['margin-left']([ margin[1] ], result);
		} else if (margin.length === 1) {
			NORMAL['margin-top']([ margin[0] ], result);
			NORMAL['margin-right']([ margin[0] ], result);
			NORMAL['margin-bottom']([ margin[0] ], result);
			NORMAL['margin-left']([ margin[0] ], result);
		}

	},

	'outline': (values, result) => {

		let color = find.call(values, STYLES['outline-color']);
		if (color.length > 0) {
			NORMAL['outline-color']([ color[0] ], result);
		}

		let style = find.call(values, STYLES['outline-style']);
		if (style.length > 0) {
			NORMAL['outline-style']([ style[0] ], result);
		}

		let width = find.call(values, STYLES['outline-width']);
		if (width.length > 0) {
			NORMAL['outline-width']([ width[0] ], result);
		}

	},

	'overflow': (values, result) => {

		let overflow = find.call(values, STYLES['overflow'], { min: 1, max: 2 });
		if (overflow.length === 2) {
			NORMAL['overflow-x']([ overflow[0] ], result);
			NORMAL['overflow-y']([ overflow[1] ], result);
		} else if (overflow.length === 1) {
			NORMAL['overflow-x']([ overflow[0] ], result);
			NORMAL['overflow-y']([ overflow[0] ], result);
		}

	},

	'padding': (values, result) => {

		let padding = find.call(values, STYLES['padding'], { min: 1, max: 4 });
		if (padding.length === 4) {
			NORMAL['padding-top']([ padding[0] ], result);
			NORMAL['padding-right']([ padding[1] ], result);
			NORMAL['padding-bottom']([ padding[2] ], result);
			NORMAL['padding-left']([ padding[3] ], result);
		} else if (padding.length === 3) {
			NORMAL['padding-top']([ padding[0] ], result);
			NORMAL['padding-right']([ padding[1] ], result);
			NORMAL['padding-bottom']([ padding[2] ], result);
			NORMAL['padding-left']([ padding[1] ], result);
		} else if (padding.length === 2) {
			NORMAL['padding-top']([ padding[0] ], result);
			NORMAL['padding-right']([ padding[1] ], result);
			NORMAL['padding-bottom']([ padding[0] ], result);
			NORMAL['padding-left']([ padding[1] ], result);
		} else if (padding.length === 1) {
			NORMAL['padding-top']([ padding[0] ], result);
			NORMAL['padding-right']([ padding[0] ], result);
			NORMAL['padding-bottom']([ padding[0] ], result);
			NORMAL['padding-left']([ padding[0] ], result);
		}

	},

	'place-content':   () => {},
	'place-items':     () => {},
	'place-self':      () => {},

	'text-decoration': (values, result) => {

		let line = find.call(values, STYLES['text-decoration-line']);
		if (line.length > 0) {
			NORMAL['text-decoration-line']([ line[0] ], result);
		}

		let style = find.call(values, STYLES['text-decoration-style']);
		if (style.length > 0) {
			NORMAL['text-decoration-style']([ style[0] ], result);
		}

		let color = find.call(values, STYLES['text-decoration-color']);
		if (color.length > 0) {
			NORMAL['text-decoration-color']([ color[0] ], result);
		}


	},

	'transition':      () => {}

};



export default { SHORTHAND };

