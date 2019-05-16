
(function(global) {

	const doc     = global.document;
	const buttons = {
		history: {
			back:  doc.querySelector('#header-history-back'),
			next:  doc.querySelector('#header-history-next'),
			state: doc.querySelector('#header-history-state'),
			open:  doc.querySelector('#header-history-open')
		},
		mode: Array.from(doc.querySelectorAll('#header-mode button')),
		settings: {
			site:    doc.querySelector('#header-settings-site'),
			peer:    doc.querySelector('#header-settings-peer'),
			browser: doc.querySelector('#header-settings-browser')
		}
	};
	const inputs  = {
		address: doc.querySelector('#header-address input')
	};
	const outputs = {
		address:  doc.querySelector('#header-address ul'),
		protocol: doc.querySelector('#header-address-protocol')
	};
	const settings = {
		peer: doc.querySelector('aside#peer'),
		site: doc.querySelector('aside#site')
	};



	const get_config = function(browser) {

		let url = null;

		if (inputs.address !== null) {
			url = inputs.address.value;
		}


		if (url !== null) {

			let ref = browser.import('URL').parse(url);
			if (ref.protocol !== 'file' && ref.protocol !== 'stealth') {

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

				if (buttons.mode.length > 0) {

					buttons.mode.forEach((button) => {

						let key = button.getAttribute('data-key') || null;
						if (key !== null) {
							config.mode[key] = button.getAttribute('data-val') === 'true';
						}

					});

				}

				if (ref.domain !== null) {

					if (ref.subdomain !== null) {
						config.domain = ref.subdomain + '.' + ref.domain;
					} else {
						config.domain = ref.domain;
					}

				}

				return config;

			}

		}


		return null;

	};

	const toggle_sidebar = function(id1) {

		let id2 = id1 === 'site' ? 'peer' : 'site';


		buttons.settings[id1].removeAttribute('disabled');
		buttons.settings[id2].removeAttribute('disabled');


		if (settings[id1].className === 'active') {

			buttons.settings[id1].className = '';
			settings[id1].className = '';

			buttons.settings[id2].className = '';
			settings[id2].className = '';

		} else if (settings[id1].className === '') {

			buttons.settings[id1].className = 'active';
			settings[id1].className = 'active';

			buttons.settings[id2].className = '';
			settings[id2].className = '';

		}

	};

	const update_address = function(browser, tab) {

		if (tab !== null) {

			if (inputs.address !== null) {
				inputs.address.className = '';
				inputs.address.value     = tab.url;
			}

			if (outputs.protocol !== null) {
				outputs.protocol.title = tab.ref.protocol;
				outputs.protocol.setAttribute('data-val', tab.ref.protocol);
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


					let port     = tab.ref.port     || null;
					let protocol = tab.ref.protocol || null;

					if (protocol === 'file') {
						// Do nothing
					} else if (protocol === 'ftps' && port !== 990) {
						domain += ':' + port;
					} else if (protocol === 'ftp' && port !== 21) {
						domain += ':' + port;
					} else if (protocol === 'https' && port !== 443) {
						domain += ':' + port;
					} else if (protocol === 'http' && port !== 80) {
						domain += ':' + port;
					} else if (protocol === 'wss' && port !== 443) {
						domain += ':' + port;
					} else if (protocol === 'ws' && port !== 80) {
						domain += ':' + port;
					} else if (protocol === 'socks' && port !== 1080) {
						domain += ':' + port;
					} else if (protocol === 'stealth') {
						// Do nothing
					}

					chunks.push(domain);

				} else if (host !== null) {

					if (host.includes(':')) {
						host = '[' + host + ']';
					}


					let port     = tab.ref.port     || null;
					let protocol = tab.ref.protocol || null;

					if (protocol === 'file') {
						// Do nothing
					} else if (protocol === 'ftps' && port !== 990) {
						domain += ':' + port;
					} else if (protocol === 'ftp' && port !== 21) {
						domain += ':' + port;
					} else if (protocol === 'https' && port !== 443) {
						domain += ':' + port;
					} else if (protocol === 'http' && port !== 80) {
						domain += ':' + port;
					} else if (protocol === 'wss' && port !== 443) {
						domain += ':' + port;
					} else if (protocol === 'ws' && port !== 80) {
						domain += ':' + port;
					} else if (protocol === 'socks' && port !== 1080) {
						domain += ':' + port;
					} else if (protocol === 'stealth') {
						// Do nothing
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
				outputs.protocol.title = '';
				outputs.protocol.setAttribute('data-val', '');
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
			} else {
				buttons.mode.forEach((b) => (b.removeAttribute('disabled')));
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

	const update_settings = function(browser, tab) {

		if (tab !== null) {

			let protocol = tab.ref.protocol || null;
			let domain   = tab.ref.domain   || null;

			if (protocol === 'stealth' && domain === 'settings') {
				buttons.settings.browser.setAttribute('disabled', 'true');
				buttons.settings.browser.className = 'active';
			} else {
				buttons.settings.browser.removeAttribute('disabled');
				buttons.settings.browser.className = '';
			}

			if (protocol === 'stealth') {
				buttons.settings.site.setAttribute('disabled', 'true');
				buttons.settings.peer.setAttribute('disabled', 'true');
			} else {
				buttons.settings.site.removeAttribute('disabled');
				buttons.settings.peer.removeAttribute('disabled');
			}

		} else {

			buttons.settings.site.setAttribute('disabled', 'true');
			buttons.settings.peer.setAttribute('disabled', 'true');
			buttons.settings.browser.setAttribute('disabled', 'true');

		}

	};

	const init = function(browser) {

		browser.on('change', (tab) => {
			update_mode(browser, tab);
		});

		browser.on('show', (tab) => {

			if (tab !== null) {

				update_address(browser, tab);
				update_history(browser, tab);
				update_mode(browser, tab);
				update_settings(browser, tab);

			} else {

				update_address(browser, null);
				update_history(browser, null);
				update_mode(browser, null);
				update_settings(browser, null);

			}

		});

		browser.on('refresh', (tab) => {

			if (tab !== null) {

				update_address(browser, tab);
				update_history(browser, tab);
				// mode doesn't change on refresh
				update_settings(browser, tab);

			} else {

				update_address(browser, null);
				update_history(browser, null);
				// mode doesn't change on refresh
				update_settings(browser, null);

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

		if (buttons.history.open !== null) {

			buttons.history.open.removeAttribute('disabled');
			buttons.history.open.onclick = () => {

				let tab = browser.open('stealth:welcome');
				if (tab !== null) {
					browser.show(tab);
				}

			};

		}

		if (inputs.address !== null && outputs.address !== null) {

			inputs.address.onfocus = () => {

				// This is set by outputs.address.onclick()
				if (inputs.address.className !== 'active') {

					let url = inputs.address.value || null;
					if (url !== null) {
						inputs.address.className = 'active';
						inputs.address.setSelectionRange(0, url.length);
					}

				}

			};

			outputs.address.onclick = (e) => {

				let target  = e.target;
				let tagname = target.tagName.toLowerCase();
				if (tagname === 'li' && target !== outputs.protocol) {

					let ref    = browser.import('URL').parse(inputs.address.value);
					let url    = ref.url;
					let chunks = Array.from(outputs.address.querySelectorAll('li')).slice(1);
					let chunk  = chunks.find((ch) => ch === target);
					let c      = chunks.indexOf(chunk);

					let before = chunks.slice(0, c).map((ch) => ch.innerHTML).join('');
					if (ref.protocol === 'stealth') {
						before = ref.protocol + ':' + before;
					} else if (ref.protocol !== null) {
						before = ref.protocol + '://' + before;
					}

					let offset = url.indexOf(before) + before.length;
					let select = chunk.innerHTML;

					inputs.address.className = 'active';
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

		if (buttons.settings.site !== null) {

			buttons.settings.site.onclick = () => {

				let tab = browser.tab;
				if (tab !== null && tab.ref.protocol !== 'stealth') {
					toggle_sidebar('site');
				}

			};

		}

		if (buttons.settings.peer !== null) {

			buttons.settings.peer.onclick = () => {

				let tab = browser.tab;
				if (tab !== null && tab.ref.protocol !== 'stealth') {
					toggle_sidebar('peer');
				}

			};

		}

		if (buttons.settings.browser !== null) {

			buttons.settings.browser.onclick = () => {

				let tab = browser.open('stealth:settings');
				if (tab !== null) {
					update_settings(browser, tab);
					browser.show(tab);
				}

			};

		}

	};



	/*
	 * INIT
	 */

	global.browser ? init(global.browser) : global.DELAYED.push(init);

})(typeof window !== 'undefined' ? window : this);

