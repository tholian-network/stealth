
import { clone, has, match, parse_value, shift, split } from '../CSS.mjs';
import { NORMAL                                       } from './NORMAL.mjs';
import { STYLES                                       } from './STYLES.mjs';



const parse_single_animation = function(values) {

	let animation = {
		'animation-duration':        parse_value('0s'),
		'animation-timing-function': parse_value('ease'),
		'animation-delay':           parse_value('0s'),
		'animation-iteration-count': parse_value('1'),
		'animation-direction':       parse_value('normal'),
		'animation-fill-mode':       parse_value('none'),
		'animation-play-state':      parse_value('running'),
		'animation-name':            parse_value('none')
	};

	if (values.length > 0) {

		let check = values[0];
		if (check.val !== 'none') {

			// XXX: Two <time> values may appear first, or split, or suffixed
			let duration = shift.call(values, STYLES['animation-duration'], { min: 1, max: 2 });
			if (duration.length === 2) {
				animation['animation-duration'] = duration[0];
				animation['animation-delay']    = duration[1];
			} else if (duration.length === 1) {
				animation['animation-duration'] = duration[0];
			}

			let timing = shift.call(values, STYLES['animation-timing-function']);
			if (timing.length > 0) {
				animation['animation-timing-function'] = timing[0];
			}

			// XXX: Two <time> values may appear first, or split, or suffixed
			let delay = shift.call(values, STYLES['animation-delay'], { min: 1, max: 2 });
			if (delay.length === 2) {
				animation['animation-duration'] = delay[0];
				animation['animation-delay']    = delay[1];
			} else if (delay.length === 1) {
				animation['animation-delay'] = delay[0];
			}

			let iteration = shift.call(values, STYLES['animation-iteration-count']);
			if (iteration.length > 0) {
				animation['animation-iteration-count'] = iteration[0];
			}

			let direction = shift.call(values, STYLES['animation-direction']);
			if (direction.length > 0) {
				animation['animation-direction'] = direction[0];
			}

			let fillmode = shift.call(values, STYLES['animation-fill-mode']);
			if (fillmode.length > 0) {
				animation['animation-fill-mode'] = fillmode[0];
			}

			let playstate = shift.call(values, STYLES['animation-play-state']);
			if (playstate.length > 0) {
				animation['animation-play-state'] = playstate[0];
			}

			let name = shift.call(values, STYLES['animation-name']);
			if (name.length > 0) {
				animation['animation-name'] = name[0];
			}

		}

	}


	return animation;

};

const parse_single_transition = function(values) {

	let transition = {
		'transition-property':        parse_value('all'),
		'transition-duration':        parse_value('0s'),
		'transition-timing-function': parse_value('ease'),
		'transition-delay':           parse_value('0s')
	};

	if (values.length > 0) {

		let check = values[0];
		if (check.val !== 'none') {

			let property = shift.call(values, STYLES['transition-property']);
			if (property.length > 0) {
				transition['transition-property'] = property[0];
			}

			// XXX: Two <time> values may appear first, or split, or suffixed
			let duration = shift.call(values, STYLES['transition-duration'], { min: 1, max: 2 });
			if (duration.length === 2) {
				transition['transition-duration'] = duration[0];
				transition['transition-delay']    = duration[1];
			} else if (duration.length === 1) {
				transition['transition-duration'] = duration[0];
			}

			let timing = shift.call(values, STYLES['transition-timing-function']);
			if (timing.length > 0) {
				transition['transition-timing-function'] = timing[0];
			}

			// XXX: Two <time> values may appear first, or split, or suffixed
			let delay = shift.call(values, STYLES['transition-delay'], { min: 1, max: 2 });
			if (delay.length === 2) {
				transition['transition-duration'] = delay[0];
				transition['transition-delay']    = delay[1];
			} else if (delay.length === 1) {
				transition['transition-delay']    = delay[0];
			}

		}

	}


	return transition;

};



