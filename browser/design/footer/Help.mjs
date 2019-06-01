
import { isObject, isString } from '../../source/POLYFILLS.mjs';

import { Element } from '../Element.mjs';



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

const render_hint = function(label, area, title) {

	title = isString(title) ? title : null;


	if (isString(label) && isObject(area)) {

		let element = Element.from('browser-hint', label, false);

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


	this.element.on('click', () => {
		this.element.state('');
	});

	this.element.on('show', () => {

		this.hints = [];

		let history = widgets.history || null;
		if (history !== null) {
			this.hints.push(render_hint('F1', get_area([ history.back   ]), 'Visit earlier Site'));
			this.hints.push(render_hint('F2', get_area([ history.next   ]), 'Visit later Site'));
			this.hints.push(render_hint('F3', get_area([ history.action ]), 'Refresh/Pause current Tab\n(alternatively with [Ctrl] + [R])'));
			this.hints.push(render_hint('F4', get_area([ history.open   ]), 'Open Tab\n(alternatively with [Ctrl] + [T])'));
		}

		let address = widgets.address || null;
		if (address !== null) {
			this.hints.push(render_hint('F5', get_area([ address.output ]), 'Enter URL or Search Query\n(alternatively with [Ctrl] + [E])'));
		}

		let tabs = widgets.tabs || null;
		if (tabs !== null) {
			this.hints.push(render_hint('F6', get_area([ tabs.curr ]), 'Kill current Tab\n(alternatively with [Ctrl] + [W])'));
			this.hints.push(render_hint('F7', get_area([ tabs.prev ]), 'Show previous Tab\n(alternatively with [Ctrl] + [Page Up])'));
			this.hints.push(render_hint('F8', get_area([ tabs.next ]), 'Show next Tab\n(alternatively with [Ctrl] + [Page Down])'));
		}

		let mode = widgets.mode || null;
		if (mode !== null) {
			this.hints.push(render_hint('F9', get_area([ mode.element ]), 'Toggle through Site Modes'));
		}

		let settings = widgets.settings || null;
		if (settings !== null) {

			this.hints.push(render_hint('F11', get_area([
				settings.beacon,
				settings.site,
				settings.session
			]), 'Toggle through Beacon/Session/Site Sidebars\n(alternatively with [Ctrl] + [Backspace])'));

			this.hints.push(render_hint('F12', get_area([ settings.browser ]), 'Open Browser Settings'));

		}


		this.hints = this.hints.filter((o) => o !== null);

		this.element.value(this.hints);
		this.element.state('active');

	});

	this.element.on('hide', () => {
		this.element.state('');
	});

};


Help.prototype = {

	emit: function(event, args) {
		this.element.emit(event, args);
	},

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Help };

