
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

		if (this.element.state() === 'active') {
			this.element.emit('hide');
		} else {
			this.element.emit('show');
		}

	});

	this.element.on('show', () => {

		if (this.console === null) {
			this.console = Element.query('base-console');
		}

		if (this.console !== null) {
			this.console.state('active');
		}

		this.element.state('active');
		this.button.state('active');

	});

	this.element.on('hide', () => {

		if (this.console === null) {
			this.console = Element.query('base-console');
		}

		if (this.console !== null) {
			this.console.state('');
		}

		this.element.state('');
		this.button.state('');

	});


	Widget.call(this);

};


Console.prototype = Object.assign({}, Widget.prototype);


export { Console };

