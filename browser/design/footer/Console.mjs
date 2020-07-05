
import { Element } from '../../design/index.mjs';



const Console = function(/* browser, widgets */) {

	this.button  = Element.from('button');
	this.element = Element.from('browser-console');
	this.console = null;

	let console = window.document.querySelector('base-console');
	if (console !== null) {
		this.console = Element.from(console);
	}


	this.button.on('click', () => {

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

	this.button.render(this.element);

};


Console.prototype = {

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};

export { Console };

