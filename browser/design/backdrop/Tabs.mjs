
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';
import { URL     } from '../../source/parser/URL.mjs';



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

		let webview = Widget.query('browser-webview');
		if (webview !== null) {

			if (this.__state.mobile === false) {

				webview.area({
					x: area.w > 1 ? area.w : null
				});

			} else {

				webview.area({
					x: null
				});

			}

		}

	}

};

const update = function(tab, tabs) {

	if (tabs.length > 1) {

		if (this.__state.sorting === 'domain') {
			tabs = tabs.sort(sort_by_domain);
		} else if (this.__state.sorting === 'id') {
			tabs = tabs.sort(sort_by_id);
		}


		let buttons = tabs.map((tab) => {

			let button = new Element('button', URL.render({
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
		this.element.state('active');
		this.element.value(this.buttons);
		update_area.call(this);

	} else {

		this.buttons = [];
		this.element.state('');
		this.element.value('');
		update_area.call(this);

	}

};



const Tabs = function(browser) {

	this.element  = new Element('browser-tabs');
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

		let context = Widget.query('browser-context');
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

					if (this.__state.mobile === true) {

						setTimeout(() => {

							let splitter = Widget.query('browser-splitter');
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

		let context = Widget.query('browser-context');
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
					label:    'sort by tab id',
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

				let tab = browser.tabs.find((t) => t.id === '' + button.attr('data-id'));
				if (tab !== null) {
					browser.close(tab);
				}

			}

		}

	});

	this.element.on('hide', () => {
		this.element.state('');
	});

	this.element.on('resize', (width /*, height */) => {

		if (width < 640) {
			this.__state.mobile = true;
			this.element.state('');
		} else {
			this.__state.mobile = false;
			this.element.state('active');
		}

		update_area.call(this);

	});

	this.element.on('show', () => {

		if (this.buttons.length > 0) {
			this.element.state('active');
		}

	});


	let splitter = Widget.query('browser-splitter');
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

