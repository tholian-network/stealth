
import { Element } from '../Element.mjs';



const TEMPLATE = `
<button data-key="back" title="Visit earlier Site" disabled></button>
<button data-key="next" title="Visit later Site" disabled></button>
<button data-key="action" data-val="refresh" title="Refresh/Pause current Tab" disabled></button>
<button data-key="open" title="Open Tab" disabled></button>
`;



const update = function(tab) {

	if (tab !== null) {

		let can_back  = tab.history.indexOf(tab.url) > 0;
		let can_next  = tab.history.indexOf(tab.url) < tab.history.length - 1;
		let can_pause = tab.requests.find((r) => r.loading === true) || null;

		this.back.state(can_back ? 'enabled' : 'disabled');
		this.next.state(can_next ? 'enabled' : 'disabled');
		this.action.value(can_pause ? 'pause' : 'refresh');
		this.action.state('enabled');

	} else {

		this.back.state('disabled');
		this.next.state('disabled');
		this.action.state('disabled');

	}

};



const History = function(browser) {

	this.element = Element.from('browser-history', TEMPLATE);
	this.back    = this.element.query('[data-key="back"]');
	this.next    = this.element.query('[data-key="next"]');
	this.action  = this.element.query('[data-key="action"]');
	this.open    = this.element.query('[data-key="open"]');


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.back.on('click', () => browser.back());
	this.next.on('click', () => browser.next());

	this.action.on('click', () => {

		let val = this.state.value();
		if (val === 'refresh') {
			browser.refresh();
		} else if (val === 'pause') {
			browser.pause();
		}

	});

	this.open.state('enabled');
	this.open.on('click', () => {

		let tab = browser.open('stealth:welcome');
		if (tab !== null) {
			browser.show(tab);
		}

	});


	browser.on('show',    (tab) => update.call(this, tab));
	browser.on('refresh', (tab) => update.call(this, tab));

};


History.prototype = {

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { History };

