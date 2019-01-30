
(function(global) {

	const doc  = global.document;
	const navi = doc.querySelector('aside#navi');
	const main = doc.querySelector('main#main');



	const _create_button = function(browser, tab) {

		let ref       = browser.parse(tab.url);
		let domain    = ref.domain    || null;
		let host      = ref.host      || null;
		let port      = ref.port      || null;
		let protocol  = ref.protocol  || null;
		let subdomain = ref.subdomain || null;

		let button = doc.createElement('button');
		let config = tab.config;
		let label  = '';

		if (domain !== null) {

			if (subdomain !== null) {
				label += subdomain + '.' + domain;
			} else {
				label += domain;
			}

		} else if (host !== null) {

			if (host.includes(':')) {
				label += '[' + host + ']';
			} else {
				label += host;
			}

		}

		if (protocol === 'https' && port !== 443) {
			label += ':' + port;
		} else if (protocol === 'http' && port !== 80) {
			label += ':' + port;
		}


		button.innerHTML = label;
		button.title     = ref.url;
		button.setAttribute('data-id', tab.id);

		if (config !== null && config.domain !== null) {
			button.setAttribute('data-mode', config.mode);
		}

		button.onclick = _ => {

			let id  = button.getAttribute('data-id');
			let tab = browser.tabs.find(t => t.id === id) || null;
			if (tab !== null) {
				browser.show(tab);
			}

		};

		button.ondblclick = _ => {

			let id  = button.getAttribute('data-id');
			let tab = browser.tabs.find(t => t.id === id) || null;
			if (tab !== null) {
				browser.kill(tab);
			}

		};


		return button;

	};

	const _refresh_button = function(browser, button, tab) {

		let ref = browser.parse(tab.url);

		if (ref.subdomain !== null) {
			button.innerHTML = ref.subdomain + '.' + ref.domain;
		} else {
			button.innerHTML = ref.domain;
		}

		button.title = ref.url;

		let config = tab.config;
		if (config !== null && config.domain !== null) {
			button.setAttribute('data-mode', config.mode);
		} else {
			button.removeAttribute('data-mode');
		}

	};

	const _sort_by_domain = function(browser, a, b) {

		if (a.tab !== null && b.tab !== null) {

			let a_ref = browser.parse(a.tab.url);
			let b_ref = browser.parse(b.tab.url);

			if (a_ref.protocol === 'stealth' && b_ref.protocol !== 'stealth') return  1;
			if (b_ref.protocol === 'stealth' && a_ref.protocol !== 'stealth') return -1;

			if (a_ref.domain > b_ref.domain) return  1;
			if (b_ref.domain > a_ref.domain) return -1;

			if (a_ref.subdomain !== null && b_ref.subdomain !== null) {

				if (a_ref.subdomain > b_ref.subdomain) return  1;
				if (b_ref.subdomain > a_ref.subdomain) return -1;

			}

			if (a_ref.subdomain !== null && b_ref.subdomain === null) return  1;
			if (b_ref.subdomain !== null && a_ref.subdomain === null) return -1;

		}


		return 0;

	};

	const _update_navi = function(tabs) {

		if (navi !== null) {

			if (tabs.length > 1) {

				navi.className = 'active';

				if (main !== null) {
					let width = navi.getBoundingClientRect().width;
					main.style.left = width + 'px';
				}

			} else {

				navi.className = '';

				if (main !== null) {
					main.style.left = '';
				}

			}

		}

	};

	const _init = function(browser) {

		navi.className = browser.tabs.length > 1 ? 'active' : '';


		browser.on('open', (tab, tabs) => {

			let button = _create_button(browser, tab);
			if (button !== null) {
				navi.appendChild(button);
			}

			setTimeout(_ => _update_navi(tabs), 0);

		});

		browser.on('hide', (tab, tabs) => {
			// XXX: Nothing to do
		});

		browser.on('kill', (tab, tabs) => {

			let button = Array.from(navi.querySelectorAll('button')).find(b => b.getAttribute('data-id') === tab.id) || null;
			if (button !== null) {
				button.parentNode.removeChild(button);
			}

			setTimeout(_ => _update_navi(tabs), 0);

		});

		browser.on('show', (tab, tabs) => {

			let buttons = Array.from(navi.querySelectorAll('button'));
			if (buttons.length > 0) {

				buttons.forEach(button => {
					button.className = button.getAttribute('data-id') === tab.id ? 'active' : '';
				});


				let sorted = buttons.map(button => {

					let id = button.getAttribute('data-id');

					return {
						button: button,
						tab:    tabs.find(t => t.id === id) || null
					};

				}).sort((a, b) => _sort_by_domain(browser, a, b));

				// TODO: Make this smarter
				buttons.forEach(b => b.parentNode.removeChild(b));
				sorted.forEach(b => navi.appendChild(b.button));

			}

		});

		browser.on('refresh', (tab, tabs) => {

			let button = Array.from(navi.querySelectorAll('button')).find(b => b.getAttribute('data-id') === tab.id) || null;
			if (button !== null) {
				_refresh_button(browser, button, tab);
			}

		});

	};



	/*
	 * INIT
	 */

	global.browser ? _init(browser) : BROWSER_BINDINGS.push(_init);

})(typeof window !== 'undefined' ? window : this);

