
import { Browser } from './source/Browser.mjs';

const [ HOST ] = (function(location) {

	let host = 'localhost';

	let tmp = location.host || '';
	if (tmp.includes(':')) {

		let tmp1 = tmp.split(':')[0];
		if (tmp1 !== 'localhost') {
			host = tmp1;
		}

	} else if (tmp !== '') {
		host = tmp;
	}

	return [ host ];

})(window.location || {});


let browser = window.browser = new Browser();
let delayed = window.DELAYED || [];

if (delayed.length > 0) {
	delayed.forEach((callback) => callback(browser));
	delayed.splice(0);
}

if (browser !== null) {

	setTimeout(() => {

		browser.connect(HOST, () => {

			let tabs = [];

			tabs.push(browser.open('stealth:settings'));
			// tabs.push(browser.open('https://cookie.engineer'));
			// tabs.push(browser.open('https://old.reddit.com/r/programming/'));

			browser.show(tabs[tabs.length - 1]);

		});

		window.onbeforeunload = () => {
			browser.disconnect();
		};

	}, 500);

}

(function(navigator) {

	if ('serviceWorker' in navigator) {

		navigator.serviceWorker.register('service.js').then((service) => {
			console.info('Service Worker connected.', service.scope);
		}).catch(() => {});

	}

})(window.navigator || {});

