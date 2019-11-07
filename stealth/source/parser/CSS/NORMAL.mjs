
import { console } from '../../console.mjs';

import { find, parse_value } from '../CSS.mjs';



const NORMAL = {

	'background-attachment': (values, result) => {

		let attachment = find.call(values, {
			'val': [ 'scroll', 'fixed', 'local' ]
		});
		if (attachment.length > 0) {
			result['background-attachment'] = attachment.pop();
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
				result['background-position-x'] = parse_value('50%');
				result['background-position-y'] = parse_value('top');
			} else if (val === 'right') {
				result['background-position-x'] = parse_value('right');
				result['background-position-y'] = parse_value('50%');
			} else if (val === 'bottom') {
				result['background-position-x'] = parse_value('50%');
				result['background-position-y'] = parse_value('bottom');
			} else if (val === 'left') {
				result['background-position-x'] = parse_value('left');
				result['background-position-y'] = parse_value('50%');
			} else if (typ === 'length' || typ === 'percentage') {
				result['background-position-x'] = position[0];
				result['background-position-y'] = parse_value('50%');
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
					result['background-repeat-x'] = parse_value('repeat');
					result['background-repeat-y'] = parse_value('no-repeat');
				} else if (val === 'repeat-y') {
					result['background-repeat-x'] = parse_value('no-repeat');
					result['background-repeat-y'] = parse_value('repeat');
				} else if (val === 'repeat') {
					result['background-repeat-x'] = parse_value('repeat');
					result['background-repeat-y'] = parse_value('repeat');
				} else if (val === 'space') {
					result['background-repeat-x'] = parse_value('space');
					result['background-repeat-y'] = parse_value('space');
				} else if (val === 'round') {
					result['background-repeat-x'] = parse_value('round');
					result['background-repeat-y'] = parse_value('round');
				} else if (val === 'no-repeat') {
					result['background-repeat-x'] = parse_value('no-repeat');
					result['background-repeat-y'] = parse_value('no-repeat');
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
					result['background-size-x'] = parse_value('contain');
					result['background-size-y'] = parse_value('contain');
				} else if (val === 'cover') {
					result['background-size-x'] = parse_value('cover');
					result['background-size-y'] = parse_value('cover');
				} else if (val === 'auto') {
					result['background-size-x'] = parse_value('auto');
					result['background-size-y'] = parse_value('auto');
				} else if (typ === 'length' || typ === 'percentage') {
					result['background-size-x'] = size[0];
					result['background-size-y'] = parse_value('auto');
				}

			}

		}

	},

	'font-weight': () => {},

};



export default NORMAL;

