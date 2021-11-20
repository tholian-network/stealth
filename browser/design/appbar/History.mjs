
import { Assistant } from '../Assistant.mjs';
import { Element   } from '../Element.mjs';
import { Widget    } from '../Widget.mjs';



const ASSISTANT = new Assistant({
	name:   'History',
	widget: 'appbar/History',
	events: {
		'back':   'Visiting earlier Site in Tab History.',
		'next':   'Visiting later Site in Tab History.',
		'open':   'Opening new Tab.',
		'reload': 'Reload current Tab.'
	}
});

const update = function(tab) {

	if (tab !== null) {

		this.buttons.back.state(tab.can('back') ? 'enabled' : 'disabled');
		this.buttons.next.state(tab.can('next') ? 'enabled' : 'disabled');
		this.buttons.reload.state('enabled');

	} else {

		this.buttons.back.state('disabled');
		this.buttons.next.state('disabled');
		this.buttons.reload.state('disabled');

	}

};



const History = function(browser) {

	this.element = new Element('browser-appbar-history', [
		'<button title="Visit earlier Site in Tab History" data-key="back" disabled></button>',
		'<button title="Visit later Site in Tab History" data-key="next" disabled></button>',
		'<button title="Reload current Tab" data-key="reload" disabled></button>',
		'<button title="Open new Tab" data-key="open" disabled></button>'
	].join(''));

	this.buttons = {
		back:   this.element.query('[data-key="back"]'),
		next:   this.element.query('[data-key="next"]'),
		reload: this.element.query('[data-key="reload"]'),
		open:   this.element.query('[data-key="open"]')
	};


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.element.on('key', (key) => {

		if (
			key.name === 'f1'
			|| (key.mods.includes('alt') === true && key.name === 'arrowleft')
			|| (key.mods.includes('ctrl') === true && key.name === '[')
		) {

			if (this.buttons.back.state() !== 'disabled') {
				this.buttons.back.emit('click');
			}

		} else if (
			key.name === 'f2'
			|| (key.mods.includes('alt') === true && key.name === 'arrowright')
			|| (key.mods.includes('ctrl') === true && key.name === ']')
		) {

			if (this.buttons.next.state() !== 'disabled') {
				this.buttons.next.emit('click');
			}

		} else if (
			key.name === 'f3'
			|| (key.mods.includes('ctrl') === true && key.name === 'r')
		) {

			if (this.buttons.reload.state() !== 'disabled') {
				this.buttons.reload.emit('click');
			}

		} else if (
			key.name === 'f4'
			|| (key.mods.includes('ctrl') === true && key.name === 't')
		) {

			if (this.buttons.open.state() !== 'disabled') {
				this.buttons.open.emit('click');
			}

		}

	});

	this.buttons.back.on('click', () => {
		ASSISTANT.emit('back');
		browser.back();
	});

	this.buttons.next.on('click', () => {
		ASSISTANT.emit('next');
		browser.next();
	});

	this.buttons.reload.on('click', () => {
		ASSISTANT.emit('reload');
		browser.reload();
	});

	this.buttons.open.state('enabled');
	this.buttons.open.on('click', () => {

		let tab = browser.open(browser.settings['interface'].opentab);
		if (tab !== null) {
			ASSISTANT.emit('open');
			browser.show(tab);
		}

	});


	browser.on('show',    (tab) => update.call(this, tab));
	browser.on('refresh', (tab) => update.call(this, tab));


	Widget.call(this);

};


History.prototype = Object.assign({}, Widget.prototype);


export { History };

