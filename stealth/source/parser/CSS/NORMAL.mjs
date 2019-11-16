
import { console } from '../../console.mjs';

import { find, parse_chunk } from '../CSS.mjs';



const STYLES = {
	'border-color': {
		'typ': [ 'color' ]
	},
	'border-style': {
		'val': [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
	},
	'border-width': {
		'val': [ 'thin', 'medium', 'thick' ],
		'typ': [ 'length' ]
	},
	'margin': {
		'val': [ 'auto' ],
		'typ': [ 'length', 'percentage' ]
	},
	'outline-color': {
		'typ': [ 'color' ]
	},
	'outline-style': {
		'val': [ 'auto', 'none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
	},
	'outline-width': {
		'val': [ 'thin', 'medium', 'thick' ],
		'typ': [ 'length' ]
	},
	'overflow': {
		'val': [ 'auto', 'clip', 'hidden', 'scroll', 'visible' ]
	},
	'padding': {
		'typ': [ 'length', 'percentage' ]
	}
};



const single_value = function(property, search, values, result) {

	let tmp = find.call(values, search, { min: 1, max: 1 });
	if (tmp.length === 1) {
		result[property] = tmp[0];
	}

};



const NORMAL = {

	'background-attachment': (values, result) => {

		let attachment = find.call(values, {
			'val': [ 'scroll', 'fixed', 'local' ]
		});
		if (attachment.length > 0) {
			result['background-attachment'] = attachment.pop();
		}

	},

	'background-clip': (values, result) => {

		let clip = find.call(values, {
			'val': [ 'border-box', 'content-box', 'padding-box' ]
		}, { min: 1, max: 2 });
		if (clip.length > 0) {
			result['background-clip'] = clip.pop();
		}

	},

	'background-color': (values, result) => {

		let color = find.call(values, {
			'typ': [ 'color' ]
		});
		if (color.length > 0) {
			result['background-color'] = color.pop();
		}

	},

	'background-image': (values, result) => {

		let image = find.call(values, {
			'typ': [ 'url', 'gradient' ]
		});
		if (image.length > 0) {
			result['background-image'] = image.pop();
		}

	},

	'background-origin': (values, result) => {

		let origin = find.call(values, {
			'val': [ 'border-box', 'content-box', 'padding-box' ]
		}, { min: 1, max: 2 });
		if (origin.length > 0) {
			result['background-origin'] = origin.pop();
		}

	},

	'background-position': (values, result) => {

		let position = find.call(values, {
			'val': [ 'top', 'right', 'bottom', 'left', 'center' ],
			'typ': [ 'length', 'percentage' ]
		}, { min: 1, max: 2 });

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

		let repeat = find.call(values, {
			'val': [ 'repeat-x', 'repeat-y', 'repeat', 'space', 'round', 'no-repeat' ]
		}, { min: 1, max: 2 });
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

		let size = find.call(values, {
			'val': [ 'contain', 'cover', 'auto' ],
			'typ': [ 'length', 'percentage' ]
		});
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

	'border-bottom-left-radius': function(values, result) {

		let radius = find.call(values, {
			'typ': [ 'length', 'percentage' ]
		}, { min: 1, max: 2 });
		if (radius.length === 2) {
			result['border-bottom-left-radius'] = radius;
		} else if (radius.length === 1) {
			result['border-bottom-left-radius'] = radius[0];
		}

	},

	'border-bottom-right-radius': function(values, result) {

		let radius = find.call(values, {
			'typ': [ 'length', 'percentage' ]
		}, { min: 1, max: 2 });
		if (radius.length === 2) {
			result['border-bottom-right-radius'] = radius;
		} else if (radius.length === 1) {
			result['border-bottom-right-radius'] = radius[0];
		}

	},

	'border-top-left-radius': function(values, result) {

		let radius = find.call(values, {
			'typ': [ 'length', 'percentage' ]
		}, { min: 1, max: 2 });
		if (radius.length === 2) {
			result['border-top-left-radius'] = radius;
		} else if (radius.length === 1) {
			result['border-top-left-radius'] = radius[0];
		}

	},

	'border-top-right-radius': function(values, result) {

		let radius = find.call(values, {
			'typ': [ 'length', 'percentage' ]
		}, { min: 1, max: 2 });
		if (radius.length === 2) {
			result['border-top-right-radius'] = radius;
		} else if (radius.length === 1) {
			result['border-top-right-radius'] = radius[0];
		}

	},



	'border-top-color':    single_value.bind(null, 'border-top-color',    STYLES['border-color']),
	'border-top-style':    single_value.bind(null, 'border-top-style',    STYLES['border-style']),
	'border-top-width':    single_value.bind(null, 'border-top-width',    STYLES['border-width']),
	'border-right-color':  single_value.bind(null, 'border-right-color',  STYLES['border-color']),
	'border-right-style':  single_value.bind(null, 'border-right-style',  STYLES['border-style']),
	'border-right-width':  single_value.bind(null, 'border-right-width',  STYLES['border-width']),
	'border-bottom-color': single_value.bind(null, 'border-bottom-color', STYLES['border-color']),
	'border-bottom-style': single_value.bind(null, 'border-bottom-style', STYLES['border-style']),
	'border-bottom-width': single_value.bind(null, 'border-bottom-width', STYLES['border-width']),
	'border-left-color':   single_value.bind(null, 'border-left-color',   STYLES['border-color']),
	'border-left-style':   single_value.bind(null, 'border-left-style',   STYLES['border-style']),
	'border-left-width':   single_value.bind(null, 'border-left-width',   STYLES['border-width']),

	'margin-top':          single_value.bind(null, 'margin-top',          STYLES['margin']),
	'margin-right':        single_value.bind(null, 'margin-right',        STYLES['margin']),
	'margin-bottom':       single_value.bind(null, 'margin-bottom',       STYLES['margin']),
	'margin-left':         single_value.bind(null, 'margin-left',         STYLES['margin']),

	'outline-color':       single_value.bind(null, 'outline-color',       STYLES['outline-color']),
	'outline-style':       single_value.bind(null, 'outline-style',       STYLES['outline-style']),
	'outline-width':       single_value.bind(null, 'outline-width',       STYLES['outline-width']),

	'overflow-x':          single_value.bind(null, 'overflow-x',          STYLES['overflow']),
	'overflow-y':          single_value.bind(null, 'overflow-y',          STYLES['overflow']),

	'padding-top':         single_value.bind(null, 'padding-top',         STYLES['padding']),
	'padding-right':       single_value.bind(null, 'padding-right',       STYLES['padding']),
	'padding-bottom':      single_value.bind(null, 'padding-bottom',      STYLES['padding']),
	'padding-left':        single_value.bind(null, 'padding-left',        STYLES['padding']),

};



export default NORMAL;

