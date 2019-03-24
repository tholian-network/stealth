
import { Browser } from './source/Browser.mjs';

const [ _HOST, _PORT ] = (function(location) {

	let host = 'localhost';
	let port = 65432;

	let tmp = location.host || '';
	if (tmp.includes(':')) {

		let tmp1 = tmp.split(':')[0];
		if (tmp1 !== 'localhost') {
			host = tmp1;
		}

		let tmp2 = parseInt(tmp.split(':')[1], 10);
		if (Number.isNaN(tmp2) === false) {
			port = tmp2;
		}

	} else if (tmp !== '') {
		host = tmp;
	}

	return [ host, port ];

})(window.location || {});


let browser = window.browser = new Browser();

if (BROWSER_BINDINGS.length > 0) {
	BROWSER_BINDINGS.forEach((callback) => callback(browser));
	BROWSER_BINDINGS.splice(0);
}



setTimeout(() => {

	let browser = window.browser || null;
	if (browser !== null) {

		browser.connect(_HOST, _PORT, () => {

			let tabs = [];

			tabs.push(browser.open('stealth:settings'));
			tabs.push(browser.open('https://cookie.engineer'));
			// tabs.push(browser.open('https://letsencrypt.org'));

			browser.show(tabs[tabs.length - 1]);

		});

		window.onbeforeunload = () => browser.disconnect();

	}

}, 1000);


(function(navigator) {

	if ('serviceWorker' in navigator) {

		navigator.serviceWorker.register('service.js').then((service) => {
			console.info('Service Worker connected.', service.scope);
		}).catch(() => {});

	}

})(window.navigator || {});

