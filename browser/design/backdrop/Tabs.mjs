
import { Assistant } from '../Assistant.mjs';
import { Element   } from '../Element.mjs';
import { Widget    } from '../Widget.mjs';
import { URL       } from '../../source/parser/URL.mjs';



const ASSISTANT = new Assistant({
	name:   'Tabs',
	widget: 'backdrop/Tabs',
	events: {
		'close':  'Closing selected Tab.',
		'select': 'Showing selected Tab.'
	}
});

const update_area = function() {

	let area    = this.element.area();
	let webview = Widget.query('browser-backdrop-webview');

	if (this.element.state() === 'active') {

		if (webview !== null) {

			if (this.__state.mobile === true) {

				webview.area({
					x: null
				});

			} else {

				webview.area({
					x: area.w > 1 ? area.w : null
				});

			}

		}

	} else {

		if (webview !== null) {

			webview.area({
				x: null
			});

		}

	}


};

const update = function(tab, tabs) {

	if (tabs.length > 1) {

		if (this.__state.sorting === 'domain') {

			tabs = tabs.sort((a, b) => {

				if (a.url.protocol === 'stealth' && b.url.protocol !== 'stealth') return  1;
				if (b.url.protocol === 'stealth' && a.url.protocol !== 'stealth') return -1;

				if (a.url.domain < b.url.domain) return -1;
				if (b.url.domain < a.url.domain) return  1;

				if (a.url.subdomain !== null && b.url.subdomain !== null) {
					if (a.url.subdomain < b.url.subdomain) return -1;
					if (b.url.subdomain < a.url.subdomain) return  1;
				}

				if (a.url.subdomain !== null && b.url.subdomain === null) return  1;
				if (b.url.subdomain !== null && a.url.subdomain === null) return -1;

				return 0;

			});

		} else if (this.__state.sorting === 'id') {

			tabs = tabs.sort((a, b) => {

				if (a.id < b.id) return -1;
				if (b.id < a.id) return  1;

				return 0;

			});

		}


		let buttons = tabs.map((tab) => {

			let button = new Element('button', URL.render({
				domain:    tab.url.domain,
				hash:      null,
				host:      tab.url.host,
				path:      null,
				port:      null,
				protocol:  null,
				query:     null,
				subdomain: tab.url.subdomain
			}), false);

			button.attr('title',   tab.url.link);
			button.attr('data-id', tab.id);

			return button;

		});


		if (this.tabindex !== -1) {

			buttons.forEach((button, b) => {
				button.attr('tabindex', this.tabindex + b + 1);
			});

		}

		let curr = tabs.indexOf(tab);
		if (curr !== -1) {

			this.curr = buttons[curr];
			buttons[curr].state('active');

			let prev = tabs.indexOf(tab) - 1;
			if (prev < 0) {

				prev = tabs.length - 1;
				this.prev = null;

			} else {

				if (prev !== curr) {
					this.prev = buttons[prev];
				} else {
					this.prev = null;
				}

			}

			let next = tabs.indexOf(tab) + 1;
			if (next >= tabs.length) {

				next %= tabs.length;
				this.next = null;

			} else {

				if (next !== curr) {
					this.next = buttons[next];
				} else {
					this.next = null;
				}

			}

		}

		this.buttons = buttons;
		this.element.value(this.buttons);

	} else {

		this.buttons = [];
		this.element.value('');

	}


	if (this.__state.mobile === true) {

		this.element.state('');

	} else if (this.__state.mobile === false) {

		if (this.buttons.length > 0) {
			this.element.state('active');
		}

	}


	update_area.call(this);

};



