
import { Element     } from './Element.mjs';
import { Widget      } from './Widget.mjs';
import { isBrowser   } from '../source/Browser.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';

import { Address     } from './appbar/Address.mjs';
import { History     } from './appbar/History.mjs';
import { Mode        } from './appbar/Mode.mjs';
import { Settings    } from './appbar/Settings.mjs';
import { Splitter    } from './appbar/Splitter.mjs';

import { Help        } from './backdrop/Help.mjs';
import { Tabs        } from './backdrop/Tabs.mjs';
import { Webview     } from './backdrop/Webview.mjs';

import { Console     } from './sheet/Console.mjs';
import { Session     } from './sheet/Session.mjs';
import { Site        } from './sheet/Site.mjs';

import { Context     } from './menu/Context.mjs';



const on_resize = function() {

	let width  = this.innerWidth  || null;
	let height = this.innerHeight || null;

	if (width !== null && height !== null) {

		let splitter = Widget.query('browser-appbar-splitter');
		let tabs     = Widget.query('browser-backdrop-tabs');

		if (splitter !== null && tabs !== null) {
			splitter.emit('resize', [ width, height ]);
			tabs.emit('resize', [ width, height ]);
		}

	}

};



export const dispatch = (window, browser) => {

	browser = isBrowser(browser) ? browser : null;


	if (browser !== null) {

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
				help:    new Help(browser),
				tabs:    new Tabs(browser),
				webview: new Webview(browser)
			},
			menu: {
				context: new Context(browser)
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

		// TODO: Maybe Help should be a sheet?
		widgets.backdrop['help'].render(elements.backdrop);

		widgets.sheet['session'].render(elements.sheet);
		widgets.sheet['site'].render(elements.sheet);

		if (widgets.sheet['console'] !== null) {
			widgets.sheet['console'].render(elements.sheet);
		}

		widgets.menu['context'].render(elements.menu);


		let body = Element.query('body');
		if (body !== null) {

			elements.appbar.render(body);
			elements.backdrop.render(body);
			elements.sheet.render(body);
			elements.menu.render(body);

			browser.on('theme', (theme) => {
				body.attr('data-theme', theme);
			});

		}


		setTimeout(() => {

			let tabindex = 1;

			[
				widgets.appbar['history'].buttons.back,
				widgets.appbar['history'].buttons.next,
				widgets.appbar['history'].buttons.action,
				widgets.appbar['history'].buttons.open,
				widgets.appbar['address'].input,
				...widgets.appbar['mode'].buttons,
				widgets.appbar['settings'].buttons.site,
				widgets.appbar['settings'].buttons.session,
				widgets.appbar['settings'].buttons.browser
			].filter((v) => v !== null).forEach((element) => {
				element.attr('tabindex', tabindex++);
			});

			widgets.backdrop['tabs'].tabindex = tabindex;

		}, 100);

		window.addEventListener('resize', () => on_resize.call(window));
		setTimeout(() => on_resize.call(window), 200);


		if (ENVIRONMENT.flags.debug === true) {

			window.ELEMENTS = elements;
			window.WIDGETS  = widgets;

			window.Element  = Element;
			window.Widget   = Widget;

		}

	}

};

