
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


			if (inputs.address !== null) {
				inputs.address.className = '';
				inputs.address.value     = tab.url;
			}

			if (outputs.protocol !== null) {

				let type  = 'unknown';
				let title = 'Unknown URL Scheme';

				if (tab.ref.protocol === 'https') {
					type  = 'secure';
					title = 'Secure via HTTPS';
				} else if (tab.ref.protocol === 'http') {
					type  = 'insecure';
					title = 'Insecure via HTTP';
				} else if (tab.ref.protocol === 'stealth') {
					type  = 'stealth';
					title = 'Internal Page';
				}

				outputs.protocol.className = type;
				outputs.protocol.title     = title;

			}

			if (outputs.address !== null) {

				let cache  = Array.from(outputs.address.querySelectorAll('li')).slice(1);
				let chunks = [];

				let domain = tab.ref.domain || null;
				let host   = tab.ref.host   || null;

				if (domain !== null) {

					let subdomain = tab.ref.subdomain || null;
					if (subdomain !== null) {
						domain = subdomain + '.' + domain;
					}

					if (tab.ref.protocol === 'https' && tab.ref.port !== 443) {
						domain += ':' + tab.ref.port;
					} else if (tab.ref.protocol === 'http' && tab.ref.port !== 80) {
						domain += ':' + tab.ref.port;
					}

					chunks.push(domain);

				} else if (host !== null) {

					if (host.includes(':')) {
						host = '[' + host + ']';
					}

					if (tab.ref.protocol === 'https' && tab.ref.port !== 443) {
						host += ':' + tab.ref.port;
					} else if (tab.ref.protocol === 'http' && tab.ref.port !== 80) {
						host += ':' + tab.ref.port;
					}

					chunks.push(host);

				}

				let path = tab.ref.path || '/';
				if (path !== '/') {
					path.split('/').forEach(ch => {
						if (ch !== '') {
							chunks.push('/' + ch);
						}
					});
				}

				let query = tab.ref.query || null;
				if (query !== null) {
					chunks.push('?' + query);
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

	const _update_mode = function(browser, tab) {

		let config = tab.config;
		if (config !== null && config.domain !== null) {

			let mode   = config.mode;
			let button = buttons.modes.find(b => b.title.toLowerCase() === mode) || null;
			if (button !== null) {

				buttons.modes.forEach(other => {
					other.className = other === button ? 'active' : '';
				});

				browser.setMode(mode);

			}

		}

	};

	const _init = function(browser) {

		browser.on('mode', mode => {

			buttons.modes.forEach(b => (b.className = ''));

			let button = buttons.modes.find(b => b.getAttribute('title').toLowerCase() === mode) || null;
			if (button !== null) {
				button.className = 'active';
			}

		});

		browser.on('show', (tab) => {

			if (tab !== null) {

				let url = tab.url;
				if (url === 'stealth:settings') {
					buttons.settings.className = 'active';
				} else {
					buttons.settings.className = '';
				}


				_update_address(browser, tab);
				_update_history(browser, tab);
				_update_mode(browser, tab);

			} else {

				_update_address(browser, null);
				_update_history(browser, null);
				_update_mode(browser, tab);

			}

		});

		browser.on('refresh', (tab) => {

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
			buttons.history.back.onclick = () => browser.back();
		}

		if (buttons.history.next !== null) {
			buttons.history.next.onclick = () => browser.next();
		}

		if (buttons.history.load !== null) {

			buttons.history.load.onclick = () => {

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

			outputs.address.onclick = (e) => {

				inputs.address.className = 'active';


				let target = e.target;
				if (target.tagName.toLowerCase() === 'li') {

					let url    = inputs.address.value;
					let chunks = Array.from(outputs.address.querySelectorAll('li')).slice(1);
					let chunk  = chunks.find(ch => ch === target);
					let c      = chunks.indexOf(chunk);
					let before = chunks.slice(0, c).map(ch => ch.innerHTML).join('');

					let ref     = browser.parse(url);
					let protocol = ref.protocol;
					if (protocol !== null) {

						if (protocol === 'stealth') {
							before = protocol + ':' + before;
						} else {
							before = protocol + '://' + before;
						}

					}

					let offset = url.indexOf(before) + before.length;
					let select = chunk.innerHTML;

					inputs.address.setSelectionRange(offset, offset + select.length);
					inputs.address.focus();

				}

			};

			inputs.address.onkeyup = (e) => {

				let key = e.key.toLowerCase();
				if (key === 'enter') {
					inputs.address.blur();
				}

			};

			inputs.address.onblur = () => {

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

					let tab = browser.open(url);
					if (tab !== null) {
						browser.show(tab);
					}

				}

			};

		}

		if (buttons.modes.length > 0) {

			buttons.modes.forEach(button => {

				button.onclick = () => {

					buttons.modes.forEach(b => (b.className = ''));
					button.className = 'active';

					let tmp = button.getAttribute('title');
					if (tmp !== null) {
						browser.setMode(tmp);
					}

				};

			});

		}

		if (buttons.settings !== null) {

			buttons.settings.onclick = () => {

				let tab = browser.open('stealth:settings');
				if (tab !== null) {
					browser.show(tab);
				}

			};

		}

	};



	if (buttons.sites.length > 0) {

		buttons.sites.forEach((button, s) => {

			button.onclick = () => {

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

	global.browser ? _init(global.browser) : global.BROWSER_BINDINGS.push(_init);

})(typeof window !== 'undefined' ? window : this);

