
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';
import { URL               } from '../../source/parser/URL.mjs';



const Redirect = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-redirect', [
		'<h3>',
		'<input title="Domain" type="text" data-key="domain" placeholder="domain.tld" size="10" disabled/>',
		'<input title="Path" type="text" data-key="path" pattern="/([A-Za-z0-9/._-]+)" placeholder="/path" size="5" disabled/>',
		'</h3>',
		'<button title="Toggle visibility of this card" data-action="toggle"></button>',
		'<browser-card-redirect-article>',
		'<input title="Target Location" type="text" data-key="location" data-map="URL" placeholder="https://target/location.html" disabled/>',
		'</browser-card-redirect-article>',
		'<browser-card-redirect-footer>',
		'<button title="Create Redirect" data-action="create"></button>',
		'<button title="Remove Redirect" data-action="remove"></button>',
		'<button title="Save Redirect" data-action="save"></button>',
		'</browser-card-redirect-footer>'
	]);

	this.buttons = {
		create:  this.element.query('button[data-action="create"]'),
		remove:  this.element.query('button[data-action="remove"]'),
		save:    this.element.query('button[data-action="save"]'),
		toggle:  this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		domain:     this.element.query('[data-key="domain"]'),
		path:       this.element.query('[data-key="path"]'),
		location:   this.element.query('[data-key="location"]')
	};

	Widget.call(this);


	this.model.domain.on('keyup', () => {
		this.model.domain.validate();
	});

	this.model.path.on('keyup', () => {
		this.model.path.validate();
	});

	this.model.location.on('keyup', () => {
		this.model.location.validate();
	});

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


		if (this.actions.includes('create')) {

			this.model.domain.attr('required', true);
			this.model.domain.state('enabled');

			this.model.path.attr('required', true);
			this.model.path.state('enabled');

			this.model.location.attr('required', true);
			this.model.location.state('enabled');

		} else if (this.actions.includes('save')) {

			this.model.domain.attr('required', true);
			this.model.domain.state('disabled');

			this.model.path.attr('required', true);
			this.model.path.state('enabled');

			this.model.location.attr('required', true);
			this.model.location.state('enabled');

		} else {

			this.model.domain.state('disabled');
			this.model.path.state('disabled');
			this.model.location.state('disabled');

		}


		let footer = this.element.query('browser-card-redirect-footer');

		if (this.actions.includes('remove')) {
			this.buttons.remove.render(footer);
		}

		if (this.actions.includes('create')) {
			this.buttons.create.render(footer);
		} else if (this.actions.includes('save')) {
			this.buttons.save.render(footer);
		}

	});

	if (this.buttons.create !== null) {

		this.buttons.create.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['redirect'].save(value, (result) => {

					if (result === true) {

						browser.settings['redirects'].removeEvery((r) => r.domain === value.domain && r.path === value.path);
						browser.settings['redirects'].push(value);


						if (this.actions.includes('create') === true) {
							this.actions.remove('create');
						}

						if (this.actions.includes('save') === false) {
							this.actions.push('save');
						}

						this.element.emit('update');

					}

				});

			}

		});

	}

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			let value = this.value();

			browser.client.services['redirect'].remove(value, (result) => {

				if (result === true) {

					browser.settings['redirects'].removeEvery((r) => r.domain === value.domain && r.path === value.path);
					this.element.erase();

				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['redirect'].save(value, (result) => {

					if (result === true) {

						browser.settings['redirects'].removeEvery((r) => r.domain === value.domain && r.path === value.path);
						browser.settings['redirects'].push(value);

					}

				});

			}

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

	window.REDIRECT = this;

};


Redirect.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Redirect(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Redirect.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (isObject(value) === true) {

				if (URL.isURL(value.location) === false) {
					value.location = URL.parse(value.location);
				}

			}

			return Widget.prototype.value.call(this, value);

		} else {

			value = Widget.prototype.value.call(this);

			if (isObject(value) === true) {

				if (URL.isURL(value.location) === true) {
					value.location = value.location.link;
				}

			}

			return value;

		}

	}

});


export { Redirect };

