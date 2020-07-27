
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

	}

};



const Host = function(browser, actions) {

	actions = isArray(actions) ? actions : [ 'refresh', 'remove', 'save' ];


	this.element = new Element('browser-card-host', [
		'<h3 data-key="domain">Domain</h3>',
		'<button data-action="toggle"></button>',
		'<article>',
		actions.includes('save') ? '<textarea data-key="hosts" data-map="IP"></textarea>' : '<span data-key="hosts" data-map="IP"></span>',
		'\t<div>',
		actions.includes('refresh') ? '\t\t<button data-action="refresh" title="refresh"></button>' : '',
		actions.includes('remove')  ? '\t\t<button data-action="remove" title="remove"></button>'   : '',
		actions.includes('save')    ? '\t\t<button data-action="save" title="save"></button>'       : '',
		'\t</div>',
		'</article>',
	]);

	this.buttons = {
		toggle:  this.element.query('button[data-action="toggle"]'),
		refresh: this.element.query('button[data-action="refresh"]'),
		remove:  this.element.query('button[data-action="remove"]'),
		save:    this.element.query('button[data-action="save"]')
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


	if (this.buttons.toggle !== null) {

		this.buttons.toggle.on('click', () => {

			if (this.element.state() === 'active') {
				this.element.emit('hide');
			} else {
				this.element.emit('show');
			}

		});

	}

	if (this.buttons.refresh !== null) {

		this.buttons.refresh.on('click', () => {

			browser.client.services['host'].refresh(this.value(), (host) => {

				update(browser, host);
				this.value(host);

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

};


Host.prototype = Object.assign({}, Widget.prototype);


export { Host };

