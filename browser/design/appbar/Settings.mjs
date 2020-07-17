
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';



const update = function(tab) {

	if (tab !== null) {

		if (tab.url.protocol === 'stealth' && tab.url.domain === 'settings') {

			this.buttons.browser.state('disabled');
			this.buttons.browser.state('active');

		} else {

			this.buttons.browser.state('enabled');
			this.buttons.browser.state('');

		}

		if (tab.url.protocol === 'stealth') {

			this.buttons.session.state('disabled');
			this.buttons.site.state('disabled');

		} else {

			if (this.sheets.session !== null) {
				this.buttons.session.state('enabled');
			}

			if (this.sheets.site !== null) {
				this.buttons.site.state('enabled');
			}

		}

	} else {

		this.buttons.browser.state('enabled');
		this.buttons.browser.state('');

		this.buttons.session.state('disabled');
		this.buttons.site.state('disabled');

	}

};



const Settings = function(browser) {

	this.element = new Element('browser-appbar-settings', [
		'<button data-key="site" title="Site Settings" disabled></button>',
		'<button data-key="session" title="Session Settings" disabled></button>',
		'<button data-key="browser" title="Browser Settings" disabled></button>'
	].join(''));


	this.buttons = {
		browser: this.element.query('[data-key="browser"]'),
		session: this.element.query('[data-key="session"]'),
		site:    this.element.query('[data-key="site"]')
	};

	this.sheets = {
		browser: null,
		session: null,
		site:    null
	};

	this.element.on('contextmenu', (e) => {

		e.preventDefault();
		e.stopPropagation();

	});

	this.buttons.browser.on('click', () => {

		if (this.sheets.site !== null) {
			this.sheets.site.emit('hide');
		}

		if (this.sheets.session !== null) {
			this.sheets.session.emit('hide');
		}

		browser.navigate('stealth:settings');

	});

	setTimeout(() => {

		let session = Widget.query('browser-sheet-session');
		if (session !== null) {

			this.sheets.session = session;

			this.sheets.session.on('show', () => {
				this.buttons.session.state('active');
			});

			this.sheets.session.on('hide', () => {
				this.buttons.session.state('');
			});

			this.buttons.session.on('click', () => {

				if (browser.tab !== null && browser.tab.url.protocol !== 'stealth') {

					if (this.sheets.site !== null) {
						this.sheets.site.emit('hide');
					}

					if (this.sheets.session.state() === 'active') {
						this.sheets.session.emit('hide');
					} else {
						this.sheets.session.emit('show');
					}

				}

			});

		} else {

			this.buttons.session.state('disabled');

		}

		let site = Widget.query('browser-sheet-site');
		if (site !== null) {

			this.sheets.site = site;

			this.sheets.site.on('show', () => {
				this.buttons.site.state('active');
			});

			this.sheets.site.on('hide', () => {
				this.buttons.site.state('');
			});

			this.buttons.site.on('click', () => {

				if (browser.tab !== null && browser.tab.url.protocol !== 'stealth') {

					if (this.sheets.session !== null) {
						this.sheets.session.emit('hide');
					}

					if (this.sheets.site.state() === 'active') {
						this.sheets.site.emit('hide');
					} else {
						this.sheets.site.emit('show');
					}

				}

			});

		} else {

			this.buttons.site.state('disabled');

		}

	}, 0);


	browser.on('show',    (tab) => update.call(this, tab));
	browser.on('refresh', (tab) => update.call(this, tab));
	browser.on('hide',    ()    => {

		if (this.sheets.site !== null) {
			this.sheets.site.emit('hide');
		}

		if (this.sheets.session !== null) {
			this.sheets.session.emit('hide');
		}

	});


	Widget.call(this);

};


Settings.prototype = Object.assign({}, Widget.prototype);


export { Settings };

