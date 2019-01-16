
import { Browser } from './source/Browser.mjs';

const SETTINGS = (function(location) {

	let settings = {};
	let host     = null;
	let port     = null;

	let tmp = location.host || null;
	if (tmp !== null) {

		if (tmp.includes(':')) {
			host = tmp.split(':')[0];
			port = parseInt(tmp.split(':')[1], 10);
		}

	}

	if (host !== null)                 settings.host = host;
	if (port !== null && !isNaN(port)) settings.port = port;

	return settings;

})(window.location || {});


const browser = window.browser = new Browser(SETTINGS);

if (BROWSER_BINDINGS.length > 0) {
	BROWSER_BINDINGS.forEach(callback => callback(browser));
	BROWSER_BINDINGS.splice(0);
}


setTimeout(_ => {

	let browser = window.browser || null;
	if (browser !== null) {
		console.info('Browser ready :)');

		let tabs = [];

		tabs.push(browser.create('https://cookie.engineer'));
		tabs.push(browser.create('https://old.reddit.com/r/programming'));
		tabs.push(browser.create('https://reddit.com/r/programming'));
		tabs.push(browser.create('https://www.reddit.com/r/programming'));
		tabs.push(browser.create('stealth:settings'));
		tabs.push(browser.create('stealth:welcome'));

		browser.show(tabs[tabs.length - 1]);

	} else {
		console.error('Browser not ready :(');
	}

}, 1000);

