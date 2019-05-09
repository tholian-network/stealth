
(function(global) {

	const doc     = global.document;
	const buttons = {
		history: {
			back:  doc.querySelector('#header-history-back'),
			next:  doc.querySelector('#header-history-next'),
			state: doc.querySelector('#header-history-state')
		},
		mode: Array.from(doc.querySelectorAll('#header-mode button')),
		site: doc.querySelector('#header-settings-site'),
		settings: doc.querySelector('#header-settings-browser')
	};
	const inputs  = {
		address: doc.querySelector('#header-address input')
	};
	const outputs = {
		address:  doc.querySelector('#header-address ul'),
		protocol: doc.querySelector('#header-address-protocol')
	};
	const sidebars = {
		site: doc.querySelector('aside#site')
	};



	const get_config = function(browser) {

		let config = {
			domain: null,
			mode: {
				text:  false,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		};

		let url = null;
		if (inputs.address !== null) {
			url = inputs.address.value;
		}

		if (buttons.mode.length > 0) {

			buttons.mode.forEach((button) => {

				let key = button.getAttribute('data-key') || null;
				if (key !== null) {
					config.mode[key] = button.getAttribute('data-val') === 'true';
				}

			});

		}


		let ref       = browser.parse(url);
		let rdomain   = ref.domain || null;
		let rprotocol = ref.protocol || null;

		if (rprotocol === 'stealth') {
			// Do not allow configs for Internal Pages
			return null;
		}

		if (rdomain !== null) {

			let rsubdomain = ref.subdomain || null;
			if (rsubdomain !== null) {
				rdomain = rsubdomain + '.' + rdomain;
			}

			config.domain = rdomain;

		}

		return config;

	};

	const update_address = function(browser, tab) {

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
					path.split('/').forEach((ch) => {
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

					cache.slice(chunks.length).forEach((element) => {
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
					cache.forEach((element) => {
						element.parentNode.removeChild(element);
					});
				}

			}

		}

	};

	const update_history = function(browser, tab) {

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

			if (buttons.history.state !== null) {

				buttons.history.state.removeAttribute('disabled');


				let is_loading = tab.requests.find((r) => r.loading === true) || null;
				if (is_loading !== null) {
					buttons.history.state.setAttribute('data-action', 'pause');
				} else {
					buttons.history.state.setAttribute('data-action', 'refresh');
				}

			}

		} else {

			if (buttons.history.back !== null) {
				buttons.history.back.removeAttribute('disabled');
			}

			if (buttons.history.next !== null) {
				buttons.history.next.removeAttribute('disabled');
			}

			if (buttons.history.state !== null) {
				buttons.history.state.removeAttribute('disabled');
			}

		}

	};

	const update_mode = function(browser, tab) {

		if (tab !== null) {

			let protocol = tab.ref.protocol || null;
			if (protocol === 'stealth') {
				buttons.mode.forEach((b) => (b.setAttribute('disabled', 'true')));
				buttons.site.setAttribute('disabled', 'true');
			} else {
				buttons.mode.forEach((b) => (b.removeAttribute('disabled')));
				buttons.site.removeAttribute('disabled');
			}

			Object.keys(tab.config.mode).forEach((key) => {

				let button = buttons.mode.find((b) => b.getAttribute('data-key') === key) || null;
				if (button !== null) {
					button.setAttribute('data-val', tab.config.mode[key] === true ? 'true' : 'false');
				}

			});

		} else {

			buttons.mode.forEach((b) => (b.setAttribute('data-val', 'false')));

		}

	};

	const _init = function(browser) {

		browser.on('change', (tab) => {
			update_mode(browser, tab);
		});

		browser.on('show', (tab) => {

			if (tab !== null) {

				let url = tab.url;
				if (url === 'stealth:settings') {
					buttons.settings.className = 'active';
				} else {
					buttons.settings.className = '';
				}


				update_address(browser, tab);
				update_history(browser, tab);
				update_mode(browser, tab);

			} else {

				update_address(browser, null);
				update_history(browser, null);
				update_mode(browser, null);

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


				update_address(browser, tab);
				update_history(browser, tab);

			} else {

				update_address(browser, null);
				update_history(browser, null);

			}

		});


		if (buttons.history.back !== null) {
			buttons.history.back.onclick = () => browser.back();
		}

		if (buttons.history.next !== null) {
			buttons.history.next.onclick = () => browser.next();
		}

		if (buttons.history.state !== null) {

			buttons.history.state.onclick = () => {

				let action = buttons.history.state.getAttribute('data-action');
				if (action === 'refresh') {
					browser.refresh();
				} else if (action === 'pause') {
					browser.pause();
				}

			};

		}

		if (inputs.address !== null && outputs.address !== null) {

			outputs.address.onclick = (e) => {

				inputs.address.className = 'active';


				let target = e.target;
				if (target.id !== 'header-address-protocol' && target.tagName.toLowerCase() === 'li') {

					let url    = inputs.address.value;
					let chunks = Array.from(outputs.address.querySelectorAll('li')).slice(1);
					let chunk  = chunks.find((ch) => ch === target);
					let c      = chunks.indexOf(chunk);
					let before = chunks.slice(0, c).map((ch) => ch.innerHTML).join('');

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

					update_address(browser, browser.tab);

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

					update_address(browser, browser.tab);
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

		if (buttons.mode.length > 0) {

			buttons.mode.forEach((button) => {

				button.onclick = () => {

					button.setAttribute('data-val', button.getAttribute('data-val') === 'true' ? 'false' : 'true');

					let config = get_config(browser);
					if (config !== null) {
						browser.set(config);
					}

				};

			});

		}

		if (buttons.site !== null) {

			buttons.site.onclick = () => {

				let tab = browser.tab;
				if (tab !== null && tab.ref.protocol !== 'stealth') {

					let sidebar = sidebars.site || null;
					if (sidebar !== null) {

						let visible = sidebar.className === 'active';
						if (visible === true) {
							buttons.site.className = '';
							sidebar.className = '';
						} else if (visible === false) {
							buttons.site.className = 'active';
							sidebar.className = 'active';
						}

					}

				}

			};

		}

		if (buttons.settings !== null) {

			buttons.settings.onclick = () => {

				let tab = browser.open('stealth:settings');
				if (tab !== null) {
					buttons.site.className  = '';
					sidebars.site.className = '';
					browser.show(tab);
				}

			};

		}

	};



	/*
	 * INIT
	 */

	global.browser ? _init(global.browser) : global.DELAYED.push(_init);

})(typeof window !== 'undefined' ? window : this);

