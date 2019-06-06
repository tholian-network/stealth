
import { isObject, isString } from '../../source/POLYFILLS.mjs';

import { Element } from '../Element.mjs';



const TEXT = () => `
<h3>Keyboard Help</h3>
<div><code>[Enter]</code> Quit Help</div>
<ul>
	<li data-key="f1"><code>[F1]</code> Visit earlier Site</li>
	<li data-key="f2"><code>[F2]</code> Visit later Site</li>
	<li data-key="f3"><code>[F3]</code> Refresh/Pause current Tab</li>
	<li data-key="f4"><code>[F4]</code> Open Tab</li>
	<li data-key="f5"><code>[F5]</code> Enter URL or Search Query</li>
	<li data-key="f6"><code>[F6]</code> Kill current Tab</li>
	<li data-key="f7"><code>[F7]</code> Show previous Tab</li>
	<li data-key="f8"><code>[F8]</code> Show next Tab</li>
	<li data-key="f9"><code>[F9]</code> Toggle through Site Modes</li>
	<li data-key="f10"><code>[F10]</code> (reserved)</li>
	<li data-key="f11"><code>[F11]</code> Toggle through Beacon/Session/Site Sidebars</li>
	<li data-key="f12"><code>[F12]</code> Open Browser Settings</li>
</ul>
`;


const get_area = function(elements) {

	elements = elements.filter((e) => Element.isElement(e));

	if (elements.length > 1) {

		let result = {
			w: 0, h: 0,
			x: 0, y: 0
		};

		let ws = [];
		let hs = [];
		let xs = [];
		let ys = [];

		elements.forEach((element) => {

			let area = element.area();
			if (area !== null) {

				ws.push(area.w);
				hs.push(area.h);
				xs.push(area.x);
				ys.push(area.y);

			}

		});

		let xs_length = xs.length;
		if (xs_length > 0) {
			result.x = (xs.reduce((a, b) => a + b, 0) / xs_length) | 0;
		}

		let ys_length = ys.length;
		if (ys_length > 0) {
			result.y = (ys.reduce((a, b) => a + b, 0) / ys_length) | 0;
		}


		let bb_x_min = 0;
		let bb_x_max = 0;
		if (xs.length > 0) {
			bb_x_min = xs.reduce((a, b) => Math.min(a, b), xs[0]);
			bb_x_max = xs.reduce((a, b) => Math.max(a, b), xs[0]);
		}

		if (bb_x_min !== bb_x_max) {
			result.w = Math.max(ws[0], Math.abs((bb_x_min - ws[0] / 2) - (bb_x_max + ws[ws.length - 1] / 2)));
		} else {
			result.w = ws.reduce((a, b) => Math.max(a, b), ws[0]);
		}

		let bb_y_min = 0;
		let bb_y_max = 0;
		if (ys.length > 0) {
			bb_y_min = ys.reduce((a, b) => Math.min(a, b), ys[0]);
			bb_y_max = ys.reduce((a, b) => Math.max(a, b), ys[0]);
		}

		if (bb_y_min !== bb_y_max) {
			result.h = Math.max(hs[0], Math.abs((bb_y_min - hs[0] / 2) - (bb_y_max + hs[hs.length - 1] / 2)));
		} else {
			result.h = hs.reduce((a, b) => Math.max(a, b), hs[0]);
		}

		return result;

	} else if (elements.length === 1) {
		return elements[0].area();
	}


	return null;

};

const render_hint = function(key, area, title) {

	title = isString(title) ? title : null;


	if (isString(key) && isObject(area)) {

		let element = Element.from('browser-hint', key.toUpperCase(), false);

		element.attr('data-key', key);

		element.area({
			w: area.w,
			h: area.h,
			x: area.x,
			y: area.y
		});

		element.title(title);

		return element;

	}

	return null;

};



