
import { Element } from '../../design/index.mjs';



const TEMPLATE = `
<button data-key="back" title="Visit earlier Site" disabled></button>
<button data-key="next" title="Visit later Site" disabled></button>
<button data-key="action" data-val="refresh" title="Refresh/Pause current Tab" disabled></button>
<button data-key="open" title="Open Tab" disabled></button>
`;



const update = function(tab) {

	if (tab !== null) {

		this.back.state(tab.can('back') ? 'enabled' : 'disabled');
		this.next.state(tab.can('next') ? 'enabled' : 'disabled');
		this.action.value(tab.can('pause') ? 'pause' : 'refresh');
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
		browser.navigate('stealth:welcome');
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

