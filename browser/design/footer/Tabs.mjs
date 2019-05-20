
import { Element } from '../Element.mjs';
import { URL     } from '../../source/parser/URL.mjs';

const global = (typeof window !== 'undefined' ? window : this);
const doc    = global.document;



const render_button = function(tab) {

	if (tab !== null) {

		let button = doc.createElement('button');
		let label  = URL.render({
			domain:    tab.ref.domain,
			hash:      null,
			host:      tab.ref.host,
			path:      null,
			port:      tab.ref.port,
			protocol:  null,
			query:     null,
			subdomain: tab.ref.subdomain
		});

		button.innerHTML = label;
		button.title     = tab.ref.url;
		button.setAttribute('data-id', tab.id);

		return button;

	}


	return null;

};

const sort_by_domain = function(a, b) {

	if (a.ref.protocol === 'stealth' && b.ref.protocol !== 'stealth') return  1;
	if (b.ref.protocol === 'stealth' && a.ref.protocol !== 'stealth') return -1;

	if (a.ref.domain < b.ref.domain) return -1;
	if (b.ref.domain < a.ref.domain) return  1;

	if (a.ref.subdomain !== null && b.ref.subdomain !== null) {
		if (a.ref.subdomain < b.ref.subdomain) return -1;
		if (b.ref.subdomain < a.ref.subdomain) return  1;
	}

	if (a.ref.subdomain !== null && b.ref.subdomain === null) return  1;
	if (b.ref.subdomain !== null && a.ref.subdomain === null) return -1;

	return 0;

};

const sort_by_id = function(a, b) {

	if (a.id < b.id) return -1;
	if (b.id < a.id) return  1;

	return 0;

};

const update = function(tab, tabs) {

	if (tabs.length > 1) {

		if (this.sorting === 'domain') {
			tabs = tabs.sort(sort_by_domain);
		} else if (this.sorting === 'id') {
			tabs = tabs.sort(sort_by_id);
		}

		let buttons = tabs.map((tab) => render_button(tab)).filter((v) => v !== null);
		if (buttons.length === tabs.length) {

			let index = tabs.indexOf(tab);
			if (index !== -1) {
				buttons[index].className = 'active';
			}

			this.buttons = buttons;
			this.element.state('active');
			this.element.value(this.buttons);

		} else {
			this.buttons = [];
			this.element.state('');
			this.element.value('');
		}

	} else {

		this.buttons = [];
		this.element.state('');
		this.element.value('');

	}


	let webview = Element.query('browser-webview');
	if (webview !== null) {

		let rect = this.element.element.getBoundingClientRect();
		if (rect.width > 1) {
			webview.element.style.left = rect.width + 'px';
		} else {
			webview.element.style.left = '';
		}

	}

};



const Tabs = function(browser, widgets) {

	this.element = Element.from('browser-tabs');
	this.buttons = [];
	this.sorting = 'domain';


	this.element.on('click', (e) => {

		let context = widgets.context || null;
		if (context !== null) {
			context.emit('hide');
		}

		let button = this.buttons.find((b) => b === e.target) || null;
		if (button !== null) {

			let id  = button.getAttribute('data-id');
			let tab = browser.tabs.find((t) => t.id === id);
			if (tab !== null) {
				browser.show(tab);
			}

		}

	});

	this.element.on('contextmenu', (e) => {

		let context = widgets.context || null;
		if (context !== null) {

			let actions = [];
			let button  = this.buttons.find((b) => b === e.target) || null;
			if (button !== null) {

				actions.push({
					icon:     'open',
					label:    'open',
					callback: () => {

						let id  = button.getAttribute('data-id');
						let tab = browser.tabs.find((t) => t.id === id);
						if (tab !== null) {
							browser.show(tab);
						}

					}
				});

			}

			if (this.sorting === 'domain') {

				actions.push({
					icon:     'refresh',
					label:    'sort by #id',
					callback: () => {
						this.sorting = 'id';
						update.call(this, browser.tab, browser.tabs);
					}
				});

			} else if (this.sorting === 'id') {

				actions.push({
					icon:     'refresh',
					label:    'sort by domain',
					callback: () => {
						this.sorting = 'domain';
						update.call(this, browser.tab, browser.tabs);
					}
				});

			}

			context.set(actions);
			context.move({ x: e.x, y: e.y });
			context.emit('show');

		}

		e.preventDefault();
		e.stopPropagation();

	});

	this.element.on('dblclick', (e) => {

		let button = this.buttons.find((b) => b === e.target) || null;
		if (button !== null) {

			let id  = button.getAttribute('data-id');
			let tab = browser.tabs.find((t) => t.id === id);
			if (tab !== null) {
				browser.kill(tab);
			}

		}

	});


	browser.on('show',    (tab, tabs) => update.call(this, tab, tabs));
	browser.on('refresh', (tab, tabs) => update.call(this, tab, tabs));

};


Tabs.prototype = {

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Tabs };

