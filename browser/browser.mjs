
import { Browser } from './source/Browser.mjs';

const [ _HOST, _PORT ] = (function(location) {

	let host = 'localhost';
	let port = 65432;

	let tmp = location.host || null;
	if (tmp !== null) {

		if (tmp.includes(':')) {

			let tmp1 = tmp.split(':')[0];
			if (tmp1 !== 'localhost') {
				host = tmp1;
			}

			let tmp2 = parseInt(tmp.split(':')[1], 10);
			if (Number.isNaN(tmp2) === false) {
				port = tmp2;
			}

		} else if (tmp !== 'localhost') {
			host = tmp;
		}

	}

	return [ host, port ];

})(window.location || {});


let browser = window.browser = new Browser();

if (BROWSER_BINDINGS.length > 0) {
	BROWSER_BINDINGS.forEach(callback => callback(browser));
	BROWSER_BINDINGS.splice(0);
}



setTimeout(_ => {

	let browser = window.browser || null;
	if (browser !== null) {

		browser.connect(_HOST, _PORT);


		let tabs = [];

		tabs.push(browser.create('https://cookie.engineer'));
		tabs.push(browser.create('https://old.reddit.com/r/programming'));
		tabs.push(browser.create('https://www.reddit.com/r/programming'));
		tabs.push(browser.create('stealth:settings'));

		browser.show(tabs[tabs.length - 1]);

	} else {
		console.error('Browser not ready :(');
	}

}, 1000);

