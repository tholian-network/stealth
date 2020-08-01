
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';



const Interface = function(browser, actions) {

	let id1 = Date.now() + '-1';
	let id2 = Date.now() + '-2';


	this.actions = isArray(actions) ? actions : [ 'save' ];
	this.element = new Element('browser-card-interface', [
		'<h3>Interface</h3>',
		'<button title="Toggle visibility of this card" data-action="toggle"></button>',
		'<browser-card-interface-article>',
		'<ul>',
		'<li>',
		'<input id="browser-card-interface-theme-' + id1 + '" name="theme" type="radio" value="dark">',
		'<label for="browser-card-interface-theme-' + id1 + '">Use dark theme.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-theme-' + id2 + '" name="theme" type="radio" value="light">',
		'<label for="browser-card-interface-theme-' + id2 + '">Use light theme.</label>',
		'</li>',
		'</ul>',
		'</browser-card-interface-article>',
		'<browser-card-interface-footer>',
		'<button title="Save" data-action="save"></button>',
		'</browser-card-interface-footer>'
	]);

	this.buttons = {
		save:   this.element.query('button[data-action="save"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		theme: this.element.query('input[name="theme"]'),
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

		this.buttons.save.erase();


		if (this.actions.includes('save')) {

			Object.values(this.model.theme).forEach((input) => {
				input.state('enabled');
			});

		} else {

			Object.values(this.model.theme).forEach((input) => {
				input.state('disabled');
			});

		}


		let footer = this.element.query('browser-card-interface-footer');

		if (this.actions.includes('save')) {
			this.buttons.save.render(footer);
		}

	});

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			let value = this.value();

			browser.client.services['settings'].save({
				'interface': value
			}, (result) => {

				if (result === true) {
					browser.settings['interface'] = value;
					browser.emit('theme', [ value['theme'] ]);
				}

			});

		});

	}

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


Interface.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Interface(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Interface.prototype = Object.assign({}, Widget.prototype);


export { Interface };

