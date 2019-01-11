
setTimeout(_ => {

	const win = window;
	const doc = window.document;

	let require = win.require || null;
	if (require !== null) {
		require('nw.gui').Window.get().showDevTools();
	}

	let webview = doc.querySelector('webview#main-frame');
	if (webview !== null) {
		webview.showDevTools(true);
	}


	let browser = window.browser || null;
	if (browser !== null) {
		console.info('Browser ready :)');

		let tab1 = browser.create('https://cookie.engineer');
		let tab2 = browser.create('https://old.reddit.com/r/programming');
		let tab3 = browser.create('https://google.com');
		let tab4 = browser.create('about:settings');

		tab1.onload = _ => console.log('tab1.onload', tab1);
		tab2.onload = _ => console.log('tab2.onload', tab2);
		tab3.onload = _ => console.log('tab3.onload', tab3);
		tab4.onload = _ => console.log('tab4.onload', tab4);

		browser.show(tab4);

		tab1.load();
		tab2.load();
		tab3.load();
		tab4.load();

	} else {
		console.error('Browser not ready :(');
	}

}, 1000);

