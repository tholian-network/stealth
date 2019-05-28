
import { isString } from '../source/POLYFILLS.mjs';

import { Element } from './Element.mjs';
import { URL     } from '../source/parser/URL.mjs';

const global  = (typeof window !== 'undefined' ? window : this);
const WIDGETS = global.WIDGETS || {};



const oncontext = function(window, browser, element) {

	let context = WIDGETS.context || null;
	let ref     = null;
	let type    = element.type();

	if (type === 'a') {
		ref = URL.resolve(browser.tab.url, element.attr('href'));
	} else if (type === 'img') {
		ref = URL.resolve(browser.tab.url, element.attr('src'));
	} else if (type === 'audio' || type === 'video') {
		ref = URL.resolve(browser.tab.url, element.attr('src'));
	}

	if (context !== null) {
		context.emit('hide');
	}


	if (context !== null && ref !== null) {

		let actions = [];

		if (ref.protocol === 'https' || ref.protocol === 'http' || ref.protocol === 'stealth') {

			let tab = browser.tab || null;
			if (tab !== null) {

				if (tab.url === ref.url) {

					if (ref.hash !== null) {

						actions.push({
							icon:     'focus',
							label:    'focus',
							value:    ref.hash,
							callback: (browser, value) => {

								if (isString(value)) {

									let target = window.document.querySelector('#' + value) || null;
									if (target !== null) {

										target.scrollIntoView({
											behavior: 'smooth',
											block:    'center'
										});

										wait_for(window, 'scrollY', () => {

											let child = target.querySelector('a, button, input, textarea, *[tabindex]') || null;
											if (child !== null) {
												child.focus();
											}

										});

									}

								}

							}

						});

					} else {

						actions.push({
							label: 'refresh'
						});

					}

				} else {

					if (tab.ref.domain === ref.domain) {

						actions.push({
							icon:     'open',
							label:    'open',
							value:    ref.url,
							callback: function(browser, value) {

								if (isString(value)) {

									let ref = URL.parse(value.trim());
									if (ref.protocol !== null) {
										browser.navigate(ref.url);
									}

								}

							}
						});

					} else {

						actions.push({
							label: 'open',
							value: ref.url
						});

					}

				}

			} else {

				actions.push({
					label: 'open',
					value: ref.url
				});

			}

		}

		if (ref.protocol !== null) {

			actions.push({
				label: 'copy',
				value: ref.url
			});

		}

		if (ref.protocol === 'https' || ref.protocol === 'http') {

			actions.push({
				label: 'download',
				value: ref.url
			});

		}

		if (actions.length > 0) {

			let area     = element.area();
			let offset_x = 0;
			let offset_y = 0;


			let header = Element.query('header');
			if (header !== null) {
				offset_y += header.area().h;
			}

			let tabs = WIDGETS.tabs || null;
			if (tabs !== null && tabs.element.state() === 'active') {
				offset_x += tabs.element.area().w;
			}


			context.set(actions);
			context.area({
				x: area.x + offset_x,
				y: area.y + offset_y
			});
			context.emit('show');

		}

	}

};

const uncontext = function(window, browser, reset) {

	reset = reset === true;


	let context = WIDGETS.context || null;
	if (context !== null) {
		context.emit('hide');
	}

	if (reset === true) {
		// TODO: If reset is true, find
		// original element and focus()
	}

};

