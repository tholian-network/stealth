
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';



const Host = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'refresh', 'remove', 'save' ];
	this.element = new Element('browser-card-host', [
		'<h3><input title="Domain" type="text" data-key="domain" disabled/></h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-host-article>',
		'<textarea title="List of IPv4/IPv6 addresses" data-key="hosts" data-map="IP" rows="4" disabled></textarea>',
		'</browser-card-host-article>',
		'<browser-card-host-footer>',
		'<button title="Create Host" data-action="create"></button>',
		'<button title="Refresh Host" data-action="refresh"></button>',
		'<button title="Remove Host" data-action="remove"></button>',
		'<button title="Save Host" data-action="save"></button>',
		'</browser-card-host-footer>'
	]);

	this.buttons = {
		create:  this.element.query('button[data-action="create"]'),
		refresh: this.element.query('button[data-action="refresh"]'),
		remove:  this.element.query('button[data-action="remove"]'),
		save:    this.element.query('button[data-action="save"]'),
		toggle:  this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		domain: this.element.query('[data-key="domain"]'),
		hosts:  this.element.query('[data-key="hosts"]')
	};

	Widget.call(this);


	this.model.hosts.on('keyup', () => {
		this.model.hosts.validate();
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
		this.buttons.refresh.erase();
		this.buttons.remove.erase();
		this.buttons.save.erase();


		if (this.actions.includes('create') === true) {
			this.model.domain.state('enabled');
			this.model.hosts.state('enabled');
		} else if (this.actions.includes('save') === true) {
			this.model.domain.state('disabled');
			this.model.hosts.state('enabled');
		} else {
			this.model.domain.state('disabled');
			this.model.hosts.state('disabled');
		}


		let footer = this.element.query('browser-card-host-footer');

		if (this.actions.includes('refresh') === true) {
			this.buttons.refresh.render(footer);
		}

		if (this.actions.includes('remove') === true) {
			this.buttons.remove.render(footer);
		}

		if (this.actions.includes('create') === true) {
			this.buttons.create.render(footer);
		} else if (this.actions.includes('save') === true) {
			this.buttons.save.render(footer);
		}

	});


	if (this.buttons.create !== null) {

		this.buttons.create.on('click', () => {

			let value = this.value();

			browser.client.services['host'].save(value, (result) => {

				if (result === true) {

					browser.settings['hosts'].removeEvery((h) => h.domain === value.domain);
					browser.settings['hosts'].push(value);


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

	if (this.buttons.refresh !== null) {

		this.buttons.refresh.on('click', () => {

			browser.client.services['host'].refresh(this.value(), (value) => {

				if (value !== null) {

					browser.settings['hosts'].removeEvery((h) => h.domain === value.domain);
					browser.settings['hosts'].push(value);

					this.value(value);


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

			browser.client.services['host'].remove(value, (result) => {

				if (result === true) {

					browser.settings['hosts'].removeEvery((h) => h.domain === value.domain);
					this.element.erase();

				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			let value = this.value();

			browser.client.services['host'].save(value, (result) => {

				if (result === true) {

					browser.settings['hosts'].removeEvery((h) => h.domain === value.domain);
					browser.settings['hosts'].push(value);

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


Host.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Host(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Host.prototype = Object.assign({}, Widget.prototype);


export { Host };

