
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

