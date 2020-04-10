
const global = (typeof window !== 'undefined' ? window : this);
const doc    = global.document;
const header = doc.querySelector('header');
const main   = doc.querySelector('main');
const footer = doc.querySelector('footer');

import { console  } from '../source/console.mjs';
import { hostname } from '../source/ENVIRONMENT.mjs';
import { dispatch } from './control.mjs';
import { Address  } from './header/Address.mjs';
import { Beacon   } from './footer/Beacon.mjs';
import { Browser  } from '../source/Browser.mjs';
import { Context  } from './footer/Context.mjs';
import { Help     } from './footer/Help.mjs';
import { History  } from './header/History.mjs';
import { Mode     } from './header/Mode.mjs';
import { Session  } from './footer/Session.mjs';
import { Settings } from './header/Settings.mjs';
import { Site     } from './footer/Site.mjs';
import { Tabs     } from './footer/Tabs.mjs';
import { Webview  } from './main/Webview.mjs';



const BROWSER = global.BROWSER = new Browser({
	host: hostname
});

const WIDGETS = global.WIDGETS = {};


WIDGETS.address  = new Address(BROWSER, WIDGETS);
WIDGETS.beacon   = new Beacon(BROWSER, WIDGETS);
WIDGETS.context  = new Context(BROWSER, WIDGETS);
WIDGETS.help     = new Help(BROWSER, WIDGETS);
WIDGETS.history  = new History(BROWSER, WIDGETS);
WIDGETS.mode     = new Mode(BROWSER, WIDGETS);
WIDGETS.session  = new Session(BROWSER, WIDGETS);
WIDGETS.settings = new Settings(BROWSER, WIDGETS);
WIDGETS.site     = new Site(BROWSER, WIDGETS);
WIDGETS.tabs     = new Tabs(BROWSER, WIDGETS);
WIDGETS.webview  = new Webview(BROWSER, WIDGETS);


WIDGETS.history.render(header);
WIDGETS.address.render(header);
WIDGETS.mode.render(header);
WIDGETS.settings.render(header);

WIDGETS.webview.render(main);

WIDGETS.tabs.render(footer);
WIDGETS.beacon.render(footer);
WIDGETS.site.render(footer);
WIDGETS.session.render(footer);
WIDGETS.context.render(footer);
WIDGETS.help.render(footer);


setTimeout(() => {

	dispatch(window, BROWSER);

	BROWSER.once('connect', () => {

		console.info('Browser: Design connected to ws://' + hostname + ':65432.');

		[
			// 'stealth:settings'
			// 'stealth:fix-host?url=' + encodeURIComponent('https://cookie.engineer/index.html'),
			// 'stealth:fix-mode?url=' + encodeURIComponent('https://cookie.engineer/index.html'),
			// 'stealth:fix-filter?url=' + encodeURIComponent('https://cookie.engineer/index.html'),
			// 'stealth:fix-request?url=' + encodeURIComponent('https://cookie.engineer/index.html') + '&cause=socket-stability&code=403'
			'https://cookie.engineer/index.html'
		].map((url) => {
			return BROWSER.open(url);
		}).slice(-1).forEach((tab) => {
			BROWSER.show(tab);
		});

	});

	BROWSER.once('disconnect', () => {
		console.error('Browser: Design disconnected from ws://' + hostname + ':65432.');
	});

	BROWSER.connect();

	if (typeof global.onbeforeunload !== 'undefined') {

		global.onbeforeunload = () => {
			BROWSER.disconnect();
		};

	}

}, 500);


setTimeout(() => {

	// Generate Tab Index for WIDGETS.tabs

	let tabindex = 1;

	[
		WIDGETS.history.back,
		WIDGETS.history.next,
		WIDGETS.history.action,
		WIDGETS.history.open,
		WIDGETS.address.input,
		...WIDGETS.mode.buttons,
		WIDGETS.settings.beacon,
		WIDGETS.settings.session,
		WIDGETS.settings.site,
		WIDGETS.settings.browser
	].filter((v) => v !== null).forEach((element) => {
		element.attr('tabindex', tabindex++);
	});

	WIDGETS.tabs.tabindex = tabindex;

}, 500);

