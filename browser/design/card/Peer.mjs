
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';



const Peer = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'refresh', 'remove', 'save' ];
	this.element = new Element('browser-card-peer', [
		'<h3><input title="Domain" type="text" data-key="domain" disabled/></h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-peer-article>',
		'<span>Connection:</span><button data-key="peer.connection" data-val="offline" disabled></button>',
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
		domain: this.element.query('[data-key="domain"]'),
		peer:   {
			connection: this.element.query('[data-key="peer.connection"]')
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
		this.buttons.refresh.erase();
		this.buttons.remove.erase();
		this.buttons.save.erase();


		if (this.actions.includes('create') === true) {

			this.model.domain.attr('required', true);
			this.model.domain.state('enabled');

			this.model.peer.connection.state('disabled');

		} else if (this.actions.includes('save') === true) {

			this.model.domain.attr('required', true);
			this.model.domain.state('disabled');

			this.model.peer.connection.state('disabled');

		} else {

			this.model.domain.attr('required', null);
			this.model.domain.state('disabled');

			this.model.peer.connection.state('disabled');

		}


		let footer = this.element.query('browser-card-peer-footer');

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

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			let value = this.value();

			browser.client.services['peer'].remove(value, (result) => {

				if (result === true) {

					browser.settings['peers'].removeEvery((p) => p.domain === value.domain);
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

					browser.settings['peers'].removeEvery((p) => p.domain === value.domain);
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


Peer.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Peer(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Peer.prototype = Object.assign({}, Widget.prototype);


export { Peer };

