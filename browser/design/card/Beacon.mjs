
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';
import { isArray } from '../../extern/base.mjs';



const Beacon = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-beacon', [
		'<h3>',
		'<span data-key="domain">example.com</span>',
		'<span data-key="path">/</span>',
		'</h3>',
		'<button data-action="toggle"></button>',
		'<browser-card-beacon-article>',
		// TODO: List of beacons[] with label, select input and mode {}
		'</browser-card-beacon-article>',
		'<browser-card-beacon-footer>',
		'<button data-action="create" title="create"></button>',
		'<button data-action="remove" title="remove"></button>',
		'<button data-action="save" title="save"></button>',
		'</browser-card-beacon-footer>'
	]);

	this.buttons = {
		create: this.element.query('button[data-action="create"]'),
		remove: this.element.query('button[data-action="remove"]'),
		save:   this.element.query('button[data-action="save"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		domain: this.element.query('[data-key="domain"]'),
		path:   this.element.query('[data-key="path"]'),
		beacons: []
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


	if (this.buttons.toggle !== null) {

		this.buttons.toggle.on('click', () => {

			if (this.element.state() === 'active') {
				this.element.emit('hide');
			} else {
				this.element.emit('show');
			}

		});

	}

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			browser.client.services['beacon'].remove(this.value(), (result) => {

				if (result === true) {
					// remove(browser, this.value());
					this.element.erase();
				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			browser.client.services['beacon'].save(this.value(), (result) => {

				if (result === true) {
					// update(browser, this.value());
				}

			});

		});

	}


};


Beacon.prototype = Object.assign({}, Widget.prototype);


export { Beacon };

