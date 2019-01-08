
(function(global) {

	const doc  = global.document;
	const site = {
		modes:    doc.querySelector('aside#site-modes'),
		requests: doc.querySelector('aside#site-requests')
	};

	const buttons = {
		modes:    Array.from(doc.querySelectorAll('#header-modes button')),
		settings: {
			browser:  doc.querySelector('#header-settings-browser'),
			modes:    doc.querySelector('#header-settings-modes'),
			requests: doc.querySelector('#header-settings-requests')
		}
	};



	/*
	 * MODES
	 */

	if (buttons.modes.length > 0) {

		buttons.modes.forEach(button => {

			button.onclick = _ => {

				buttons.modes.forEach(b => (b.className = ''));
				button.className = 'active';

				let tmp = button.getAttribute('title');
				if (tmp !== null) {
					browser.setMode(tmp);
				}

			};

		});

	}



	/*
	 * SETTINGS
	 */


	if (buttons.settings.browser !== null) {

		buttons.settings.browser.onclick = _ => {

			let tab = browser.create('about:settings');
			if (tab !== null) {
				tab.onload = _ => browser.show(tab);
				tab.load();
			}

		};

	}

	if (buttons.settings.modes !== null) {

		buttons.settings.modes.onclick = _ => {

			let visible = site.modes.className === 'active';

			Object.values(buttons.settings).forEach(b => (b.className = ''));
			Object.values(site).forEach(s => (s.className = ''));

			if (visible === false) {
				buttons.settings.modes.className = 'active';
				site.modes.className = 'active';
			}

		};

	}

	if (buttons.settings.requests !== null) {

		buttons.settings.requests.onclick = _ => {

			let visible = site.requests.className === 'active';

			Object.values(buttons.settings).forEach(b => (b.className = ''));
			Object.values(site).forEach(s => (s.className = ''));

			if (visible === false) {
				buttons.settings.requests.className = 'active';
				site.requests.className = 'active';
			}

		};

	}

})(typeof window !== 'undefined' ? window : this);