const unfocus = function(window, browser, reset) {

	reset = reset === true;


	let focus = window.document.activeElement || null;
	if (focus !== null) {
		focus.blur();
	}

	if (reset === true) {

		window.document.body.setAttribute('tabindex', 0);
		window.document.body.focus();
		window.document.body.setAttribute('tabindex', -1);

		if (global !== window) {

			let focus = global.document.activeElement || null;
			if (focus !== null) {
				focus.blur();
			}

			global.document.body.setAttribute('tabindex', 0);
			global.document.body.focus();
			global.document.body.setAttribute('tabindex', -1);

		}

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

const rotate_through_sidebars = function(browser, buttons) {

	let check = buttons.filter((b) => b.state() === 'disabled');
	if (check.length < buttons.length) {

		let curr = buttons.find((b) => b.state() === 'active') || null;
		let next = null;
		if (curr !== null) {
			next = buttons[(buttons.indexOf(curr) + 1) % buttons.length] || null;
		} else {
			next = buttons[0];
		}

		if (next !== null) {
			next.emit('click');
		}

	}

};

const wait_for = function(window, property, callback) {

	let value = window[property];
	if (value !== undefined) {

		let interval = null;
		let prev     = null;

		interval = setInterval(() => {

			let curr = window[property];
			if (curr === prev) {

				if (interval !== null) {
					clearInterval(interval);
					interval = null;
				}

				callback(curr);

			} else {
				prev = curr;
			}

		}, 200);

	} else {
		callback(null);
	}


};



export const dispatch = function(window, browser) {

	let escapes = 0;
	let widgets = window.WIDGETS || null;
	if (widgets !== null) {

		if (Object.keys(WIDGETS).length === 0) {

			for (let id in widgets) {
				WIDGETS[id] = widgets[id];
			}

		}

	}


	window.document.onclick = (e) => {

		uncontext(window, browser, true);


		let element = e.target;
		let type    = element.tagName.toLowerCase();
		if (type === 'a') {

			let url = element.getAttribute('href');
			if (url.startsWith('#')) {

				let target = window.document.querySelector(url) || null;
				if (target !== null) {

					target.scrollIntoView({
						behavior: 'smooth',
						block:    'center'
					});

					wait_for(window, 'scrollY', () => {

						let child = target.querySelector('a, button, input, textarea, *[tabindex]') || null;
						if (child !== null) {
							child.focus();
						}

					});

				}

			} else {

				if (url.includes('#')) {
					url = url.split('#').shift();
				}

				browser.navigate(url);

			}


			e.preventDefault();
			e.stopPropagation();

		}

	};

	window.document.oncontextmenu = (e) => {

		let element = Element.from(e.target, null, false);
		if (element !== null) {
			oncontext(window, browser, element);
		}

		e.preventDefault();
		e.stopPropagation();

	};

	window.onkeydown = (e) => {

		let ctrl = e.ctrlKey === true;
		let key  = e.key.toLowerCase();


		// Show Help on three (tries to) Escape in a row
		if (key === 'escape') {

			let focus = window.document.activeElement || null;
			if (focus === null || focus === window.document.body) {
				escapes++;
			} else {
				escapes = 0;
			}

			if (escapes >= 3) {

				let help = WIDGETS.help || null;
				if (help !== null) {
					help.emit('show');
					escapes = 0;
				}

			}

		} else {

			let help = WIDGETS.help || null;
			if (help !== null) {
				help.emit('hide');
			}

			escapes = 0;

		}


		if (key === 'escape') {

			uncontext(window, browser, false);
			unfocus(window, browser, true);

			let beacon = WIDGETS.beacon || null;
			if (beacon !== null) {
				beacon.emit('hide');
			}

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

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			let history = WIDGETS.history || null;
			if (history !== null && history.back.state() !== 'disabled') {
				history.back.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f2') {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			let history = WIDGETS.history || null;
			if (history !== null && history.next.state() !== 'disabled') {
				history.next.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f3' || (ctrl === true && key === 'r')) {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			let history = WIDGETS.history || null;
			if (history !== null && history.action.state() !== 'disabled') {
				history.action.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f4' || (ctrl === true && key === 't')) {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			let history = WIDGETS.history || null;
			if (history !== null && history.open.state() !== 'disabled') {
				history.open.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f5' || (ctrl === true && key === 'e')) {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			let address = WIDGETS.address || null;
			if (address !== null) {
				address.input.emit('focus');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f6' || (ctrl === true && key === 'w')) {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			if (browser.tabs.length > 1) {
				browser.kill(browser.tab);
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f7' || (ctrl === true && key === 'pageup')) {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

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

			uncontext(window, browser, false);
			unfocus(window, browser, false);

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

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			let mode = WIDGETS.mode || null;
			if (mode !== null) {
				rotate_through_modes(browser, WIDGETS.mode.buttons);
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f10') {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			// Reserved for future use

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f11' || (ctrl === true && key === 'backspace')) {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			let settings = WIDGETS.settings || null;
			if (settings !== null) {

				rotate_through_sidebars(browser, [
					WIDGETS.settings.beacon || null,
					WIDGETS.settings.site   || null,
					WIDGETS.settings.peer   || null
				].filter((b) => b !== null));

			}

			e.preventDefault();
			e.stopPropagation();

		} else if (key === 'f12') {

			uncontext(window, browser, false);
			unfocus(window, browser, false);

			let settings = WIDGETS.settings || null;
			if (settings !== null && settings.browser.state() !== 'disabled') {
				settings.browser.emit('click');
			}

			e.preventDefault();
			e.stopPropagation();

		} else if (ctrl === true && key === ' ') {

			let context = WIDGETS.context || null;
			if (context !== null && context.element.state() === 'active') {

				uncontext(window, browser, false);

			} else {

				let element = Element.from(window.document.activeElement || null, null, false);
				if (element !== null) {
					oncontext(window, browser, element);
				}

			}

			e.preventDefault();
			e.stopPropagation();

		} else if (
			(ctrl === true && key === 'enter')
		) {

			// Disallow Default Behaviour

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

			// Allow Default Behaviour

		} else if (ctrl === true) {

			// Allow Default Behaviour

		}

	};

	window.document.onscroll = () => {
		uncontext(window, browser, false);
	};

};

