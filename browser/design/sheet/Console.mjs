
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';



const Console = function(/* browser */) {

	this.button  = new Element('button');
	this.console = Element.query('base-console');
	this.element = new Element('browser-sheet-console', [
		this.button
	]);

	this.button.attr('title', 'Toggle visibility of Developer Console');

	this.button.on('click', () => {

		if (this.console === null) {
			this.console = Element.query('base-console');
		}

		if (this.console !== null) {

			if (this.console.state() === 'active') {

				this.console.state('');
				this.button.state('');

			} else {

				this.console.state('active');
				this.button.state('active');

			}

		}

	});


	Widget.call(this);

};


Console.prototype = Object.assign({}, Widget.prototype);


export { Console };

