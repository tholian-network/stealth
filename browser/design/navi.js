
(function(global) {

	const doc  = global.document;
	const navi = doc.querySelector('aside#navi');
	const main = doc.querySelector('main#main');



	const _create_button = function(browser, tab) {

		let url      = tab.url;
		let domain   = null;
		let protocol = null;

		if (url.startsWith('https://')) {
			protocol = 'https://';
			domain   = url.split('/').slice(2, 3).join('/');
		} else if (url.startsWith('http://')) {
			protocol = 'http://';
			domain   = url.split('/').slice(2, 3).join('/');
		} else if (url.startsWith('about:')) {
			protocol = 'about:';
			domain   = url.split('/')[0];
		} else if (url.includes('://')) {
			protocol = url.substr(0, url.indexOf('://') + 3);
			domain   = url.substr(protocol.length).split('/')[0];
		} else {
			domain   = url.split('/')[0];
		}


		let button = doc.createElement('button');


		if (protocol === 'https://' || protocol === 'http://') {

			if (domain !== null) {

				browser.peer.load(protocol + '//' + domain + '/favicon.ico', data => {

					let buffer = data.buffer || null;
					if (buffer !== null && buffer.type === 'image/x-icon') {
						button.style.backgroundImage = 'url("' + buffer.serialize() + ')';
					}

				});

			}

		}


		button.innerHTML = domain;
		button.title     = url;

		button.onclick = _ => {

			let url = button.getAttribute('data-url');
			let tab = browser.tabs.find(t => t.url === url) || null;
			if (tab !== null) {
				browser.show(tab);
			}

		};

		button.ondblclick = _ => {

			let url = button.getAttribute('data-url');
			let tab = browser.tabs.find(t => t.url === url) || null;
			if (tab !== null) {
				browser.kill(tab);
			}

		};

		button.setAttribute('data-url', url);

		return button;

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


		browser.on('create', (tab, tabs) => {

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

			let button = Array.from(navi.querySelectorAll('button')).find(b => b.getAttribute('data-url') === tab.url) || null;
			if (button !== null) {
				button.parentNode.removeChild(button);
			}

			setTimeout(_ => _update_navi(tabs), 0);

		});

		browser.on('show', (tab, tabs) => {

			let buttons = Array.from(navi.querySelectorAll('button'));
			if (buttons.length > 0) {
				buttons.forEach(button => {
					button.className = button.getAttribute('data-url') === tab.url ? 'active' : '';
				});
			}

		});

	};



	/*
	 * INIT
	 */

	global.browser ? _init(browser) : BROWSER_BINDINGS.push(_init);

})(typeof window !== 'undefined' ? window : this);

