
(function(global) {

	const doc     = global.document;
	const buttons = {
		modes:    Array.from(doc.querySelectorAll('#header-modes button')),
		settings: {
			browser:  doc.querySelector('#header-settings-browser'),
			modes:    doc.querySelector('#header-settings-modes'),
			requests: doc.querySelector('#header-settings-requests')
		}
	};
	const inputs  = {
		address: doc.querySelector('#header-address input')
	};
	const outputs = {
		address:  doc.querySelector('#header-address ul'),
		protocol: doc.querySelector('#header-address-protocol')
	};
	const site    = {
		modes:    doc.querySelector('aside#site-modes'),
		requests: doc.querySelector('aside#site-requests')
	};



	const _update_address = function(tab) {

		if (tab !== null) {

			if (inputs.address !== null) {
				inputs.address.className = '';
				inputs.address.value     = tab.url;
			}

			if (outputs.protocol !== null) {

				let type  = 'unknown';
				let title = 'Unknown URL Scheme';

				if (tab.url.startsWith('https://')) {
					type  = 'secure';
					title = 'Secure via HTTPS';
				} else if (tab.url.startsWith('http://')) {
					type  = 'insecure';
					title = 'Insecure via HTTP';
				} else if (tab.url.startsWith('about:')) {
					type  = 'secure';
					title = 'Secure';
				}

				outputs.protocol.className = type;
				outputs.protocol.title     = title;

			}

			if (outputs.address !== null) {

				let cache  = Array.from(outputs.address.querySelectorAll('li')).slice(1);
				let chunks = [];


				if (tab.url.startsWith('https://') || tab.url.startsWith('http://')) {
					chunks = tab.url.split('/').slice(2);
				} else if (tab.url.startsWith('about:')) {
					chunks = tab.url.split('/');
				} else if (tab.url.includes('://')) {
					chunks = tab.url.substr(tab.url.indexOf('://') + 3).split('/');
				} else {
					chunks = tab.url.split('/');
				}


				chunks.forEach((chunk, c) => {

					let element = cache[c] || null;
					if (element === null) {
						element = doc.createElement('li');
						outputs.address.appendChild(element);
					}

					element.innerHTML = c === 0 ? chunk : ('/' + chunk);

				});

				if (chunks.length < cache.length) {

					cache.slice(chunks.length).forEach(element => {
						element.parentNode.removeChild(element);
					});

				}

			}

		} else {

			if (inputs.address !== null) {
				inputs.address.className = 'active';
				inputs.address.value = '';
			}

			if (outputs.protocol !== null) {
				outputs.protocol.className = 'insecure';
				outputs.protocol.title     = 'Insecure via HTTP';
			}

			if (outputs.address !== null) {
				outputs.address.className = '';

				// TODO: Set innerHTML of children instead
				outputs.address.innerHTML = '';
			}

		}

	};

	const _init = function(browser) {

		browser.on('show', (tab, tabs) => {

			console.log(tab);

			if (tab !== null) {
				_update_address(tab);
			} else {
				_update_address(null);
			}

		});


		if (inputs.address !== null && outputs.address !== null) {

			outputs.address.onclick = e => {

				inputs.address.className = 'active';


				let target = e.target;
				if (target.tagName.toLowerCase() === 'li') {

					let url      = inputs.address.value;
					let protocol = '';
					if (url.startsWith('https://')) {
						protocol = 'https://';
					} else if (url.startsWith('http://')) {
						protocol = 'http://';
					} else if (url.includes('://')) {
						protocol = url.substr(0, url.indexOf('://') + 3);
					}

					let chunks = Array.from(outputs.address.querySelectorAll('li')).slice(1);
					let chunk  = chunks.find(ch => ch === target);
					let c      = chunks.indexOf(chunk);
					let before = protocol + chunks.slice(0, c).map(ch => ch.innerHTML).join('');
					let offset = url.indexOf(before) + before.length;
					let select = chunk.innerHTML;

					inputs.address.setSelectionRange(offset, offset + select.length);
					inputs.address.focus();

				}

			};

			inputs.address.onkeyup = e => {

				let key = e.key.toLowerCase();
				if (key === 'enter') {
					inputs.address.blur();
				}

			};

			inputs.address.onblur = e => {

				inputs.address.className = '';


				let url = inputs.address.value.trim();
				if (
					url.startsWith('https://') === false
					&& url.startsWith('http://') === false
					&& url.startsWith('about:') === false
					&& url.includes('://') === false
				) {
					inputs.address.value = 'https://' + url;
					url = 'https://' + url;
				}

				let tab = browser.create(url);
				if (tab !== null) {
					browser.show(tab);
					tab.load();
				}

			};

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



	/*
	 * INIT
	 */

	let browser = global.browser || null;
	if (browser !== null) {
		_init(browser);
	} else {
		BROWSER_BINDINGS.push(_init);
	}

})(typeof window !== 'undefined' ? window : this);