export const SHORTHAND = {

	/*
	 * UNSUPPORTED
	 */

	'border-block':  () => {},
	'border-image':  () => {},
	'border-inline': () => {},
	'grid':          () => {},
	'grid-area':     () => {},
	'grid-column':   () => {},
	'grid-row':      () => {},
	'grid-template': () => {},
	'offset':        () => {},



	/*
	 * SUPPORTED
	 */

	'animation': (values, result) => {

		let animations = split.call(values, {
			'val': [ ',' ]
		});

		if (animations.length > 0) {

			result['animation-duration']        = [];
			result['animation-timing-function'] = [];
			result['animation-delay']           = [];
			result['animation-iteration-count'] = [];
			result['animation-direction']       = [];
			result['animation-fill-mode']       = [];
			result['animation-play-state']      = [];
			result['animation-name']            = [];

			animations.forEach((values) => {

				let animation = parse_single_animation(values);
				if (animation !== null) {

					Object.keys(animation).forEach((key) => {
						result[key].push(animation[key]);
					});

				}

			});

		}

	},

	'background': (values, result) => {

		let color = shift.call(values, STYLES['background-color']);
		if (color.length > 0) {
			NORMAL['background-color'](color, result);
		}

		let image = shift.call(values, STYLES['background-image']);
		if (image.length > 0) {
			NORMAL['background-image'](image, result);
		}

		let position = shift.call(values, STYLES['background-position'], { min: 1, max: 2 });
		if (position.length > 0) {
			NORMAL['background-position'](position, result);
		}

		let repeat = shift.call(values, STYLES['background-repeat'], { min: 1, max: 2 });
		if (repeat.length > 0) {
			NORMAL['background-repeat'](repeat, result);
		}

		let attachment = shift.call(values, STYLES['background-attachment']);
		if (attachment.length > 0) {
			NORMAL['background-attachment'](attachment, result);
		}


		// XXX: background-clip has same values as background-origin
		let boxes = shift.call(values, STYLES['background-clip'], { min: 1, max: 2 });
		if (boxes.length === 2) {
			NORMAL['background-origin']([ boxes[0] ], result);
			NORMAL['background-clip']([ boxes[1] ], result);
		} else if (boxes.length === 1) {
			NORMAL['background-origin']([ boxes[0] ], result);
			NORMAL['background-clip']([ boxes[0] ], result);
		}


		// XXX: Technically a spec violation, but most people are idiots.
		let color_bg = shift.call(values, STYLES['background-color']);
		if (color_bg.length > 0) {
			NORMAL['background-color'](color_bg, result);
		}

	},

	'border': (values, result) => {

		let width = shift.call(values, STYLES['border-width']);
		if (width.length > 0) {
			SHORTHAND['border-width']([ width[0] ], result);
		}

		let style = shift.call(values, STYLES['border-style']);
		if (style.length > 0) {
			SHORTHAND['border-style']([ style[0] ], result);
		}

		let color = shift.call(values, STYLES['border-color']);
		if (color.length > 0) {
			SHORTHAND['border-color']([ color[0] ], result);
		}

	},

	'border-bottom': (values, result) => {

		let width = shift.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['border-bottom-width']([ width[0] ], result);
		}

		let style = shift.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['border-bottom-style']([ style[0] ], result);
		}

		let color = shift.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['border-bottom-color']([ color[0] ], result);
		}

	},

	'border-color': (values, result) => {

		let color = shift.call(values, STYLES['border-color'], { min: 1, max: 4 });
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

		let width = shift.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['border-left-width']([ width[0] ], result);
		}

		let style = shift.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['border-left-style']([ style[0] ], result);
		}

		let color = shift.call(values, STYLES['border-color']);
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

			let before = shift.call(values, {
				'typ': [ 'length', 'percentage' ]
			}, { min: 1, max: 4 });

			// strip out the slash
			shift.call(values, {
				'val': [ '/' ]
			}, { min: 1, max: 1 });

			let after = shift.call(values, {
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

			let radius = shift.call(values, {
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

		let width = shift.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['border-right-width']([ width[0] ], result);
		}

		let style = shift.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['border-right-style']([ style[0] ], result);
		}

		let color = shift.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['border-right-color']([ color[0] ], result);
		}

	},

	'border-style': (values, result) => {

		let style = shift.call(values, STYLES['border-style'], { min: 1, max: 4 });
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

		let width = shift.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['border-top-width']([ width[0] ], result);
		}

		let style = shift.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['border-top-style']([ style[0] ], result);
		}

		let color = shift.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['border-top-color']([ color[0] ], result);
		}

	},

	'border-width': (values, result) => {

		let width = shift.call(values, STYLES['border-width'], { min: 1, max: 4 });
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

		let width = shift.call(values, STYLES['border-width']);
		if (width.length > 0) {
			NORMAL['column-rule-width']([ width[0] ], result);
		}

		let style = shift.call(values, STYLES['border-style']);
		if (style.length > 0) {
			NORMAL['column-rule-style']([ style[0] ], result);
		}

		let color = shift.call(values, STYLES['border-color']);
		if (color.length > 0) {
			NORMAL['column-rule-color']([ color[0] ], result);
		}

	},

	'columns': (values, result) => {

		let width = shift.call(values, STYLES['column-width']);
		if (width.length > 0) {
			NORMAL['column-width']([ width[0] ], result);
		}

		let count = shift.call(values, STYLES['column-count']);
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


		let grow = shift.call(values, STYLES['flex-grow']);
		if (grow.length > 0) {
			NORMAL['flex-grow']([ grow[0] ], result);
		}

		let shrink = shift.call(values, STYLES['flex-shrink']);
		if (shrink.length > 0) {
			NORMAL['flex-shrink']([ shrink[0] ], result);
		}

		let basis = shift.call(values, STYLES['flex-basis']);
		if (basis.length > 0) {
			NORMAL['flex-basis']([ basis[0] ], result);
		}

	},

	'flex-flow': (values, result) => {

		let direction = shift.call(values, STYLES['flex-direction']);
		if (direction.length > 0) {
			NORMAL['flex-direction']([ direction[0] ], result);
		}

		let wrap = shift.call(values, STYLES['flex-wrap']);
		if (wrap.length > 0) {
			NORMAL['flex-wrap']([ wrap[0] ], result);
		}

	},

	'font': (values, result) => {

		let style = shift.call(values, STYLES['font-style']);
		if (style.length > 0) {
			NORMAL['font-style']([ style[0] ], result);
		}

		let check = values[0];
		if (
			match.call(check, STYLES['font-weight']) === false
			&& match.call(check, STYLES['font-stretch']) === false
			&& match.call(check, STYLES['font-size']) === false
		) {
			values.splice(0, 1);
		}

		let weight = shift.call(values, STYLES['font-weight']);
		if (weight.length > 0) {
			NORMAL['font-weight']([ weight[0] ], result);
		}

		let stretch = shift.call(values, STYLES['font-stretch']);
		if (stretch.length > 0) {
			NORMAL['font-stretch']([ stretch[0] ], result);
		}


		let has_slash = has.call(values, {
			'val': [ '/' ]
		}, { min: 1, max: 1 });
		if (has_slash === true) {

			let before = shift.call(values, STYLES['font-size']);

			// strip out the slash
			shift.call(values, {
				'val': [ '/' ]
			}, { min: 1, max: 1 });

			let after = shift.call(values, STYLES['line-height']);

			if (before.length === 1 && after.length === 1) {

				NORMAL['font-size']([ before[0] ], result);
				NORMAL['line-height']([ after[0] ], result);

			}

		} else {

			let size = shift.call(values, STYLES['font-size']);
			if (size.length > 0) {
				NORMAL['font-size']([ size[0] ], result);
			}

		}


		if (values.length > 0) {
			NORMAL['font-family'](values, result);
		}

	},

	'inset': (values, result) => {

		let inset = shift.call(values, STYLES['inset'], { min: 1, max: 4 });
		if (inset.length === 4) {
			NORMAL['top']([ inset[0] ], result);
			NORMAL['right']([ inset[1] ], result);
			NORMAL['bottom']([ inset[2] ], result);
			NORMAL['left']([ inset[3] ], result);
		} else if (inset.length === 3) {
			NORMAL['top']([ inset[0] ], result);
			NORMAL['right']([ inset[1] ], result);
			NORMAL['bottom']([ inset[2] ], result);
			NORMAL['left']([ inset[1] ], result);
		} else if (inset.length === 2) {
			NORMAL['top']([ inset[0] ], result);
			NORMAL['right']([ inset[1] ], result);
			NORMAL['bottom']([ inset[0] ], result);
			NORMAL['left']([ inset[1] ], result);
		} else if (inset.length === 1) {
			NORMAL['top']([ inset[0] ], result);
			NORMAL['right']([ inset[0] ], result);
			NORMAL['bottom']([ inset[0] ], result);
			NORMAL['left']([ inset[0] ], result);
		}

	},

	'list-style': (values, result) => {

		let type = shift.call(values, STYLES['list-style-type']);
		if (type.length === 1) {
			NORMAL['list-style-type']([ type[0] ], result);
		}

		let image = shift.call(values, STYLES['list-style-image']);
		if (image.length > 0) {
			NORMAL['list-style-image'](image, result);
		}

		let position = shift.call(values, STYLES['list-style-position']);
		if (position.length > 0) {
			NORMAL['list-style-position']([ position[0] ], result);
		}

	},

	'margin': (values, result) => {

		let margin = shift.call(values, STYLES['margin'], { min: 1, max: 4 });
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

		let color = shift.call(values, STYLES['outline-color']);
		if (color.length > 0) {
			NORMAL['outline-color']([ color[0] ], result);
		}

		let style = shift.call(values, STYLES['outline-style']);
		if (style.length > 0) {
			NORMAL['outline-style']([ style[0] ], result);
		}

		let width = shift.call(values, STYLES['outline-width']);
		if (width.length > 0) {
			NORMAL['outline-width']([ width[0] ], result);
		}

	},

	'overflow': (values, result) => {

		let overflow = shift.call(values, STYLES['overflow'], { min: 1, max: 2 });
		if (overflow.length === 2) {
			NORMAL['overflow-x']([ overflow[0] ], result);
			NORMAL['overflow-y']([ overflow[1] ], result);
		} else if (overflow.length === 1) {
			NORMAL['overflow-x']([ overflow[0] ], result);
			NORMAL['overflow-y']([ overflow[0] ], result);
		}

	},

	'padding': (values, result) => {

		let padding = shift.call(values, STYLES['padding'], { min: 1, max: 4 });
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

	'place-content': (values, result) => {

		if (values.length === 2) {

			NORMAL['align-content']([ values[0] ], result);
			NORMAL['justify-content']([ values[1] ], result);

		} else if (values.length === 1) {

			let check = values[0];
			if (
				match.call(check, STYLES['align-content']) === true
				&& match.call(check, STYLES['justify-content']) === true
			) {
				NORMAL['align-content']([ values[0] ], result);
				NORMAL['justify-content']([ values[0] ], result);
			}

		}

	},

	'place-items': (values, result) => {

		if (values.length === 2) {

			NORMAL['align-items']([ values[0] ], result);
			NORMAL['justify-items']([ values[1] ], result);

		} else if (values.length === 1) {

			let check = values[0];
			if (
				match.call(check, STYLES['align-items']) === true
				&& match.call(check, STYLES['justify-items']) === true
			) {
				NORMAL['align-items']([ values[0] ], result);
				NORMAL['justify-items']([ values[0] ], result);
			}

		}

	},

	'place-self': (values, result) => {

		if (values.length === 2) {

			NORMAL['align-self']([ values[0] ], result);
			NORMAL['justify-self']([ values[1] ], result);

		} else if (values.length === 1) {

			let check = values[0];
			if (
				match.call(check, STYLES['align-self']) === true
				&& match.call(check, STYLES['justify-self']) === true
			) {
				NORMAL['align-self']([ values[0] ], result);
				NORMAL['justify-self']([ values[0] ], result);
			}

		}

	},

	'scroll-margin': (values, result) => {

		let margin = shift.call(values, STYLES['scroll-margin'], { min: 1, max: 4 });
		if (margin.length === 4) {
			NORMAL['scroll-margin-top']([ margin[0] ], result);
			NORMAL['scroll-margin-right']([ margin[1] ], result);
			NORMAL['scroll-margin-bottom']([ margin[2] ], result);
			NORMAL['scroll-margin-left']([ margin[3] ], result);
		} else if (margin.length === 3) {
			NORMAL['scroll-margin-top']([ margin[0] ], result);
			NORMAL['scroll-margin-right']([ margin[1] ], result);
			NORMAL['scroll-margin-bottom']([ margin[2] ], result);
			NORMAL['scroll-margin-left']([ margin[1] ], result);
		} else if (margin.length === 2) {
			NORMAL['scroll-margin-top']([ margin[0] ], result);
			NORMAL['scroll-margin-right']([ margin[1] ], result);
			NORMAL['scroll-margin-bottom']([ margin[0] ], result);
			NORMAL['scroll-margin-left']([ margin[1] ], result);
		} else if (margin.length === 1) {
			NORMAL['scroll-margin-top']([ margin[0] ], result);
			NORMAL['scroll-margin-right']([ margin[0] ], result);
			NORMAL['scroll-margin-bottom']([ margin[0] ], result);
			NORMAL['scroll-margin-left']([ margin[0] ], result);
		}

	},

	'scroll-padding': (values, result) => {

		let padding = shift.call(values, STYLES['scroll-padding'], { min: 1, max: 4 });
		if (padding.length === 4) {
			NORMAL['scroll-padding-top']([ padding[0] ], result);
			NORMAL['scroll-padding-right']([ padding[1] ], result);
			NORMAL['scroll-padding-bottom']([ padding[2] ], result);
			NORMAL['scroll-padding-left']([ padding[3] ], result);
		} else if (padding.length === 3) {
			NORMAL['scroll-padding-top']([ padding[0] ], result);
			NORMAL['scroll-padding-right']([ padding[1] ], result);
			NORMAL['scroll-padding-bottom']([ padding[2] ], result);
			NORMAL['scroll-padding-left']([ padding[1] ], result);
		} else if (padding.length === 2) {
			NORMAL['scroll-padding-top']([ padding[0] ], result);
			NORMAL['scroll-padding-right']([ padding[1] ], result);
			NORMAL['scroll-padding-bottom']([ padding[0] ], result);
			NORMAL['scroll-padding-left']([ padding[1] ], result);
		} else if (padding.length === 1) {
			NORMAL['scroll-padding-top']([ padding[0] ], result);
			NORMAL['scroll-padding-right']([ padding[0] ], result);
			NORMAL['scroll-padding-bottom']([ padding[0] ], result);
			NORMAL['scroll-padding-left']([ padding[0] ], result);
		}

	},

	'text-decoration': (values, result) => {

		let line = shift.call(values, STYLES['text-decoration-line']);
		if (line.length > 0) {
			NORMAL['text-decoration-line']([ line[0] ], result);
		}

		let style = shift.call(values, STYLES['text-decoration-style']);
		if (style.length > 0) {
			NORMAL['text-decoration-style']([ style[0] ], result);
		}

		let color = shift.call(values, STYLES['text-decoration-color']);
		if (color.length > 0) {
			NORMAL['text-decoration-color']([ color[0] ], result);
		}

		let thickness = shift.call(values, STYLES['text-decoration-thickness']);
		if (thickness.length > 0) {
			NORMAL['text-decoration-thickness']([ thickness[0] ], result);
		}

	},

	'text-emphasis': (values, result) => {

		let style = shift.call(values, STYLES['text-emphasis-style']);
		if (style.length > 0) {
			NORMAL['text-emphasis-style']([ style[0] ], result);
		}

		let color = shift.call(values, STYLES['text-emphasis-color']);
		if (color.length > 0) {
			NORMAL['text-emphasis-color']([ color[0] ], result);
		}

	},

	'transition': (values, result) => {

		let transitions = split.call(values, {
			'val': [ ',' ]
		});

		if (transitions.length > 0) {

			result['transition-property']        = [];
			result['transition-duration']        = [];
			result['transition-timing-function'] = [];
			result['transition-delay']           = [];

			transitions.forEach((values) => {

				let transition = parse_single_transition(values);
				if (transition !== null) {

					Object.keys(transition).forEach((key) => {
						result[key].push(transition[key]);
					});

				}

			});

		}

	}

};


export default { SHORTHAND };