const Tabs = function(browser) {

	this.element  = new Element('browser-backdrop-tabs');
	this.buttons  = [];
	this.tabindex = -1;

	this.curr = null;
	this.next = null;
	this.prev = null;

	this.__state = {
		mobile:  false,
		sorting: 'domain'
	};


	this.element.on('click', (e) => {

		let context = Widget.query('browser-menu-context');
		if (context !== null) {
			context.emit('hide');
		}

		let target = Element.toElement(e.target);
		if (target !== null) {

			let button = this.buttons.find((b) => b === target) || null;
			if (button !== null) {

				let tab = browser.tabs.find((t) => t.id === '' + button.attr('data-id')) || null;
				if (tab !== null) {

					browser.show(tab);
					ASSISTANT.emit('select');

					if (this.__state.mobile === true) {

						setTimeout(() => {

							let splitter = Widget.query('browser-appbar-splitter');
							if (splitter !== null) {
								splitter.emit('hide');
							}

						}, 0);

					}

				}

			}

		}

	});

	this.element.on('contextmenu', (e) => {

		let context = Widget.query('browser-menu-context');
		let target  = Element.toElement(e.target);

		if (context !== null && target !== null) {

			let actions = [];
			let button  = this.buttons.find((b) => b === target) || null;
			if (button !== null) {

				let tab = browser.tabs.find((t) => t.id === '' + button.attr('data-id')) || null;
				if (tab !== null) {

					actions.push({
						label: 'open',
						value: tab.url
					});

					actions.push({
						label: 'copy',
						value: tab.url
					});

					actions.push({
						label: 'close',
						value: tab.id
					});

				}

			}

			if (this.__state.sorting === 'domain') {

				actions.push({
					icon:     'refresh',
					label:    'sort by id',
					value:    'id',
					callback: (browser, value) => {
						this.__state.sorting = value;
						update.call(this, browser.tab, browser.tabs);
					}
				});

			} else if (this.__state.sorting === 'id') {

				actions.push({
					icon:     'refresh',
					label:    'sort by domain',
					value:    'domain',
					callback: (browser, value) => {
						this.__state.sorting = value;
						update.call(this, browser.tab, browser.tabs);
					}
				});

			}


			if (actions.length > 0) {

				context.value(actions);

				context.area({
					x: e.x,
					y: e.y
				});

				context.emit('show');

			}

		}

		e.preventDefault();
		e.stopPropagation();

	});

	this.element.on('dblclick', (e) => {

		let target = Element.toElement(e.target);
		if (target !== null) {

			let button = this.buttons.find((b) => b === target) || null;
			if (button !== null) {

				let tab = browser.tabs.find((t) => t.id === '' + button.attr('data-id')) || null;
				if (tab !== null) {
					browser.close(tab);
					ASSISTANT.emit('close');
				}

			}

		}

	});

	this.element.on('key', (key) => {

		if (
			key.name === 'f6'
			|| (key.mods.includes('ctrl') === true && key.name === 'pageup')
		) {

			if (this.prev !== null) {
				this.prev.emit('click');
				ASSISTANT.emit('select');
			}

		} else if (
			key.name === 'f7'
			|| (key.mods.includes('ctrl') === true && key.name === 'w')
		) {

			if (this.curr !== null) {

				let tab = browser.tabs.find((t) => t.id === '' + this.curr.attr('data-id')) || null;
				if (tab !== null) {
					browser.close(tab);
					ASSISTANT.emit('close');
				}

			}

		} else if (
			key.name === 'f8'
			|| (key.mods.includes('ctrl') === true && key.name === 'pagedown')
		) {

			if (this.next !== null) {
				this.next.emit('click');
				ASSISTANT.emit('select');
			}

		}

	});

	this.element.on('hide', () => {
		this.element.state('');
	});

	this.element.on('resize', (width /*, height */) => {

		let old_state = this.__state.mobile;
		let new_state = old_state;

		if (width < 640) {
			new_state = true;
		} else {
			new_state = false;
		}

		if (old_state !== new_state) {
			update.call(this, browser.tab, browser.tabs);
		}

	});

	this.element.on('show', () => {

		if (this.buttons.length > 0) {
			this.element.state('active');
		}

	});


	let splitter = Widget.query('browser-appbar-splitter');
	if (splitter !== null) {

		splitter.on('show', () => this.emit('show'));
		splitter.on('hide', () => this.emit('hide'));

	}


	browser.on('show',    (tab, tabs) => update.call(this, tab, tabs));
	browser.on('refresh', (tab, tabs) => update.call(this, tab, tabs));


	Widget.call(this);

};


Tabs.prototype = Object.assign({}, Widget.prototype);


export { Tabs };

