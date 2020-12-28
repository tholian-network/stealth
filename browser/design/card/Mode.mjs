
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';



const Mode = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-mode', [
		'<h3><input title="Domain" type="text" data-key="domain" disabled="true"/></h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-mode-article>',
		'<button title="Allow/Disallow Text" data-key="mode.text" data-val="false" disabled></button>',
		'<button title="Allow/Disallow Image" data-key="mode.image" data-val="false" disabled></button>',
		'<button title="Allow/Disallow Audio" data-key="mode.audio" data-val="false" disabled></button>',
		'<button title="Allow/Disallow Video" data-key="mode.video" data-val="false" disabled></button>',
		'<button title="Allow/Disallow Other" data-key="mode.other" data-val="false" disabled></button>',
		'</browser-card-mode-article>',
		'<browser-card-mode-footer>',
		'<button title="Create Mode" data-action="create"></button>',
		'<button title="Remove Mode" data-action="remove"></button>',
		'<button title="Save Mode" data-action="save"></button>',
		'</browser-card-mode-footer>'
	]);

	this.buttons = {
		create: this.element.query('[data-action="create"]'),
		remove: this.element.query('[data-action="remove"]'),
		save:   this.element.query('[data-action="save"]'),
		toggle: this.element.query('[data-action="toggle"]')
	};

	this.model = {
		domain: this.element.query('[data-key="domain"]'),
		mode: {
			text:  this.element.query('[data-key="mode.text"]'),
			image: this.element.query('[data-key="mode.image"]'),
			audio: this.element.query('[data-key="mode.audio"]'),
			video: this.element.query('[data-key="mode.video"]'),
			other: this.element.query('[data-key="mode.other"]')
		}
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

		this.buttons.create.erase();
		this.buttons.remove.erase();
		this.buttons.save.erase();


		if (this.actions.includes('create') === true) {
			this.model.domain.state('enabled');
			Object.values(this.model.mode).forEach((button) => button.state('enabled'));
		} else if (this.actions.includes('save') === true) {
			this.model.domain.state('disabled');
			Object.values(this.model.mode).forEach((button) => button.state('enabled'));
		} else {
			this.model.domain.state('disabled');
			Object.values(this.model.mode).forEach((button) => button.state('disabled'));
		}


		let footer = this.element.query('browser-card-mode-footer');

		if (this.actions.includes('remove') === true) {
			this.buttons.remove.render(footer);
		}

		if (this.actions.includes('create') === true) {
			this.buttons.create.render(footer);
		} else if (this.actions.includes('save') === true) {
			this.buttons.save.render(footer);
		}

	});

	Object.values(this.model.mode).forEach((button) => {

		button.on('click', () => {

			if (button.value() === true) {
				button.value(false);
			} else {
				button.value(true);
			}

		});

	});


	if (this.buttons.create !== null) {

		this.buttons.create.on('click', () => {

			let value = this.value();

			browser.client.services['mode'].save(value, (result) => {

				if (result === true) {

					browser.settings['modes'].removeEvery((m) => m.domain === value.domain);
					browser.settings['modes'].push(value);

					if (this.actions.includes('create') === true) {
						this.actions.remove('create');
					}

					if (this.actions.includes('save') === false) {
						this.actions.push('save');
					}

					this.element.emit('update');

				}

			});

		});

	}

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			let value = this.value();

			browser.client.services['mode'].remove(value, (result) => {

				if (result === true) {

					browser.settings['modes'].removeEvery((m) => m.domain === value.domain);
					this.element.erase();

				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			let value = this.value();

			browser.client.services['mode'].save(value, (result) => {

				if (result === true) {

					browser.settings['modes'].removeEvery((m) => m.domain === value.domain);
					browser.settings['modes'].push(value);

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


Mode.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Mode(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Mode.prototype = Object.assign({}, Widget.prototype);


export { Mode };

