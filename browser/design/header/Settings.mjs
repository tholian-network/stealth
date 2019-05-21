
import { Element } from '../Element.mjs';



const TEMPLATE = `
<button data-key="beacon" title="Beacon Settings" disabled></button>
<button data-key="site" title="Site Settings" disabled></button>
<button data-key="peer" title="Peer Settings" disabled></button>
<button data-key="browser" title="Browser Settings" class="active" disabled></button>
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
			this.peer.state('disabled');
			this.site.state('disabled');
		} else {
			this.beacon.state('enabled');
			this.peer.state('enabled');
			this.site.state('enabled');
		}

	} else {

		this.browser.state('enabled');
		this.browser.state('');

		this.beacon.state('disabled');
		this.peer.state('disabled');
		this.site.state('disabled');

	}

};



const Settings = function(browser) {

	this.element = Element.from('browser-settings', TEMPLATE);
	this.beacon  = this.element.query('[data-key="beacon"]');
	this.browser = this.element.query('[data-key="browser"]');
	this.peer    = this.element.query('[data-key="peer"]');
	this.site    = this.element.query('[data-key="site"]');


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.beacon.on('click', () => {

		let peer = Element.query('sidebar-peer');
		if (peer !== null) {
			peer.emit('hide');
		}

		let site = Element.query('sidebar-site');
		if (site !== null) {
			site.emit('hide');
		}

		let beacon = Element.query('sidebar-beacon');
		if (beacon !== null) {
			beacon.emit('show');
		}

	});

	this.browser.on('click', () => {

		let tab = browser.open('stealth:settings');
		if (tab !== null) {
			browser.show(tab);
		}

	});

	this.peer.on('click', () => {

		if (browser.tab !== null && browser.tab.ref.protocol !== 'stealth') {

			let beacon = Element.query('sidebar-beacon');
			if (beacon !== null) {
				beacon.emit('hide');
			}

			let site = Element.query('sidebar-site');
			if (site !== null) {
				site.emit('hide');
			}

			let peer = Element.query('sidebar-peer');
			if (peer !== null) {
				peer.emit('show');
			}

		}

	});

	this.site.on('click', () => {

		if (browser.tab !== null && browser.tab.ref.protocol !== 'stealth') {

			let beacon = Element.query('sidebar-beacon');
			if (beacon !== null) {
				beacon.emit('hide');
			}

			let peer = Element.query('sidebar-peer');
			if (peer !== null) {
				peer.emit('hide');
			}

			let site = Element.query('sidebar-site');
			if (site !== null) {
				site.emit('show');
			}

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

