
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';



const update = function(tab) {

	if (tab !== null) {

		if (tab.ref.protocol === 'stealth' && tab.ref.domain === 'settings') {

			this.buttons.browser.state('disabled');
			this.buttons.browser.state('active');

		} else {

			this.buttons.browser.state('enabled');
			this.buttons.browser.state('');

		}

		if (tab.ref.protocol === 'stealth') {

			this.buttons.session.state('disabled');
			this.buttons.site.state('disabled');

		} else {

			this.buttons.session.state('enabled');
			this.buttons.site.state('enabled');

		}

	} else {

		this.buttons.browser.state('enabled');
		this.buttons.browser.state('');

		this.buttons.session.state('disabled');
		this.buttons.site.state('disabled');

	}

};

const toggle_dialog = function(active) {

	if (active !== null) {

		Object.keys(this.dialogs).forEach((key) => {

			let button = this.buttons[key] || null;
			let dialog = this.dialogs[key] || null;

			if (button !== null && dialog !== null) {

				if (active === key) {

					if (button.state() === 'active') {
						button.state('');
						dialog.emit('hide');
					} else {
						button.state('active');
						dialog.emit('show');
					}

				} else {

					button.state('');
					dialog.emit('hide');

				}

			}

		});

	} else {

		Object.keys(this.dialogs).forEach((key) => {

			let button = this.buttons[key] || null;
			if (button !== null) {
				button.state('');
			}

			let dialog = this.dialogs[key] || null;
			if (dialog !== null) {
				dialog.emit('hide');
			}

		});

	}

};



const Settings = function(browser) {

	this.element = new Element('browser-settings', [
		'<button data-key="site" title="Site Settings" disabled></button>',
		'<button data-key="session" title="Session Settings" disabled></button>',
		'<button data-key="browser" title="Browser Settings" disabled></button>'
	].join(''));


	this.buttons = {
		browser: this.element.query('[data-key="browser"]'),
		session: this.element.query('[data-key="session"]'),
		site:    this.element.query('[data-key="site"]')
	};

	this.dialogs = {
		browser: null,
		session: Element.query('browser-dialog[data-key="session"]'),
		site:    Element.query('browser-dialog[data-key="site"]')
	};

	this.element.on('contextmenu', (e) => {

		e.preventDefault();
		e.stopPropagation();

	});

	this.buttons.browser.on('click', () => {

		toggle_dialog.call(this, null);

		browser.navigate('stealth:settings');

	});

	this.buttons.session.on('click', () => {

		if (browser.tab !== null && browser.tab.ref.protocol !== 'stealth') {
			toggle_dialog.call(this, 'session');
		}

	});

	this.buttons.site.on('click', () => {

		if (browser.tab !== null && browser.tab.ref.protocol !== 'stealth') {
			toggle_dialog.call(this, 'site');
		}

	});


	browser.on('show',    (tab) => update.call(this, tab));
	browser.on('refresh', (tab) => update.call(this, tab));
	browser.on('hide',    ()    => toggle_dialog.call(this, null));


	Widget.call(this);

};


Settings.prototype = Object.assign({}, Widget.prototype);


export { Settings };

