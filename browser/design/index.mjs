
import { Element     } from './Element.mjs';
import { Widget      } from './Widget.mjs';
import { isBrowser   } from '../source/Browser.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';

import { Address     } from './appbar/Address.mjs';
import { History     } from './appbar/History.mjs';
import { Mode        } from './appbar/Mode.mjs';
import { Settings    } from './appbar/Settings.mjs';
import { Splitter    } from './appbar/Splitter.mjs';

import { Console     } from './backdrop/Console.mjs';
import { Help        } from './backdrop/Help.mjs';
import { Tabs        } from './backdrop/Tabs.mjs';
import { Webview     } from './backdrop/Webview.mjs';

// TODO: Port Session and Site Sidebars to browser-dialog[data-key=""]
// import { Session     } from './dialog/Session.mjs';
// import { Site        } from './dialog/Site.mjs';

import { Context     } from './menu/Context.mjs';



const on_resize = function() {

	let width  = this.innerWidth  || null;
	let height = this.innerHeight || null;

	if (width !== null && height !== null) {

		let splitter = Widget.query('browser-splitter');
		let tabs     = Widget.query('browser-tabs');

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
			header: Element.query('header'),
			main:   Element.query('main'),
			footer: Element.query('footer')
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
				console: ENVIRONMENT.flags.debug === true ? new Console(browser) : null,
				help:    new Help(browser),
				tabs:    new Tabs(browser),
				webview: new Webview(browser)
			},
			menu: {
				context: new Context(browser)
			}
		};

		widgets.appbar['history'].render(elements.header);
		widgets.appbar['address'].render(elements.header);
		widgets.appbar['mode'].render(elements.header);
		widgets.appbar['settings'].render(elements.header);
		widgets.appbar['splitter'].render(elements.header);

		widgets.backdrop['webview'].render(elements.main);
		widgets.backdrop['tabs'].render(elements.main);
		widgets.backdrop['help'].render(elements.main);

		if (widgets.backdrop['console'] !== null) {
			widgets.backdrop['console'].render(Element.query('body'));
		}

		widgets.menu['context'].render(elements.footer);


		browser.on('theme', (theme) => {

			let body = Element.query('body');
			if (body !== null) {
				body.attr('data-theme', theme);
			}

		});


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

