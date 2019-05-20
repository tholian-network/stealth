
const global  = (typeof window !== 'undefined' ? window : this);
const WIDGETS = global.WIDGETS || {};



const unfocus = function(document, reset) {

	reset = reset === true;


	let focus = document.activeElement || null;
	if (focus !== null && focus !== document.body) {
		focus.blur();
	}

	if (reset === true) {
		document.body.setAttribute('tabindex', 0);
		document.body.focus();
		document.body.setAttribute('tabindex', -1);
	}

};

const rotate_through_modes = function(browser, buttons) {

	let check = buttons.filter((b) => b.state() === 'disabled');
	if (check.length < buttons.length) {

		let next = buttons.find((b) => b.value() !== 'true') || null;
		if (next !== null) {

			next.emit('click');

		} else {

			buttons.forEach((button) => {
				button.value('false');
			});

			if (browser !== null && browser.tab !== null) {
				browser.set({
					domain: browser.tab.config.domain,
					mode: {
						text:  false,
						image: false,
						audio: false,
						video: false,
						other: false
					}
				});
			}

		}

	}

};

const rotate_through_sidebars = function(browser, buttons, sidebars) {

	// let check = buttons.filter((b) => b.state() === 'disabled');
	console.log('rotate through sidebars', buttons, sidebars);

};



export const dispatch = function(window, browser) {

	let widgets = window.WIDGETS || null;
	if (widgets !== null) {

		for (let id in widgets) {
			WIDGETS[id] = widgets[id];
		}

	}


	window.onkeydown = (e) => {

		let ctrl = e.ctrlKey === true;
		let key  = e.key.toLowerCase();

		if (key === 'escape') {

			unfocus(window.document, true);

			let peer = WIDGETS.peer || null;
			if (peer !== null) {
				peer.emit('hide');
			}

			let site = WIDGETS.site || null;
			if (site !== null) {
				site.emit('hide');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f1') {

			unfocus(window.document, false);

			let history = WIDGETS.history || null;
			if (history !== null && history.back.state() !== 'disabled') {
				history.back.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f2') {

			unfocus(window.document, false);

			let history = WIDGETS.history || null;
			if (history !== null && history.next.state() !== 'disabled') {
				history.next.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f3' || (ctrl === true && key === 'r')) {

			unfocus(window.document, false);

			let history = WIDGETS.history || null;
			if (history !== null && history.action.state() !== 'disabled') {
				history.action.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f4' || (ctrl === true && key === 't')) {

			unfocus(window.document, false);

			let history = WIDGETS.history || null;
			if (history !== null && history.open.state() !== 'disabled') {
				history.open.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f5' || (ctrl === true && key === 'e')) {

			unfocus(window.document, false);

			let address = WIDGETS.address || null;
			if (address !== null) {
				address.input.emit('focus');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f6' || (ctrl === true && key === 'w')) {

			unfocus(window.document, false);

			if (browser.tabs.length > 1) {
				browser.kill(browser.tab);
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f7' || (ctrl === true && key === 'pageup')) {

			unfocus(window.document, false);

			let index = browser.tabs.indexOf(browser.tab) - 1;
			if (index < 0) {
				index = browser.tabs.length - 1;
			}

			let tab = browser.tabs[index] || null;
			if (tab !== null) {
				browser.show(tab);
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f8' || (ctrl === true && key === 'pagedown')) {

			unfocus(window.document, false);

			let index = browser.tabs.indexOf(browser.tab) + 1;
			if (index >= browser.tabs.length) {
				index %= browser.tabs.length;
			}

			let tab = browser.tabs[index] || null;
			if (tab !== null) {
				browser.show(tab);
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f9') {

			unfocus(window.document, false);

			let mode = WIDGETS.mode || null;
			if (mode !== null) {
				rotate_through_modes(browser, WIDGETS.mode.buttons);
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f10') {

			unfocus(window.document, false);

			// Reserved for future use

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f11' || (ctrl === true && key === 'backspace')) {

			unfocus(window.document, false);

			let settings = WIDGETS.settings || null;
			if (settings !== null) {

				rotate_through_sidebars(browser, [
					WIDGETS.settings.beacon || null,
					WIDGETS.settings.peer   || null,
					WIDGETS.settings.site   || null
				], [
					WIDGETS.beacon || null,
					WIDGETS.peer   || null,
					WIDGETS.site   || null
				]);

			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f12') {

			unfocus(window.document, false);

			let settings = WIDGETS.settings || null;
			if (settings !== null && settings.browser.state() !== 'disabled') {
				settings.browser.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (
			(ctrl === true && key === 'a')
			|| (ctrl === true && key === 's')
			|| (ctrl === true && key === 'z')
			|| (ctrl === true && key === 'x')
			|| (ctrl === true && key === 'c')
			|| (ctrl === true && key === 'v')
		) {

			// Allow default behaviour

		} else if (ctrl === true) {

			// Allow default behaviour

		}

	};


};

