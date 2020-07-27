
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

	}

};



const Mode = function(browser, actions) {

	actions = isArray(actions) ? actions : [ 'remove', 'save' ];


	this.element = new Element('browser-card-mode', [
		'<h3 data-key="domain">Domain</h3>',
		'<button data-action="toggle"></button>',
		'<article>',
		actions.includes('save') ? ([
			'<button data-key="mode.text" data-val="false"></button>',
			'<button data-key="mode.image" data-val="false"></button>',
			'<button data-key="mode.audio" data-val="false"></button>',
			'<button data-key="mode.video" data-val="false"></button>',
			'<button data-key="mode.other" data-val="false"></button>'
		].join('')) : ([
			'<button data-key="mode.text" data-val="false" disabled></button>',
			'<button data-key="mode.image" data-val="false" disabled></button>',
			'<button data-key="mode.audio" data-val="false" disabled></button>',
			'<button data-key="mode.video" data-val="false" disabled></button>',
			'<button data-key="mode.other" data-val="false" disabled></button>'
		].join('')),
		'\t<div>',
		actions.includes('remove') ? '\t\t<button data-action="remove" title="remove"></button>' : '',
		actions.includes('save')   ? '\t\t<button data-action="save" title="save"></button>'     : '',
		'\t</div>',
		'</article>',
	]);

	this.buttons = {
		toggle: this.element.query('button[data-action="toggle"]'),
		remove: this.element.query('button[data-action="remove"]'),
		save:   this.element.query('button[data-action="save"]')
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

	Object.values(this.model.mode).forEach((button) => {

		button.on('click', () => {

			if (button.value() === true) {
				button.value(false);
			} else {
				button.value(true);
			}

		});

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

};


Mode.prototype = Object.assign({}, Widget.prototype);


export { Mode };

