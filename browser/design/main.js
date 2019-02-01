
(function(global) {

	const doc     = global.document;
	const webview = doc.querySelector('#main-webview');
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
		}
	};
	const inputs  = {
		address: doc.querySelector('#header-address input')
	};
	const sites   = [
		doc.querySelector('aside#site-modes'),
		doc.querySelector('aside#site-requests')
	];



	const _get_url = function(browser, tab) {

		let url  = null;
		let ref  = tab.ref;
		let mime = ref.mime || null;

		if (mime !== null && (mime.type === 'audio' || mime.type === 'video')) {

			url = '/browser/internal/media.html?url=' + encodeURIComponent(ref.url);

		} else if (ref.protocol === 'stealth') {

			url = '/browser/internal/' + ref.domain + '.html';

			if (ref.query !== null) {
				url += '?' + ref.query;
			}

		} else if (ref.protocol === 'https' || ref.protocol === 'http') {

			url = '/stealth/tab:' + tab.id + '/' + ref.url;

		} else {

			url = '/browser/internal/fix-url.html?url=' + encodeURIComponent(ref.url);

		}

		return url;

	};

	const _init_events = function(browser, scope, webview) {

		scope   = scope !== undefined ? scope : null;
		webview = webview === true;


		if (scope !== null) {

			scope.onkeydown = e => {

				let ctrl = e.ctrlKey === true;
				let key  = e.key.toLowerCase();

				if (
					key === 'f2'
					|| key === 'f3'
					|| key === 'f4'
					|| key === 'f5'
					|| key === 'f6'
					|| key === 'f7'
					|| key === 'f8'
				) {
					inputs.address.className = '';
					inputs.address.blur();
				}

				if (ctrl === true && key === 'escape') {

					let tab = browser.tab || null;
					if (tab !== null) {
						browser.kill(tab);
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'escape') {

					inputs.address.className = '';

					buttons.sites.forEach((button, s) => {
						button.className = '';
						sites[s].className = '';
					});

				} else if (key === 'f1') {

					inputs.address.className = 'active';
					inputs.address.setSelectionRange(0, inputs.address.value.length);
					inputs.address.focus();

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f2') {

					let index = buttons.modes.findIndex(m => m.className === 'active') + 1;
					if (index >= buttons.modes.length) {
						index %= buttons.modes.length;
					}

					let button = buttons.modes[index] || null;
					if (button !== null) {
						button.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f3') {

					let index = sites.findIndex(s => s.className === 'active') + 1;
					if (index >= sites.length) {
						index %= sites.length;
					}

					let button = buttons.sites[index] || null;
					if (button !== null) {
						button.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f4') {

					let tab = browser.open('stealth:settings');
					if (tab !== null) {
						browser.show(tab);
						tab.load();
					}

				} else if (key === 'f5') {

					let index = browser.tabs.indexOf(browser.tab) - 1;
					if (index < 0) {
						index = browser.tabs.length - 1;
					}

					let tab = browser.tabs[index] || null;
					if (tab !== null) {
						browser.show(tab);
					}

					e.preventDefault();
					e.stopPropagation();


				} else if (key === 'f6') {

					let index = browser.tabs.indexOf(browser.tab) + 1;
					if (index >= browser.tabs.length) {
						index %= browser.tabs.length;
					}

					let tab = browser.tabs[index] || null;
					if (tab !== null) {
						browser.show(tab);
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f7') {

					let tab = browser.tabs[0] || null;
					if (tab !== null) {
						browser.kill(tab);
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f8') {

					if (browser.tabs.length > 0) {

						let tab = browser.tabs[browser.tabs.length - 1] || null;
						if (tab !== null) {
							browser.kill(tab);
						}

					}

					e.preventDefault();
					e.stopPropagation();

				} else if (ctrl === true && key === 'r') {

					let load = buttons.history.load || null;
					if (load.disabled !== true) {
						load.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (
					(ctrl === true && key === 'x')
					|| (ctrl === true && key === 'c')
					|| (ctrl === true && key === 'v')
				) {

					// XXX: Do nothing

				} else if (ctrl === true) {

					// XXX: Stupid Browser be stupid, yo

					e.preventDefault();
					e.stopPropagation();

				}

			};

		}


		if (scope !== null && webview === true) {

			let doc = scope.document || null;
			if (doc !== null) {
				_init_links(browser, Array.from(doc.querySelectorAll('a')));
			}

		}

	};

	const _init_links = function(browser, links) {

		links.forEach(link => {

			link.onclick = () => {

				let tab = browser.tab || null;
				if (tab !== null) {
					browser.navigate(link.getAttribute('href'));
				}

				return false;

			};

		});

	};


	const _init = function(browser) {

		browser.on('show', (tab) => {

			let url = _get_url(browser, tab);
			if (url !== null) {

				if (webview.src !== url) {
					webview.src = url;
				}

			}

		});

		browser.on('refresh', (tab) => {

			let url = _get_url(browser, tab);
			if (url !== null) {

				if (webview.src !== url) {
					webview.src = url;
				}

			}

		});


		_init_events(browser, global, false);


		if (webview !== null) {

			(function() {
				_init_events(browser, webview.contentWindow || null, true);
			})();

			webview.onload = () => {
				_init_events(browser, webview.contentWindow || null, true);
			};

		}

	};



	/*
	 * INIT
	 */

	global.browser ? _init(global.browser) : global.BROWSER_BINDINGS.push(_init);

})(typeof window !== 'undefined' ? window : this);

