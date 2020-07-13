
import { Element, isElement          } from '../Element.mjs';
import { Widget                      } from '../Widget.mjs';
import { isArray, isObject, isString } from '../../extern/base.mjs';



const toArea = function(elements) {

	elements = isArray(elements) ? elements.filter((e) => isElement(e)) : [];


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

	title = isString(title) ? title : '';


	if (isString(key) === true && isObject(area) === true) {

		let element = new Element('browser-hint', key.toUpperCase());

		element.attr('data-key', key);
		element.attr('title',    title);

		element.area({
			w: area.w,
			h: area.h,
			x: area.x,
			y: area.y
		});

		return element;

	}

	return null;

};



const Help = function(/* browser */) {

	this.content = new Element('browser-text', [
		'<h3>Keyboard Help</h3>',
		'<div><code>[Enter]</code> Quit Help</div>',
		'<ul>',
		'<li data-key="f1"><code>[F1]</code> Visit earlier Site</li>',
		'<li data-key="f2"><code>[F2]</code> Visit later Site</li>',
		'<li data-key="f3"><code>[F3]</code> Refresh/Pause current Tab</li>',
		'<li data-key="f4"><code>[F4]</code> Open Tab</li>',
		'<li data-key="f5"><code>[F5]</code> Enter URL or Search Query</li>',
		'<li data-key="f6"><code>[F6]</code> Kill current Tab</li>',
		'<li data-key="f7"><code>[F7]</code> Show previous Tab</li>',
		'<li data-key="f8"><code>[F8]</code> Show next Tab</li>',
		'<li data-key="f9"><code>[F9]</code> Toggle through Site Modes</li>',
		'<li data-key="f10"><code>[F10]</code> (reserved)</li>',
		'<li data-key="f11"><code>[F11]</code> Toggle through Beacon/Session/Site Settings</li>',
		'<li data-key="f12"><code>[F12]</code> Open Browser Settings</li>',
		'</ul>'
	]);

	this.element = new Element('browser-help', [
		this.content
	]);

	this.__state = {
		hints: [],
		items: this.content.query('li[data-key]')
	};


	this.element.on('click', () => {
		this.content.area({ x: null });
		this.element.state('');
	});

	this.element.on('mouseover', (e) => {

		let target = Element.from(e.target);
		if (target !== null) {

			let key = target.attr('data-key');
			if (key !== null) {

				this.__state.hints.forEach((hint) => {
					hint.state(hint.attr('data-key') === key ? 'active' : '');
				});

				this.__state.items.forEach((item) => {
					item.state(item.attr('data-key') === key ? 'active' : '');
				});

			}

		}

	});

	this.element.on('show', () => {

		this.__state.hints.forEach((hint) => {
			hint.destroy();
		});


		let hints = [];

		let history = Widget.query('browser-history');
		if (history !== null) {
			hints.push(render_hint('f1', toArea([ history.buttons.back   ])));
			hints.push(render_hint('f2', toArea([ history.buttons.next   ])));
			hints.push(render_hint('f3', toArea([ history.buttons.action ]), 'or use [Ctrl] + [R]'));
			hints.push(render_hint('f4', toArea([ history.buttons.open   ]), 'or use [Ctrl] + [T]'));
		}

		let address = Widget.query('browser-address');
		if (address !== null) {
			hints.push(render_hint('f5', toArea([ address.output ]), 'or use [Ctrl] + [E]'));
		}

		let tabs = Widget.query('browser-tabs');
		if (tabs !== null) {

			if (tabs.element.state() === 'active') {

				hints.push(render_hint('f6', toArea([ tabs.curr ]), 'or use [Ctrl] + [W]'));
				hints.push(render_hint('f7', toArea([ tabs.prev ]), 'or use [Ctrl] + [Page Up]'));
				hints.push(render_hint('f8', toArea([ tabs.next ]), 'or use [Ctrl] + [Page Down]'));

				let tabs_area = tabs.element.area();
				let tabs_last = tabs.buttons[tabs.buttons.length - 1].area();
				let text_area = this.content.area();

				if (tabs_area !== null && text_area !== null) {

					let cur_y = text_area.y - text_area.h / 2;
					let max_y = tabs_last.y + tabs_last.h / 2;

					if (max_y > cur_y) {

						let cur_x = text_area.x - text_area.w / 2;
						if (cur_x <= tabs_area.w) {
							this.context.area({ x: tabs_area.w + text_area.w / 2 });
						} else {
							this.content.area({ x: null });
						}

					} else {
						this.content.area({ x: null });
					}

				} else {
					this.content.area({ x: null });
				}

			} else {
				this.content.area({ x: null });
			}

		} else {
			this.content.area({ x: null });
		}

		let mode = Widget.query('browser-mode');
		if (mode !== null) {
			hints.push(render_hint('f9', toArea([ mode.element ])));
		}

		let settings = Widget.query('browser-settings');
		if (settings !== null) {

			hints.push(render_hint('f11', toArea([
				settings.buttons.session,
				settings.buttons.site
			]), 'or use [Ctrl] + [Backspace]'));

			hints.push(render_hint('f12', toArea([
				settings.button.browser
			])));

		}


		this.__state.hints = hints.filter((hint) => {
			return hint !== null;
		});

		this.element.value([ this.content, ...this.__state.hints ]);
		this.element.state('active');

	});

	this.element.on('hide', () => {
		this.content.area({ x: null });
		this.element.state('');
	});


	Widget.call(this);

};


Help.prototype = Object.assign({}, Widget.prototype);


export { Help };

