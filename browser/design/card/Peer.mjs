
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';
import { isArray } from '../../extern/base.mjs';



const Peer = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'refresh', 'remove', 'save' ];
	this.element = new Element('browser-card-peer', [
		'<h3 title="Domain" data-key="domain">example.com</h3>',
		'<button title="Toggle visibility of this card" data-action="toggle"></button>',
		'<browser-card-peer-article>',
		'<span>Connection:</span><button data-key="connection" data-val="offline" disabled></button>',
		'</browser-card-peer-article>',
		'<browser-card-peer-footer>',
		'<button title="Create Peer" data-action="create"></button>',
		'<button title="Refresh Peer" data-action="refresh"></button>',
		'<button title="Remove Peer" data-action="remove"></button>',
		'<button title="Save Peer" data-action="save"></button>',
		'</browser-card-peer-footer>'
	]);

	this.buttons = {
		create:  this.element.query('button[data-action="create"]'),
		refresh: this.element.query('button[data-action="refresh"]'),
		remove:  this.element.query('button[data-action="remove"]'),
		save:    this.element.query('button[data-action="save"]'),
		toggle:  this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		domain:     this.element.query('[data-key="domain"]'),
		connection: this.element.query('[data-key="connection"]')
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


		let footer = this.element.query('browser-card-peer-footer');
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

			let value = this.value();

			browser.client.services['peer'].refresh(value, (peer) => {

				if (peer !== null) {

					browser.settings['peers'].removeEvery((p) => p.domain === value.domain);
					browser.settings['peers'].push(value);

					this.value(peer);


					if (this.actions.includes('create') === true) {
						this.actions.remove('create');
					}

					if (this.actions.includes('save') === false) {
						this.actions.push('save');
					}

					this.element.emit('update');

				} else {

					value['connection'] = 'offline';
					this.value(value);

				}

			});

		});

	}

	if (this.buttons.refresh !== null) {

		this.buttons.refresh.on('click', () => {

			let value = this.value();

			browser.client.services['peer'].refresh(value, (peer) => {

				if (peer !== null) {

					browser.settings['peers'].removeEvery((m) => m.domain === value.domain);
					browser.settings['peers'].push(value);

					this.value(peer);


					if (this.actions.includes('create') === true) {
						this.actions.remove('create');
					}

					if (this.actions.includes('save') === false) {
						this.actions.push('save');
					}

					this.element.emit('update');

				} else {

					value['connection'] = 'offline';
					this.value(value);

				}

			});

		});

	}

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			let value = this.value();

			browser.client.services['peer'].remove(value, (result) => {

				if (result === true) {

					browser.settings['peers'].removeEvery((h) => h.domain === value.domain);
					this.element.erase();

				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			let value = this.value();

			browser.client.services['peer'].save(value, (result) => {

				if (result === true) {

					browser.settings['peers'].removeEvery((h) => h.domain === value.domain);
					browser.settings['peers'].push(value);

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


Peer.prototype = Object.assign({}, Widget.prototype);


export { Peer };

