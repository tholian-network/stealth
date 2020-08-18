
import { Element             } from './Element.mjs';
import { Widget              } from './Widget.mjs';
import { isBoolean, isNumber } from '../extern/base.mjs';
import { isBrowser           } from '../source/Browser.mjs';
import { ENVIRONMENT         } from '../source/ENVIRONMENT.mjs';
import { URL                 } from '../source/parser/URL.mjs';

import { Address             } from './appbar/Address.mjs';
import { History             } from './appbar/History.mjs';
import { Mode                } from './appbar/Mode.mjs';
import { Settings            } from './appbar/Settings.mjs';
import { Splitter            } from './appbar/Splitter.mjs';

import { Tabs                } from './backdrop/Tabs.mjs';
import { Webview             } from './backdrop/Webview.mjs';

import { Console             } from './sheet/Console.mjs';
import { Session             } from './sheet/Session.mjs';
import { Site                } from './sheet/Site.mjs';

import { Context             } from './menu/Context.mjs';
import { Help                } from './menu/Help.mjs';



const on_context = function(browser, element) {

	let context = Widget.query('browser-menu-context');
	let type    = element.type || null;

	if (context !== null) {

		let actions = [];
		let url     = null;

		if (type === 'a') {
			url = URL.resolve(browser.tab.url, element.attr('href'));
		} else if (type === 'img') {
			url = URL.resolve(browser.tab.url, element.attr('src'));
		} else if (type === 'audio' || type === 'video') {
			url = URL.resolve(browser.tab.url, element.attr('src'));
		}

		if (URL.isURL(url) === true) {

			let tab = browser.tab || null;
			if (
				tab !== null
				&& url.protocol === tab.url.protocol
				&& URL.toDomain(url) === URL.toDomain(tab.url)
				&& URL.toHost(url) === URL.toHost(tab.url)
				&& url.port === tab.url.port
				&& url.path === tab.url.path
			) {

				if (url.hash !== null) {

					actions.push({
						label: 'focus',
						value: '#' + url.hash
					});

				} else {

					actions.push({
						label: 'refresh'
					});

				}

			}

			actions.push({
				label: 'open',
				value: url.link
			});

			actions.push({
				label: 'copy',
				value: url.link
			});

			actions.push({
				label: 'download',
				value: url.link
			});

		}


		if (actions.length > 0) {

			let area     = element.area();
			let offset_x = 0;
			let offset_y = 0;


			let appbar = Element.query('browser-appbar');
			if (appbar !== null) {
				offset_y += appbar.area().h;
			}

			let tabs = Widget.query('browser-backdrop-tabs');
			if (tabs !== null && tabs.state() === 'active') {
				offset_x += tabs.area().w;
			}


			context.value(actions);
			context.area({
				x: area.x + offset_x,
				y: area.y + offset_y
			});

			context.emit('show');

		}

	}

};

const on_key = function(browser, key) {

	let handled = false;

	let help = Widget.query('browser-menu-help');
	if (help !== null && handled === false) {

		if (help.state() === 'active') {
			help.emit('key', [ key ]);
			handled = true;
		} else if (key.name === 'escape') {
			help.emit('key', [ key ]);
		}

	}

	let context = Widget.query('browser-menu-context');
	if (context !== null && handled === false) {

		if (context.state() === 'active') {
			context.emit('key', [ key ]);
			handled = true;
		}

	}

	if (handled === false) {

		if (key.name === 'escape') {

			let focus = this['document'].activeElement || null;
			if (focus !== null) {
				focus.blur();
			}

			if (this === this.parent) {
				this['document'].body.setAttribute('tabindex', 0);
				this['document'].body.focus();
				this['document'].body.setAttribute('tabindex', -1);
			}

		}

	}

	return handled;

};

const on_resize = function(/* browser */) {

	let width  = isNumber(this.innerWidth)  ? this.innerWidth  : null;
	let height = isNumber(this.innerHeight) ? this.innerHeight : null;

	if (width !== null && height !== null) {

		let splitter = Widget.query('browser-appbar-splitter');
		let tabs     = Widget.query('browser-backdrop-tabs');

		if (splitter !== null && tabs !== null) {
			splitter.emit('resize', [ width, height ]);
			tabs.emit('resize', [ width, height ]);
		}

	}

};



