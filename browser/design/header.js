
(function(global) {

	const doc     = global.document;
	const buttons = {
		modes:    Array.from(doc.querySelectorAll('#header-modes button')),
		sites:    [
			doc.querySelector('#header-settings-modes'),
			doc.querySelector('#header-settings-requests')
		],
		history: {
			back: doc.querySelector('#header-history-back'),
			next: doc.querySelector('#header-history-next'),
			load: doc.querySelector('#header-history-load')
		},
		settings: doc.querySelector('#header-settings-browser')
	};
	const inputs  = {
		address: doc.querySelector('#header-address input')
	};
	const outputs = {
		address:  doc.querySelector('#header-address ul'),
		protocol: doc.querySelector('#header-address-protocol')
	};
	const sites   = [
		doc.querySelector('aside#site-modes'),
		doc.querySelector('aside#site-requests')
	];



	const _update_address = function(browser, tab) {

		if (tab !== null) {

			let ref = browser.parse(tab.url);


			if (inputs.address !== null) {
				inputs.address.className = '';
				inputs.address.value     = tab.url;
			}

			if (outputs.protocol !== null) {

				let type  = 'unknown';
				let title = 'Unknown URL Scheme';

				if (ref.protocol === 'https') {
					type  = 'secure';
					title = 'Secure via HTTPS';
				} else if (ref.protocol === 'http') {
					type  = 'insecure';
					title = 'Insecure via HTTP';
				} else if (ref.protocol === 'stealth') {
					type  = 'stealth';
					title = 'Internal Page';
				}

				outputs.protocol.className = type;
				outputs.protocol.title     = title;

			}

			if (outputs.address !== null) {

				let cache  = Array.from(outputs.address.querySelectorAll('li')).slice(1);
				let chunks = [];


				if (ref.domain !== null) {
					chunks.push(ref.domain);
				}

				if (ref.path !== null && ref.path !== '/') {
					ref.path.split('/').forEach(ch => {
						if (ch !== '') {
							chunks.push('/' + ch);
						}
					});
				}

				if (ref.query !== null) {
					chunks.push('?' + ref.query);
				}

				chunks.forEach((chunk, c) => {

					let element = cache[c] || null;
					if (element === null) {
						element = doc.createElement('li');
						outputs.address.appendChild(element);
					}

					element.innerHTML = chunk;

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

				let cache = Array.from(outputs.address.querySelectorAll('li')).slice(1);
				if (cache.length > 0) {
					cache.forEach(element => {
						element.parentNode.removeChild(element);
					});
				}

			}

		}

	};

	const _update_history = function(browser, tab) {

		if (tab !== null) {

			if (buttons.history.back !== null) {

				let check = tab.history.indexOf(tab.url) > 0;
				if (check === true) {
					buttons.history.back.removeAttribute('disabled');
				} else {
					buttons.history.back.setAttribute('disabled', 'true');
				}

			}

			if (buttons.history.next !== null) {

				let check = tab.history.indexOf(tab.url) < tab.history.length - 1;
				if (check === true) {
					buttons.history.next.removeAttribute('disabled');
				} else {
					buttons.history.next.setAttribute('disabled', 'true');
				}

			}

			if (buttons.history.load !== null) {

				buttons.history.load.removeAttribute('disabled');


				let check = tab.requests.find(r => r.loading === true) || null;
				if (check !== null) {
					buttons.history.load.className = 'pause';
				} else {
					buttons.history.load.className = 'refresh';
				}

			}

		} else {

			if (buttons.history.back !== null) {
				buttons.history.back.removeAttribute('disabled');
			}

			if (buttons.history.next !== null) {
				buttons.history.next.removeAttribute('disabled');
			}

			if (buttons.history.load !== null) {
				buttons.history.load.className = '';
				buttons.history.load.removeAttribute('disabled');
			}

		}

	};

	const _init = function(browser) {

		browser.on('show', (tab, tabs) => {

			if (tab !== null) {

				let url = tab.url;
				if (url === 'stealth:settings') {
					buttons.settings.className = 'active';
				} else {
					buttons.settings.className = '';
				}


				_update_address(browser, tab);
				_update_history(browser, tab);

			} else {

				_update_address(browser, null);
				_update_history(browser, null);

			}

		});

		browser.on('refresh', (tab, tabs) => {

			if (tab !== null) {

				let url = tab.url;
				if (url === 'stealth:settings') {
					buttons.settings.className = 'active';
				} else {
					buttons.settings.className = '';
				}


				_update_address(browser, tab);
				_update_history(browser, tab);

			} else {

				_update_address(browser, null);
				_update_history(browser, null);

			}

		});


		if (buttons.history.back !== null) {
			buttons.history.back.onclick = _ => browser.back();
		}

		if (buttons.history.next !== null) {
			buttons.history.next.onclick = _ => browser.next();
		}

		if (buttons.history.load !== null) {

			buttons.history.load.onclick = _ => {

				let action = buttons.history.load.className;
				if (action === 'refresh') {
					browser.refresh();
				} else if (action === 'pause') {
					browser.pause();
				} else if (action === 'stop') {
					browser.stop();
				}

			};

		}

		if (inputs.address !== null && outputs.address !== null) {

			outputs.address.onclick = e => {

				inputs.address.className = 'active';


				let target = e.target;
				if (target.tagName.toLowerCase() === 'li') {

					let url    = inputs.address.value;
					let ref    = browser.parse(url);
					let chunks = Array.from(outputs.address.querySelectorAll('li')).slice(1);
					let chunk  = chunks.find(ch => ch === target);
					let c      = chunks.indexOf(chunk);

					let before = chunks.slice(0, c).map(ch => ch.innerHTML).join('');
					if (ref.protocol !== null) {

						if (ref.protocol === 'stealth') {
							before = ref.protocol + ':' + before;
						} else {
							before = ref.protocol + '://' + before;
						}

					}

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

				let url = inputs.address.value.trim();
				if (url === '') {

					_update_address(browser.tab);

				} else if (
					url.startsWith('stealth:search') === false
					&& url.includes(' ') === true
				) {

					inputs.address.className = '';
					url = 'stealth:search?query=' + encodeURIComponent(url);

				} else if (
					url === 'https://'
					|| url === 'http://'
					|| url.endsWith('://')
				) {

					_update_address(browser.tab);
					url = '';

				} else if (url === 'stealth:') {

					inputs.address.className = '';
					inputs.address.value     = 'stealth:welcome';
					url = 'stealth:welcome';

				} else if (
					url.startsWith('https://')
					|| url.startsWith('http://')
					|| url.startsWith('stealth:')
					|| url.includes('://')
				) {

					inputs.address.className = '';

				} else {

					inputs.address.className = '';
					inputs.address.value     = 'https://' + url;
					url = 'https://' + url;

				}


				if (url !== '') {

					let tab = browser.create(url);
					if (tab !== null) {
						browser.show(tab);
					}

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

	if (buttons.settings !== null) {

		buttons.settings.onclick = _ => {

			let tab = browser.create('stealth:settings');
			if (tab !== null) {
				browser.show(tab);
			}

		};

	}

	if (buttons.sites.length > 0) {

		buttons.sites.forEach((button, s) => {

			button.onclick = _ => {

				let site = sites[s] || null;
				if (site !== null) {

					let visible = site.className === 'active';

					buttons.sites.forEach(b => (b.className = ''));
					sites.forEach(o => (o.className = ''));

					if (visible === false) {
						button.className = 'active';
						site.className   = 'active';
					}

				}

			};

		});

	}



	/*
	 * INIT
	 */

	global.browser ? _init(browser) : BROWSER_BINDINGS.push(_init);

})(typeof window !== 'undefined' ? window : this);

