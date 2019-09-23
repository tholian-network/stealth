
import { isArray, isNumber, isString } from '../../POLYFILLS.mjs';



const extract_multiple = function(prop, search) {

	prop   = isString(prop)  ? prop   : 'val';
	search = isArray(search) ? search : [];


	if (search.length > 0) {

		let filtered = [];
		let list     = Object(this);
		let length   = list.length >>> 0;

		for (let s = 0, sl = search.length; s < sl; s++) {

			let value = search[s];
			if (isNumber(value) || isString(value)) {

				for (let i = 0; i < length; i++) {

					let object  = this[i];
					if (object[prop] === value) {

						filtered.push(object);
						this.splice(i, 1);

						length--;
						i--;

					}

				}

			}

		}


		if (filtered.length > 0) {
			return filtered;
		}

	}

	return null;

};

const extract = function(prop, search) {

	let result = extract_multiple.call(this, prop, search);
	if (result !== null) {

		if (result.length > 0) {
			return result.pop();
		}

	}


	return null;

};



const SHORTHAND = {

	'animation':       () => {},
	'background':      (values) => {

		let result = {};

		let attachment = extract.call(values, 'val', [ 'scroll', 'fixed', 'local' ]);
		if (attachment !== null) {
			result['background-attachment'] = attachment;
		}

		let image = extract.call(values, 'typ', [ 'url' ]);
		if (image !== null) {
			result['background-image'] = image;
		}

		// attachment = scroll || fixed || local
		// bg-image
		// bg-position
		// bg-size
		// bg-repeat

		let repeat = extract_multiple.call(values, 'val', [ 'repeat-x', 'repeat-y', 'repeat', 'space', 'round', 'no-repeat' ]);
		if (repeat !== null) {

			if (repeat.length === 2) {
				result['background-repeat-x'] = repeat[0];
				result['background-repeat-y'] = repeat[1];
			} else if (repeat.length === 1) {

				// TODO: Handle repeat-x and repeat-y correctly
				// TODO: Handle other cases

			}

		}

		console.log(values);

	},
	'border':          () => {},
	'border-bottom':   () => {},
	'border-color':    () => {},
	'border-left':     () => {},
	'border-radius':   () => {},
	'border-right':    () => {},
	'border-style':    () => {},
	'border-top':      () => {},
	'border-width':    () => {},
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

