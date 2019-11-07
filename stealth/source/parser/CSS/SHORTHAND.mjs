
import { console } from '../../console.mjs';

import { find  } from '../CSS.mjs';

import NORMAL from './NORMAL.mjs';



const SHORTHAND = {

	'animation': () => {
		// TODO: animation
	},

	'background': (values, result) => {

		let color = find.call(values, {
			'typ': [ 'color' ]
		});
		if (color.length > 0) {
			NORMAL['background-color'](color, result);
		}

		let image = find.call(values, {
			'typ': [ 'url', 'gradient' ]
		});
		if (image.length > 0) {
			NORMAL['background-image'](image, result);
		}

		let position = find.call(values, {
			'val': [ 'top', 'right', 'bottom', 'left', 'center' ],
			'typ': [ 'length', 'percentage' ]
		}, { min: 1, max: 2 });
		if (position.length > 0) {
			NORMAL['background-position'](position, result);
		}

		let repeat = find.call(values, {
			'val': [ 'repeat-x', 'repeat-y', 'repeat', 'space', 'round', 'no-repeat' ]
		}, { min: 1, max: 2 });
		if (repeat.length > 0) {
			NORMAL['background-repeat'](repeat, result);
		}

		let attachment = find.call(values, {
			'val': [ 'scroll', 'fixed', 'local' ]
		});
		if (attachment.length > 0) {
			NORMAL['background-attachment'](attachment, result);
		}

		let boxes = find.call(values, {
			'val': [ 'border-box', 'padding-box', 'content-box' ]
		}, { min: 1, max: 2 });
		if (boxes.length === 2) {
			NORMAL['background-origin'](boxes.slice(0, 1), result);
			NORMAL['background-clip'](boxes.slice(1, 1), result);
		} else if (boxes.length === 1) {
			NORMAL['background-origin']([ boxes[0] ], result);
			NORMAL['background-clip']([ boxes[0] ], result);
		}


		// XXX: Technically a spec violation, but most people are idiots.
		let color_bg = find.call(values, {
			'typ': [ 'color' ]
		});
		if (color_bg.length > 0) {
			NORMAL['background-color'](color_bg, result);
		}

		console.warn(result);

	},

	'border': (values, result) => {

		let width = find.call(values, {
			'val': [ 'thin', 'medium', 'thick' ],
			'typ': [ 'length' ]
		});
		if (width.length > 0) {
			SHORTHAND['border-width']([ width[0] ], result);
		}

		let style = find.call(values, {
			'val': [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
		});
		if (style.length > 0) {
			SHORTHAND['border-style']([ style[0] ], result);
		}

		let color = find.call(values, {
			'typ': [ 'color' ]
		});
		if (color.length > 0) {
			SHORTHAND['border-color']([ color[0] ], result);
		}

	},

	'border-bottom': (values, result) => {

		let width = find.call(values, {
			'val': [ 'thin', 'medium', 'thick' ],
			'typ': [ 'length' ]
		});
		if (width.length > 0) {
			NORMAL['border-bottom-width']([ width[0] ], result);
		}

		let style = find.call(values, {
			'val': [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
		});
		if (style.length > 0) {
			NORMAL['border-bottom-style']([ style[0] ], result);
		}

		let color = find.call(values, {
			'typ': [ 'color' ]
		});
		if (color.length > 0) {
			NORMAL['border-bottom-color']([ color[0] ], result);
		}

	},

	'border-color': (values, result) => {

		let color = find.call(values, {
			'typ': [ 'color' ]
		});
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

		let width = find.call(values, {
			'val': [ 'thin', 'medium', 'thick' ],
			'typ': [ 'length' ]
		});
		if (width.length > 0) {
			NORMAL['border-left-width']([ width[0] ], result);
		}

		let style = find.call(values, {
			'val': [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
		});
		if (style.length > 0) {
			NORMAL['border-left-style']([ style[0] ], result);
		}

		let color = find.call(values, {
			'typ': [ 'color' ]
		});
		if (color.length > 0) {
			NORMAL['border-left-color']([ color[0] ], result);
		}

	},

	'border-radius': () => {},

	'border-right': (values, result) => {

		let width = find.call(values, {
			'val': [ 'thin', 'medium', 'thick' ],
			'typ': [ 'length' ]
		});
		if (width.length > 0) {
			NORMAL['border-right-width']([ width[0] ], result);
		}

		let style = find.call(values, {
			'val': [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
		});
		if (style.length > 0) {
			NORMAL['border-right-style']([ style[0] ], result);
		}

		let color = find.call(values, {
			'typ': [ 'color' ]
		});
		if (color.length > 0) {
			NORMAL['border-right-color']([ color[0] ], result);
		}

	},

	'border-style': (values, result) => {

		let style = find.call(values, {
			'val': [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
		});

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

		let width = find.call(values, {
			'val': [ 'thin', 'medium', 'thick' ],
			'typ': [ 'length' ]
		});
		if (width.length > 0) {
			NORMAL['border-top-width']([ width[0] ], result);
		}

		let style = find.call(values, {
			'val': [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
		});
		if (style.length > 0) {
			NORMAL['border-top-style']([ style[0] ], result);
		}

		let color = find.call(values, {
			'typ': [ 'color' ]
		});
		if (color.length > 0) {
			NORMAL['border-top-color']([ color[0] ], result);
		}

	},

	'border-width': (values, result) => {

		let width = find.call(values, {
			'val': [ 'thin', 'medium', 'thick' ],
			'typ': [ 'length' ]
		});

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

	'column-rule':     () => {},
	'columns':         () => {},
	'flex':            () => {},
	'flex-flow':       () => {},
	'font':            () => {},
	'grid':            () => {},
	'grid-area':       () => {},
	'grid-column':     () => {},
	'grid-row':        () => {},
	'grid-template':   () => {},
	'list-style':      () => {},
	'margin':          () => {},
	'offset':          () => {},
	'outline':         () => {},
	'overflow':        () => {},
	'padding':         () => {},
	'place-content':   () => {},
	'place-items':     () => {},
	'place-self':      () => {},
	'text-decoration': () => {},
	'transition':      () => {}

};



export default SHORTHAND;

