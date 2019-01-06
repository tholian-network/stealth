
(function(global) {

	const doc  = global.document;
	const navi = doc.querySelector('aside#navi');



	const _create_button = function(url) {

		let domain  = url.split('/').slice(0, 2).join('/');
		let button  = doc.createElement('button');

		browser.peer.load(domain + '/favicon.ico', data => {

			let buffer = data.buffer || null;
			if (buffer !== null && buffer.type === 'image/x-icon') {
				button.style.backgroundImage = 'url("' + buffer.serialize() + ')';
			}

		});

		button.setAttribute('data-url', url);

		return button;

	};

	const _init = function(browser) {

		navi.className = browser.tabs.length > 1 ? 'active' : '';

		browser.on('change-tab', (tab, tabs) => {

			navi.className = tabs.length > 1 ? 'active' : '';


			let buttons = Array.from(navi.querySelectorAll('button'));
			if (buttons.length > 0) {
				buttons.forEach(button => {

					let url = button.getAttribute('data-url');
					let tab = tabs.find(t => t.url === url) || null;
					if (tab === null) {
						button.parentNode.removeChild(button);
					}

				});
			}


			if (tabs.length > 0) {

				tabs.forEach(tab => {

					let url    = tab.url;
					let button = buttons.find(b => b.getAttribute('data-url') === url) || null;
					if (button === null) {
						button = _create_button(url);
						navi.appendChild(button);
					}

				});

			}


			if (tab !== null) {

				let button = buttons.find(b => b.getAttribute('data-url') === tab.url) || null;
				if (button !== null) {
					buttons.forEach(b => (b.className = ''));
					button.className = 'active';
				}

			}

		});

	};



	if (navi !== null) {

		let browser = global.browser || null;
		if (browser !== null) {
			_init(browser);
		} else {
			BROWSER_BINDINGS.push(_init);
		}

	}

})(typeof window !== 'undefined' ? window : this);

