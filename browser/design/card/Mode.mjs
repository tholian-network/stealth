
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';
import { isArray } from '../../extern/base.mjs';



const remove = (browser, mode) => {

	let other = browser.settings.modes.find((m) => m.domain === mode.domain) || null;
	if (other !== null) {
		browser.settings.modes.remove(other);
	}

};

const update = (browser, mode) => {

	let other = browser.settings.modes.find((m) => m.domain === mode.domain) || null;
	if (other !== null) {

		Object.keys(mode).filter((key) => {
			return key !== 'domain';
		}).forEach((key) => {
			other[key] = mode[key];
		});

	} else {

		browser.settings.modes.push(mode);

	}

};



const Mode = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-mode', [
		'<h3 title="Domain" data-key="domain">example.com</h3>',
		'<button title="Toggle visibility of this card" data-action="toggle"></button>',
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


		let footer = this.element.query('browser-card-mode-footer');
		let h3     = this.element.query('h3');

		if (this.actions.includes('create')) {

			if (this.model.domain.type === 'h3') {

				let input = new Element('input');

				input.attr('type',     'text');
				input.attr('data-key', 'domain');
				h3.attr('data-key',    '');

				input.value(h3.value());
				h3.value('');

				input.render(h3);

				this.model.domain = input;

			}

		} else {

			if (this.model.domain.type === 'input') {

				let input = this.model.domain;

				h3.attr('data-key', 'domain');
				h3.value(input.value());

				input.erase();

				this.model.domain = h3;

			}

		}

		if (this.actions.includes('create') || this.actions.includes('save')) {

			Object.values(this.model.mode).forEach((button) => {
				button.state('enabled');
			});

		} else {

			Object.values(this.model.mode).forEach((button) => {
				button.state('disabled');
			});

		}


		if (this.actions.includes('create')) {

			this.buttons.create.render(footer);

		} else if (this.actions.includes('save')) {

			if (this.actions.includes('remove')) {
				this.buttons.remove.render(footer);
			}

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

			browser.client.services['mode'].save(this.value(), (result) => {

				if (result === true) {
					update(browser, this.value());
				}

			});

			this.actions = [ 'remove', 'save' ];
			this.element.emit('update');

		});

	}

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			browser.client.services['mode'].remove(this.value(), (result) => {

				if (result === true) {
					remove(browser, this.value());
					this.element.erase();
				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			browser.client.services['mode'].save(this.value(), (result) => {

				if (result === true) {
					update(browser, this.value());
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


Mode.prototype = Object.assign({}, Widget.prototype);


export { Mode };

