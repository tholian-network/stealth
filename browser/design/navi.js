
(function(global) {

	const doc  = global.document;
	const navi = doc.querySelector('aside#navi');
	const main = doc.querySelector('main#main');



	const create_button = function(browser, tab) {

		let button = doc.createElement('button');
		let label  = browser.import('URL').render({
			domain:    tab.ref.domain,
			hash:      null,
			host:      tab.ref.host,
			path:      null,
			port:      tab.ref.port,
			protocol:  null,
			query:     null,
			subdomain: tab.ref.subdomain
		});

		button.innerHTML = label;
		button.title     = tab.ref.url;
		button.setAttribute('data-id', tab.id);

		button.onclick = () => {

			let id  = button.getAttribute('data-id');
			let tab = browser.tabs.find((t) => t.id === id) || null;
			if (tab !== null) {
				browser.show(tab);
			}

		};

		button.ondblclick = () => {

			let id  = button.getAttribute('data-id');
			let tab = browser.tabs.find((t) => t.id === id) || null;
			if (tab !== null) {
				browser.kill(tab);
			}

		};

		return button;

	};

	const refresh_button = function(browser, button, tab) {

		let label = browser.import('URL').render({
			domain:    tab.ref.domain,
			hash:      null,
			host:      tab.ref.host,
			path:      null,
			port:      tab.ref.port,
			protocol:  null,
			query:     null,
			subdomain: tab.ref.subdomain
		});

		button.innerHTML = label;
		button.title     = tab.ref.url;

	};

	const sort_by_domain = function(a, b) {

		if (a.tab !== null && b.tab !== null) {

			let a_ref = a.tab.ref;
			let b_ref = b.tab.ref;

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

	const update_navi = function(tabs) {

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

	const init = function(browser) {

		navi.className = browser.tabs.length > 1 ? 'active' : '';


		browser.on('open', (tab, tabs) => {

			let button = create_button(browser, tab);
			if (button !== null) {
				navi.appendChild(button);
			}

			setTimeout(() => update_navi(tabs), 0);

		});

		browser.on('hide', () => {
			// Do nothing
		});

		browser.on('kill', (tab, tabs) => {

			let button = Array.from(navi.querySelectorAll('button')).find((b) => b.getAttribute('data-id') === tab.id) || null;
			if (button !== null) {
				button.parentNode.removeChild(button);
			}

			setTimeout(() => update_navi(tabs), 0);

		});

		browser.on('show', (tab, tabs) => {

			let buttons = Array.from(navi.querySelectorAll('button'));
			if (buttons.length > 0) {

				buttons.forEach((button) => {
					button.className = button.getAttribute('data-id') === tab.id ? 'active' : '';
				});


				let sorted = buttons.map((button) => {

					let id = button.getAttribute('data-id');

					return {
						button: button,
						tab:    tabs.find((t) => t.id === id) || null
					};

				}).sort((a, b) => sort_by_domain(a, b));

				// TODO: Make this smarter
				buttons.forEach((b) => b.parentNode.removeChild(b));
				sorted.forEach((b) => navi.appendChild(b.button));

			}

		});

		browser.on('refresh', (tab) => {

			let button = Array.from(navi.querySelectorAll('button')).find((b) => b.getAttribute('data-id') === tab.id) || null;
			if (button !== null) {
				refresh_button(browser, button, tab);
			}

		});

	};



	/*
	 * INIT
	 */

	global.browser ? init(global.browser) : global.DELAYED.push(init);

})(typeof window !== 'undefined' ? window : this);