const Help = function(browser, widgets) {

	this.element = Element.from('browser-help');
	this.hints   = [];
	this.text    = Element.from('browser-text', TEXT(), false);


	this.element.on('click', () => {
		this.text.area({ x: null });
		this.element.state('');
	});

	this.element.on('mouseover', (e) => {

		let target = e.target;
		let type   = e.target.tagName.toLowerCase();
		if (type === 'browser-hint') {

			let hint = this.hints.find((h) => h.element === target) || null;
			if (hint !== null) {
				this.select(hint.attr('data-key'));
			}

		} else if (type === 'li') {

			let item = this.text.query('li[data-key]').find((i) => i.element === target) || null;
			if (item !== null) {
				this.select(item.attr('data-key'));
			}

		}

	});

	this.element.on('show', () => {

		this.hints = [];

		let history = widgets.history || null;
		if (history !== null) {
			this.hints.push(render_hint('f1', get_area([ history.back   ])));
			this.hints.push(render_hint('f2', get_area([ history.next   ])));
			this.hints.push(render_hint('f3', get_area([ history.action ]), 'or use [Ctrl] + [R]'));
			this.hints.push(render_hint('f4', get_area([ history.open   ]), 'or use [Ctrl] + [T]'));
		}

		let address = widgets.address || null;
		if (address !== null) {
			this.hints.push(render_hint('f5', get_area([ address.output ]), 'or use [Ctrl] + [E]'));
		}

		let tabs = widgets.tabs || null;
		if (tabs !== null) {

			if (tabs.element.state() === 'active') {

				this.hints.push(render_hint('f6', get_area([ tabs.curr ]), 'or use [Ctrl] + [W]'));
				this.hints.push(render_hint('f7', get_area([ tabs.prev ]), 'or use [Ctrl] + [Page Up]'));
				this.hints.push(render_hint('f8', get_area([ tabs.next ]), 'or use [Ctrl] + [Page Down]'));

				let tabs_area = tabs.element.area();
				let tabs_last = tabs.buttons[tabs.buttons.length - 1].area();
				let text_area = this.text.area();

				if (tabs_area !== null && text_area !== null) {

					let cur_y = text_area.y - text_area.h / 2;
					let max_y = tabs_last.y + tabs_last.h / 2;

					if (max_y > cur_y) {

						let cur_x = text_area.x - text_area.w / 2;
						if (cur_x <= tabs_area.w) {
							this.text.area({ x: tabs_area.w + text_area.w / 2 });
						} else {
							this.text.area({ x: null });
						}

					} else {
						this.text.area({ x: null });
					}

				} else {
					this.text.area({ x: null });
				}

			} else {
				this.text.area({ x: null });
			}

		} else {
			this.text.area({ x: null });
		}

		let mode = widgets.mode || null;
		if (mode !== null) {
			this.hints.push(render_hint('f9', get_area([ mode.element ])));
		}

		let settings = widgets.settings || null;
		if (settings !== null) {

			this.hints.push(render_hint('f11', get_area([
				settings.beacon,
				settings.site,
				settings.session
			]), 'or use [Ctrl] + [Backspace]'));

			this.hints.push(render_hint('f12', get_area([ settings.browser ])));

		}


		this.hints = this.hints.filter((o) => o !== null);

		this.element.value([ this.text, ...this.hints ]);
		this.element.state('active');

	});

	this.element.on('hide', () => {
		this.text.area({ x: null });
		this.element.state('');
	});

	this.element.value([ this.text ]);

};


Help.prototype = {

	emit: function(event, args) {
		this.element.emit(event, args);
	},

	erase: function(target) {
		this.element.erase(target);
	},

	select: function(key) {

		key = isString(key) ? key : null;


		if (key !== null) {

			if (this.hints.length > 0) {

				this.hints.forEach((element) => {
					element.state('');
				});

				let hint = this.hints.find((e) => e.attr('data-key') === key) || null;
				if (hint !== null) {
					hint.state('active');
				}

			}

			let items = this.text.query('li[data-key]');
			if (items.length > 0) {

				items.forEach((item) => {
					item.state('');
				});

				let item = items.find((i) => i.attr('data-key') === key) || null;
				if (item !== null) {
					item.state('active');
				}

			}

		} else {

			this.hints.forEach((element) => {
				element.state('');
			});

			let items = this.text.query('li[data-key]');
			if (items.length > 0) {

				items.forEach((item) => {
					item.state('');
				});

			}

		}

	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Help };