export const dispatch = (window, browser, reset) => {

	browser = isBrowser(browser) ? browser : null;
	reset   = isBoolean(reset)   ? reset   : false;


	if (browser !== null) {

		if (reset === true) {

			browser.off('change');
			browser.off('hide');
			browser.off('refresh');
			browser.off('show');
			browser.off('theme');
			browser.off('update');


			let elements = {
				appbar:   new Element('browser-appbar'),
				backdrop: new Element('browser-backdrop'),
				sheet:    new Element('browser-sheet'),
				menu:     new Element('browser-menu')
			};

			let widgets = {
				appbar: {
					address:  new Address(browser),
					history:  new History(browser),
					mode:     new Mode(browser),
					settings: new Settings(browser),
					splitter: new Splitter(browser)
				},
				backdrop: {
					tabs:    new Tabs(browser),
					webview: new Webview(browser)
				},
				menu: {
					context: new Context(browser),
					help:    new Help(browser)
				},
				sheet: {
					console: ENVIRONMENT.flags.debug === true ? new Console(browser) : null,
					session: new Session(browser),
					site:    new Site(browser)
				}
			};

			widgets.appbar['history'].render(elements.appbar);
			widgets.appbar['address'].render(elements.appbar);
			widgets.appbar['mode'].render(elements.appbar);
			widgets.appbar['settings'].render(elements.appbar);
			widgets.appbar['splitter'].render(elements.appbar);

			widgets.backdrop['webview'].render(elements.backdrop);
			widgets.backdrop['tabs'].render(elements.backdrop);


			widgets.sheet['session'].render(elements.sheet);
			widgets.sheet['site'].render(elements.sheet);

			if (widgets.sheet['console'] !== null) {
				widgets.sheet['console'].render(elements.sheet);
			}

			widgets.menu['context'].render(elements.menu);
			widgets.menu['help'].render(elements.menu);


			let body = Element.query('body');
			if (body !== null) {

				elements.appbar.render(body);
				elements.backdrop.render(body);
				elements.sheet.render(body);
				elements.menu.render(body);

			}

			setTimeout(() => {

				let tabindex = 1;

				[
					...widgets.appbar['history'].query('button'),
					widgets.appbar['address'].query('input'),
					...widgets.appbar['mode'].query('button'),
					...widgets.appbar['settings'].query('button')
				].filter((v) => v !== null).forEach((element) => {
					element.attr('tabindex', tabindex++);
				});

				widgets.backdrop['tabs'].tabindex = tabindex;

			}, 100);


			if (ENVIRONMENT.flags.debug === true) {

				window.ELEMENTS = elements;
				window.WIDGETS  = widgets;

				window.Element  = Element;
				window.Widget   = Widget;

			}

			setTimeout(() => {
				on_resize.call(window);
			}, 200);

		}


		let body = Element.query('body');
		if (body !== null) {

			browser.on('theme', (theme) => {
				body.attr('data-theme', theme);
			});

		}

		let onclick = window.document['onclick'] || null;
		if (onclick === null) {
			onclick = window.document['onclick'] = (e) => {

				let context = Widget.query('browser-menu-context');
				if (context !== null) {
					context.emit('hide');
				}

				if (e.button === 0) {

					let element = Element.toElement(e.target);
					if (element.type === 'a') {

						let value = element.attr('href');
						if (value.startsWith('#')) {

							context.value([{
								label: 'focus',
								value: value
							}]);

							context.emit('click', [{ target: context.buttons[0].node }]);

						} else {

							browser.navigate(value);

						}

						e.preventDefault();
						e.stopPropagation();

					}

				}

			};
		}

		let oncontext = window['oncontextmenu'] || null;
		if (oncontext === null) {
			oncontext = window['oncontextmenu'] = (e) => {

				if (browser !== null && browser.tab !== null) {

					let element = Element.toElement(e.target);
					if (element !== null) {
						on_context.call(window, browser, element);
					}

				}

				e.preventDefault();
				e.stopPropagation();

			};
		}

		let onkeydown = window['onkeydown'] || null;
		if (onkeydown === null) {
			onkeydown = window['onkeydown'] = (e) => {

				let key = {
					mods: [],
					name: e.key.toLowerCase()
				};

				if (e.ctrlKey === true) {
					key.mods.push('ctrl');
				}

				if (e.shiftKey === true) {
					key.mods.push('shift');
				}

				let handled = on_key.call(window, browser, key);
				if (handled === true) {

					e.preventDefault();
					e.stopPropagation();

				}

			};
		}

		let onresize = window['onresize'] || null;
		if (onresize === null) {
			onresize = window['onresize'] = () => {
				on_resize.call(window, browser);
			};
		}

		let onscroll = window['onscroll'] || null;
		if (onscroll === null) {
			onscroll = window['onscroll'] = () => {

				let context = Widget.query('browser-menu-context');
				if (context !== null) {

					if (context.state() === 'active') {
						context.emit('hide');
					}

				}

			};
		}

	}

};

