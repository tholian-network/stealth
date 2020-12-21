
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';



const Blocker = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [];
	this.element = new Element('browser-card-blocker', [
		'<h3><input title="Domain" type="text" data-key="domain" disabled/></h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-blocker-article>',
		'</browser-card-blocker-article>',
		'<browser-card-blocker-footer>',
		'</browser-card-blocker-footer>'
	]);

	this.buttons = {
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		domain:  this.element.query('[data-key="domain"]')
	};

	Widget.call(this);


	this.element.on('show', () => {

		this.element.state('active');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('active');
		}

	});

	this.element.on('hide', () => {

		this.element.state('');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('');
		}

	});

	this.element.on('update', () => {
		// Ignore
	});


	if (this.buttons.toggle !== null) {

		this.buttons.toggle.on('click', () => {

			if (this.element.state() === 'active') {
				this.element.emit('hide');
			} else {
				this.element.emit('show');
			}

		});

	}

	this.element.emit('update');

};


Blocker.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Blocker(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Blocker.prototype = Object.assign({}, Widget.prototype);


export { Blocker };

