
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';
import { isArray } from '../../extern/base.mjs';



const remove = (browser, host) => {

	let other = browser.settings.hosts.find((h) => h.domain === host.domain) || null;
	if (other !== null) {
		browser.settings.hosts.remove(other);
	}

};

const update = (browser, host) => {

	let other = browser.settings.hosts.find((h) => h.domain === host.domain) || null;
	if (other !== null) {

		Object.keys(host).filter((key) => {
			return key !== 'domain';
		}).forEach((key) => {
			other[key] = host[key];
		});

	} else {

		browser.settings.hosts.push(host);

	}

};



const Host = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'refresh', 'remove', 'save' ];
	this.element = new Element('browser-card-host', [
		'<h3 data-key="domain">example.com</h3>',
		'<button data-action="toggle"></button>',
		'<browser-card-host-article>',
		'<textarea data-key="hosts" data-map="IP"></textarea>',
		'</browser-card-host-article>',
		'<browser-card-host-footer>',
		'<button data-action="create" title="create"></button>',
		'<button data-action="refresh" title="refresh"></button>',
		'<button data-action="remove" title="remove"></button>',
		'<button data-action="save" title="save"></button>',
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


		let article = this.element.query('browser-card-host-article');
		let footer  = this.element.query('browser-card-host-footer');
		let h3      = this.element.query('h3');

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

			if (this.model.hosts.type === 'span') {

				let span     = this.model.hosts;
				let textarea = new Element('textarea');

				textarea.attr('data-key', 'hosts');
				textarea.attr('data-map', 'IP');

				span.erase();

				textarea.value(span.value());
				textarea.render(article);

				this.model.hosts = textarea;

			}

		} else {

			if (this.model.hosts.type === 'textarea') {

				let span     = new Element('span');
				let textarea = this.model.hosts;

				span.attr('data-key', 'hosts');
				span.attr('data-map', 'IP');

				textarea.erase();

				span.value(textarea.value());
				span.render(article);

				this.model.hosts = span;

			}

		}


		if (this.actions.includes('create')) {

			if (this.actions.includes('refresh')) {
				this.buttons.refresh.render(footer);
			}

			this.buttons.create.render(footer);

		} else if (this.actions.includes('save')) {

			if (this.actions.includes('refresh')) {
				this.buttons.refresh.render(footer);
			}

			if (this.actions.includes('remove')) {
				this.buttons.remove.render(footer);
			}

			this.buttons.save.render(footer);

		}

	});

	if (this.buttons.create !== null) {

		this.buttons.create.on('click', () => {

			browser.client.services['host'].save(this.value(), (result) => {

				if (result === true) {
					update(browser, this.value());
				}

			});

			if (
				this.actions.includes('create') === true
				&& this.actions.includes('save') === false
			) {

				this.actions = this.actions.map((action) => {

					if (action === 'create') {
						return 'save';
					} else {
						return action;
					}

				});

			}

			this.element.emit('update');

		});

	}

	if (this.buttons.refresh !== null) {

		this.buttons.refresh.on('click', () => {

			browser.client.services['host'].refresh(this.value(), (host) => {

				if (host !== null) {

					if (
						this.actions.includes('create') === true
						&& this.actions.includes('save') === false
					) {

						this.actions = this.actions.map((action) => {

							if (action === 'create') {
								return 'save';
							} else {
								return action;
							}

						});

					}

					this.element.emit('update');

					update(browser, host);
					this.value(host);

				}

			});

		});

	}

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			browser.client.services['host'].remove(this.value(), (result) => {

				if (result === true) {
					remove(browser, this.value());
					this.element.erase();
				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			browser.client.services['host'].save(this.value(), (result) => {

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


Host.prototype = Object.assign({}, Widget.prototype);


export { Host };

