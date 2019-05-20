
(function(global) {

	const doc     = global.document;
	const webview = doc.querySelector('#main-webview');
	const buttons = {
		history: {
			back:  doc.querySelector('#header-history-back'),
			next:  doc.querySelector('#header-history-next'),
			state: doc.querySelector('#header-history-state'),
			open:  doc.querySelector('#header-history-open')
		},
		mode: Array.from(doc.querySelectorAll('#header-mode button')),
		settings: {
			peer:    doc.querySelector('#header-settings-peer'),
			site:    doc.querySelector('#header-settings-site'),
			browser: doc.querySelector('#header-settings-browser')
		}
	};
	const inputs = {
		address: doc.querySelector('#header-address input')
	};
	const settings = {
		peer: doc.querySelector('aside#peer'),
		site: doc.querySelector('aside#site')
	};



	const init_events = function(browser, scope, webview) {

		scope   = scope !== undefined ? scope : null;
		webview = webview === true;

		if (scope !== null && webview === true) {

			let doc = scope.document || null;
			if (doc !== null) {
				_init_links(browser, Array.from(doc.querySelectorAll('a')));
			}

		}

	};

	const _init_links = function(browser, links) {

		links.forEach((link) => {

			link.onclick = () => {

				let href = link.getAttribute('href');
				if (href.startsWith('#')) {

					if (webview !== null) {

						let element = webview.contentWindow.document.querySelector(href) || null;
						if (element !== null) {
							element.scrollIntoView({
								behavior: 'smooth',
								block:    'center'
							});
						}

					}

				} else {

					let href = link.getAttribute('href');
					if (href.includes('#')) {
						href = href.split('#').shift();
					}

					let tab = browser.tab || null;
					if (tab !== null) {
						browser.navigate(href);
					}

				}

				return false;

			};

		});

	};



	/*
	 * INIT
	 */

	global.browser ? _init(global.browser) : global.DELAYED.push(_init);

})(typeof window !== 'undefined' ? window : this);

