
(function(global) {

	const doc  = global.document;
	const navi = doc.querySelector('aside#navi');
	const main = doc.querySelector('main#main');



	const _create_button = function(browser, tab) {

		let domain   = null;
		let protocol = null;


		let ref    = browser.parse(tab.url);
		let button = doc.createElement('button');

		if (ref.domain !== null && (ref.protocol === 'https' || ref.protocol === 'http')) {

			browser.peer.load(ref.protocol + '://' + ref.domain + '/favicon.ico', data => {

				let buffer = data.buffer || null;
				if (buffer !== null && buffer.type === 'image/x-icon') {
					button.style.backgroundImage = 'url("' + buffer.serialize() + ')';
				}

			});

		}

		button.innerHTML = ref.domain;
		button.title     = ref.url;
		button.setAttribute('data-id', tab.id);

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

		button.innerHTML = ref.domain;
		button.title     = ref.url;

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

