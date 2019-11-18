
import { console } from '../../console.mjs';

import { find, parse_chunk } from '../CSS.mjs';
import { STYLES            } from './STYLES.mjs';



const single_value = function(property, search, values, result) {

	let tmp = find.call(values, search, { min: 1, max: 1 });
	if (tmp.length > 0) {
		result[property] = tmp[0];
	}

};

const multi_values = function(property, search, limit, values, result) {

	let tmp = find.call(values, search, limit);
	if (tmp.length > 0) {
		result[property] = tmp;
	}

};



export const NORMAL = {

	'background-position': (values, result) => {

		let position = find.call(values, STYLES['background-position'], { min: 1, max: 2 });
		if (position.length === 2) {

			result['background-position-x'] = position[0];
			result['background-position-y'] = position[1];

		} else if (position.length === 1) {

			let val = position[0].val;
			let typ = position[0].typ;
			if (val === 'top') {
				result['background-position-x'] = parse_chunk('50%');
				result['background-position-y'] = parse_chunk('top');
			} else if (val === 'right') {
				result['background-position-x'] = parse_chunk('right');
				result['background-position-y'] = parse_chunk('50%');
			} else if (val === 'bottom') {
				result['background-position-x'] = parse_chunk('50%');
				result['background-position-y'] = parse_chunk('bottom');
			} else if (val === 'left') {
				result['background-position-x'] = parse_chunk('left');
				result['background-position-y'] = parse_chunk('50%');
			} else if (typ === 'length' || typ === 'percentage') {
				result['background-position-x'] = position[0];
				result['background-position-y'] = parse_chunk('50%');
			}

		}

	},

	'background-repeat': (values, result) => {

		let repeat = find.call(values, STYLES['background-repeat'], { min: 1, max: 2 });
		if (repeat.length > 0) {

			if (repeat.length === 2) {

				result['background-repeat-x'] = repeat[0];
				result['background-repeat-y'] = repeat[1];

			} else if (repeat.length === 1) {

				let val = repeat[0].val;
				if (val === 'repeat-x') {
					result['background-repeat-x'] = parse_chunk('repeat');
					result['background-repeat-y'] = parse_chunk('no-repeat');
				} else if (val === 'repeat-y') {
					result['background-repeat-x'] = parse_chunk('no-repeat');
					result['background-repeat-y'] = parse_chunk('repeat');
				} else if (val === 'repeat') {
					result['background-repeat-x'] = parse_chunk('repeat');
					result['background-repeat-y'] = parse_chunk('repeat');
				} else if (val === 'space') {
					result['background-repeat-x'] = parse_chunk('space');
					result['background-repeat-y'] = parse_chunk('space');
				} else if (val === 'round') {
					result['background-repeat-x'] = parse_chunk('round');
					result['background-repeat-y'] = parse_chunk('round');
				} else if (val === 'no-repeat') {
					result['background-repeat-x'] = parse_chunk('no-repeat');
					result['background-repeat-y'] = parse_chunk('no-repeat');
				}

			}

		}

	},

	'background-size': (values, result) => {

		let size = find.call(values, STYLES['background-size'], { min: 1, max: 2 });
		if (size.length > 0) {

			if (size.length === 2) {

				result['background-size-x'] = size[0];
				result['background-size-y'] = size[1];

			} else if (size.length === 1) {

				// TODO: Two modes: keywords or values
				// If length or percentage, value represents width and height is auto

				let val = size[0].val;
				let typ = size[0].typ;
				if (val === 'contain') {
					result['background-size-x'] = parse_chunk('contain');
					result['background-size-y'] = parse_chunk('contain');
				} else if (val === 'cover') {
					result['background-size-x'] = parse_chunk('cover');
					result['background-size-y'] = parse_chunk('cover');
				} else if (val === 'auto') {
					result['background-size-x'] = parse_chunk('auto');
					result['background-size-y'] = parse_chunk('auto');
				} else if (typ === 'length' || typ === 'percentage') {
					result['background-size-x'] = size[0];
					result['background-size-y'] = parse_chunk('auto');
				}

			}

		}

	},



	'border-bottom-left-radius':  multi_values.bind(null, 'border-bottom-left-radius',  STYLES['border-radius'], { min: 1, max: 2 }),
	'border-bottom-right-radius': multi_values.bind(null, 'border-bottom-right-radius', STYLES['border-radius'], { min: 1, max: 2 }),
	'border-top-left-radius':     multi_values.bind(null, 'border-top-left-radius',     STYLES['border-radius'], { min: 1, max: 2 }),
	'border-top-right-radius':    multi_values.bind(null, 'border-top-right-radius',    STYLES['border-radius'], { min: 1, max: 2 }),

	'background-attachment': single_value.bind(null, 'background-attachment', STYLES['background-attachment']),
	'background-clip':       single_value.bind(null, 'background-clip',       STYLES['background-clip']),
	'background-color':      single_value.bind(null, 'background-color',      STYLES['background-color']),
	'background-image':      single_value.bind(null, 'background-image',      STYLES['background-image']),
	'background-origin':     single_value.bind(null, 'background-origin',     STYLES['background-origin']),

	'border-top-color':      single_value.bind(null, 'border-top-color',      STYLES['border-color']),
	'border-top-style':      single_value.bind(null, 'border-top-style',      STYLES['border-style']),
	'border-top-width':      single_value.bind(null, 'border-top-width',      STYLES['border-width']),
	'border-right-color':    single_value.bind(null, 'border-right-color',    STYLES['border-color']),
	'border-right-style':    single_value.bind(null, 'border-right-style',    STYLES['border-style']),
	'border-right-width':    single_value.bind(null, 'border-right-width',    STYLES['border-width']),
	'border-bottom-color':   single_value.bind(null, 'border-bottom-color',   STYLES['border-color']),
	'border-bottom-style':   single_value.bind(null, 'border-bottom-style',   STYLES['border-style']),
	'border-bottom-width':   single_value.bind(null, 'border-bottom-width',   STYLES['border-width']),
	'border-left-color':     single_value.bind(null, 'border-left-color',     STYLES['border-color']),
	'border-left-style':     single_value.bind(null, 'border-left-style',     STYLES['border-style']),
	'border-left-width':     single_value.bind(null, 'border-left-width',     STYLES['border-width']),

	'font-stretch':          single_value.bind(null, 'font-stretch',          STYLES['font-stretch']),
	'font-size':             single_value.bind(null, 'font-size',             STYLES['font-size']),
	'font-style':            single_value.bind(null, 'font-style',            STYLES['font-style']),
	'font-weight':           single_value.bind(null, 'font-weight',           STYLES['font-weight']),

	'line-height':           single_value.bind(null, 'line-height',           STYLES['line-height']),

	'list-style-image':      single_value.bind(null, 'list-style-image',      STYLES['list-style-image']),
	'list-style-position':   single_value.bind(null, 'list-style-position',   STYLES['list-style-position']),
	'list-style-type':       single_value.bind(null, 'list-style-type',       STYLES['list-style-type']),

	'margin-top':            single_value.bind(null, 'margin-top',            STYLES['margin']),
	'margin-right':          single_value.bind(null, 'margin-right',          STYLES['margin']),
	'margin-bottom':         single_value.bind(null, 'margin-bottom',         STYLES['margin']),
	'margin-left':           single_value.bind(null, 'margin-left',           STYLES['margin']),

	'outline-color':         single_value.bind(null, 'outline-color',         STYLES['outline-color']),
	'outline-style':         single_value.bind(null, 'outline-style',         STYLES['outline-style']),
	'outline-width':         single_value.bind(null, 'outline-width',         STYLES['outline-width']),

	'overflow-x':            single_value.bind(null, 'overflow-x',            STYLES['overflow']),
	'overflow-y':            single_value.bind(null, 'overflow-y',            STYLES['overflow']),

	'padding-top':           single_value.bind(null, 'padding-top',           STYLES['padding']),
	'padding-right':         single_value.bind(null, 'padding-right',         STYLES['padding']),
	'padding-bottom':        single_value.bind(null, 'padding-bottom',        STYLES['padding']),
	'padding-left':          single_value.bind(null, 'padding-left',          STYLES['padding']),

};



export default { NORMAL };

