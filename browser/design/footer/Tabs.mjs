
import { Element } from '../../design/index.mjs';
import { URL     } from '../../source/parser/URL.mjs';



const render_button = function(tab) {

	if (tab !== null) {

		let button = Element.from('button', URL.render({
			domain:    tab.ref.domain,
			hash:      null,
			host:      tab.ref.host,
			path:      null,
			port:      null,
			protocol:  null,
			query:     null,
			subdomain: tab.ref.subdomain
		}), false);

		button.attr('title',   tab.ref.url);
		button.attr('data-id', tab.id);

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

const update_area = function() {

	let area = this.element.area();
	if (area !== null) {

		if (this.__state === 'active') {

			let webview = Element.query('browser-webview');
			if (webview !== null) {
				webview.area({
					x: area.w > 1 ? area.w : null
				});
			}

			let site = Element.query('browser-site');
			if (site !== null) {
				site.area({
					x: area.w > 1 ? area.w : null
				});
			}

			let session = Element.query('browser-session');
			if (session !== null) {
				session.area({
					x: area.w > 1 ? area.w : null
				});
			}

		} else {

			let webview = Element.query('browser-webview');
			if (webview !== null) {
				webview.area({
					x: null
				});
			}

			let site = Element.query('browser-site');
			if (site !== null) {
				site.area({
					x: null
				});
			}

			let session = Element.query('browser-session');
			if (session !== null) {
				session.area({
					x: null
				});
			}

		}

	}

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
			this.element.state('active');
			this.element.value(this.buttons);
			update_area.call(this);

		} else {

			this.buttons = [];
			this.element.state('');
			this.element.value('');
			update_area.call(this);

		}

	} else {

		this.buttons = [];
		this.element.state('');
		this.element.value('');
		update_area.call(this);

	}

};



const Tabs = function(browser, widgets) {

	this.element  = Element.from('browser-tabs');
	this.buttons  = [];
	this.sorting  = 'domain';
	this.tabindex = -1;

	this.curr = null;
	this.next = null;
	this.prev = null;

	this.__state = 'active';


	this.element.on('click', (e) => {

		let context = widgets.context || null;
		if (context !== null) {
			context.emit('hide');
		}

		let button = this.buttons.find((b) => b.element === e.target) || null;
		if (button !== null) {

			let tab = browser.tabs.find((t) => t.id === '' + button.attr('data-id')) || null;
			if (tab !== null) {

				browser.show(tab);

				setTimeout(() => {

					let splitter = widgets.splitter || null;
					if (splitter !== null) {
						splitter.element.emit('hide');
					}

				}, 0);

			}

		}

	});

	this.element.on('contextmenu', (e) => {

		let context = widgets.context || null;
		if (context !== null) {

			let actions = [];
			let button  = this.buttons.find((b) => b.element === e.target) || null;
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

			if (this.sorting === 'domain') {

				actions.push({
					icon:     'refresh',
					label:    'sort by tab id',
					value:    'id',
					callback: (browser, value) => {
						this.sorting = value;
						update.call(this, browser.tab, browser.tabs);
					}
				});

			} else if (this.sorting === 'id') {

				actions.push({
					icon:     'refresh',
					label:    'sort by domain',
					value:    'domain',
					callback: (browser, value) => {
						this.sorting = value;
						update.call(this, browser.tab, browser.tabs);
					}
				});

			}


			if (actions.length > 0) {

				context.set(actions);
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

		let button = this.buttons.find((b) => b.element === e.target) || null;
		if (button !== null) {

			let tab = browser.tabs.find((t) => t.id === '' + button.attr('data-id'));
			if (tab !== null) {
				browser.close(tab);
			}

		}

	});

	this.element.on('hide', () => {
		this.element.state('');
	});

	this.element.on('resize', (width /*, height */) => {

		if (width < 640) {
			this.__state = '';
			this.element.state('');
		} else {
			this.__state = 'active';
			this.element.state('active');
		}

		update_area.call(this);

	});

	this.element.on('show', () => {

		if (this.buttons.length > 0) {
			this.element.state('active');
		}

	});


	let splitter = widgets.splitter || null;
	if (splitter !== null) {

		splitter.element.on('show', () => {
			this.element.emit('show');
		});

		splitter.element.on('hide', () => {
			this.element.emit('hide');
		});

	}


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

