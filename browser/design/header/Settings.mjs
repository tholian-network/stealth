
import { Element } from '../Element.mjs';



const TEMPLATE = `
<button data-key="beacon" title="Beacon Settings" disabled></button>
<button data-key="session" title="Session Settings" disabled></button>
<button data-key="site" title="Site Settings" disabled></button>
<button data-key="browser" title="Browser Settings" disabled></button>
`;



const update = function(tab) {

	if (tab !== null) {

		if (tab.ref.protocol === 'stealth' && tab.ref.domain === 'settings') {
			this.browser.state('disabled');
			this.browser.state('active');
		} else {
			this.browser.state('enabled');
			this.browser.state('');
		}

		if (tab.ref.protocol === 'stealth') {
			this.beacon.state('disabled');
			this.session.state('disabled');
			this.site.state('disabled');
		} else {
			this.beacon.state('enabled');
			this.session.state('enabled');
			this.site.state('enabled');
		}

	} else {

		this.browser.state('enabled');
		this.browser.state('');

		this.beacon.state('disabled');
		this.session.state('disabled');
		this.site.state('disabled');

	}

};

const toggle = function(name, widgets) {

	[ 'beacon', 'session', 'site' ].forEach((sidebar) => {

		let button = this[sidebar]    || null;
		let widget = widgets[sidebar] || null;
		if (button !== null && widget !== null) {

			if (sidebar === name) {
				button.state('active');
				widget.emit('show');
			} else {
				button.state('');
				widget.emit('hide');
			}

		}

	});

};



const Settings = function(browser, widgets) {

	this.element = Element.from('browser-settings', TEMPLATE);
	this.beacon  = this.element.query('[data-key="beacon"]');
	this.browser = this.element.query('[data-key="browser"]');
	this.session = this.element.query('[data-key="session"]');
	this.site    = this.element.query('[data-key="site"]');


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.beacon.on('click', () => {

		if (browser.tab !== null && browser.tab.ref.protocol !== 'stealth') {
			toggle.call(this, 'beacon', widgets);
		}

	});

	this.browser.on('click', () => {

		toggle.call(this, null, widgets);

		let tab = browser.open('stealth:settings');
		if (tab !== null) {
			browser.show(tab);
		}

	});

	this.session.on('click', () => {

		if (browser.tab !== null && browser.tab.ref.protocol !== 'stealth') {
			toggle.call(this, 'session', widgets);
		}

	});

	this.site.on('click', () => {

		if (browser.tab !== null && browser.tab.ref.protocol !== 'stealth') {
			toggle.call(this, 'site', widgets);
		}

	});


	browser.on('show',    (tab) => update.call(this, tab));
	browser.on('refresh', (tab) => update.call(this, tab));

};


Settings.prototype = {

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Settings };

