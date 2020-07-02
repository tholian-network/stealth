
import { Element   } from './Element.mjs';
import { isBrowser } from '../source/Browser.mjs';
import { Address   } from './header/Address.mjs';
import { Context   } from './footer/Context.mjs';
import { Help      } from './footer/Help.mjs';
import { History   } from './header/History.mjs';
import { Mode      } from './header/Mode.mjs';
import { Session   } from './footer/Session.mjs';
import { Settings  } from './header/Settings.mjs';
import { Site      } from './footer/Site.mjs';
import { Splitter  } from './header/Splitter.mjs';
import { Tabs      } from './footer/Tabs.mjs';
import { Webview   } from './main/Webview.mjs';



const on_resize = function() {

	let splitter = WIDGETS.splitter || null;
	if (splitter !== null) {
		splitter.state(this.innerWidth < 640 ? 'active' : '');
	}

};



export * from './Element.mjs';

export const WIDGETS = window.WIDGETS = {};

export const dispatch = (window, browser) => {

	browser = isBrowser(browser) ? browser : null;


	if (browser !== null) {

		browser.on('theme', (theme) => {

			let body = window.document.querySelector('body');
			if (body !== null) {
				body.setAttribute('data-theme', theme);
			}

		});

		Object.keys(WIDGETS).forEach((key) => {

			let widget = WIDGETS[key] || null;
			if (widget !== null) {
				widget.erase();
			}

			WIDGETS[key] = null;

		});

		WIDGETS.address   = new Address(browser, WIDGETS);
		WIDGETS.context   = new Context(browser, WIDGETS);
		WIDGETS.help      = new Help(browser, WIDGETS);
		WIDGETS.history   = new History(browser, WIDGETS);
		WIDGETS.mode      = new Mode(browser, WIDGETS);
		WIDGETS.session   = new Session(browser, WIDGETS);
		WIDGETS.settings  = new Settings(browser, WIDGETS);
		WIDGETS.site      = new Site(browser, WIDGETS);
		WIDGETS.splitter  = new Splitter(browser, WIDGETS);
		WIDGETS.tabs      = new Tabs(browser, WIDGETS);
		WIDGETS.webview   = new Webview(browser, WIDGETS);

		let header = Element.from(window.document.querySelector('header'));
		if (header !== null) {

			WIDGETS.history.render(header);
			WIDGETS.address.render(header);
			WIDGETS.mode.render(header);
			WIDGETS.settings.render(header);
			WIDGETS.splitter.render(header);

		}

		let main = Element.from(window.document.querySelector('main'));
		if (main !== null) {

			WIDGETS.webview.render(main);

		}

		let footer = Element.from(window.document.querySelector('footer'));
		if (footer !== null) {

			WIDGETS.tabs.render(footer);
			WIDGETS.site.render(footer);
			WIDGETS.session.render(footer);
			WIDGETS.context.render(footer);
			WIDGETS.help.render(footer);

		}


		setTimeout(() => {

			let tabindex = 1;

			[
				WIDGETS.history.back,
				WIDGETS.history.next,
				WIDGETS.history.action,
				WIDGETS.history.open,
				WIDGETS.address.input,
				...WIDGETS.mode.buttons,
				WIDGETS.settings.session,
				WIDGETS.settings.site,
				WIDGETS.settings.browser
			].filter((v) => v !== null).forEach((element) => {
				element.attr('tabindex', tabindex++);
			});

			WIDGETS.tabs.tabindex = tabindex;

		}, 100);

		window.addEventListener('resize', () => on_resize.call(window));
		setTimeout(() => on_resize.call(window), 200);

	}

};

