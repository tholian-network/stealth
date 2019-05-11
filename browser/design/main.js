
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



	const _get_url = function(browser, tab, refresh) {

		refresh = refresh === true;


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

			if (refresh === true) {
				url = '/stealth/:' + tab.id + ',refresh,webview:/' + ref.url;
			} else {
				url = '/stealth/:' + tab.id + ',webview:/' + ref.url;
			}

		} else {

			url = '/browser/internal/fix-url.html?url=' + encodeURIComponent(ref.url);

		}

		return url;

	};

	const _init_events = function(browser, scope, webview) {

		scope   = scope !== undefined ? scope : null;
		webview = webview === true;


		if (scope !== null) {

			scope.onkeydown = (e) => {

				let ctrl = e.ctrlKey === true;
				let key  = e.key.toLowerCase();

				if (
					key === 'f1'
					|| key === 'f2'
					|| key === 'f3'
					|| key === 'f4'
					|| key === 'f5'
					|| key === 'f6'
					|| key === 'f7'
					|| key === 'f8'
					|| key === 'f9'
					|| key === 'f10'
					|| key === 'f11'
					|| key === 'f12'
				) {
					inputs.address.className = '';
					inputs.address.blur();
				}


				if (key === 'escape') {

					inputs.address.className = '';
					buttons.settings.peer.className = '';
					buttons.settings.site.className = '';
					settings.peer.className = '';
					settings.site.className = '';

				} else if (key === 'f1') {

					// Prev Tab
					let allowed = buttons.history.back.getAttribute('disabled') === null;
					if (allowed === true) {
						buttons.history.back.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f2') {

					// Next Tab
					let allowed = buttons.history.next.getAttribute('disabled') === null;
					if (allowed === true) {
						buttons.history.next.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f3' || (ctrl === true && key === 'r')) {

					// Refresh/Pause Tab
					let allowed = buttons.history.state.getAttribute('disabled') === null;
					if (allowed === true) {
						buttons.history.state.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f4' || (ctrl === true && key === 't')) {

					// Open Tab
					let allowed = buttons.history.open.getAttribute('disabled') === null;
					if (allowed === true) {
						buttons.history.open.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f5' || (ctrl === true && key === 'e')) {

					// Focus Address Bar
					inputs.address.className = 'active';
					inputs.address.setSelectionRange(0, inputs.address.value.length);
					inputs.address.focus();

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f6' || (ctrl === true && key === 'w')) {

					// Kill Tab
					if (browser.tabs.length > 0) {

						if (browser.tabs.length > 1) {
							browser.kill(browser.tab);
						}

					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f7') {

					// Prev Tab
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

				} else if (key === 'f8') {

					// Next Tab
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

				} else if (key === 'f9') {

					// Site Mode
					let check = buttons.mode.filter((b) => b.getAttribute('disabled') === 'true');
					if (check.length !== buttons.mode.length) {

						let next = buttons.mode.find((b) => b.getAttribute('data-val') !== 'true') || null;
						if (next !== null) {
							next.click();
						} else {

							buttons.mode.forEach((b) => (b.setAttribute('data-val', 'false')));

							if (browser !== null && browser.tab !== null) {
								browser.set({
									domain: browser.tab.config.domain,
									mode: {
										text:  false,
										image: false,
										audio: false,
										video: false,
										other: false
									}
								});
							}

						}

					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f10') {

					// Site Sidebar
					let allowed = buttons.settings.site.getAttribute('disabled') === null;
					if (allowed === true) {
						buttons.settings.site.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f11') {

					// Peer Sidebar
					let allowed = buttons.settings.peer.getAttribute('disabled') === null;
					if (allowed === true) {
						buttons.settings.peer.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (key === 'f12') {

					let allowed = buttons.settings.browser.getAttribute('disabled') === null;
					if (allowed === true) {
						buttons.settings.browser.click();
					}

					e.preventDefault();
					e.stopPropagation();

				} else if (
					(ctrl === true && key === 'z')
					|| (ctrl === true && key === 'x')
					|| (ctrl === true && key === 'c')
					|| (ctrl === true && key === 'v')
				) {

					// Do nothing

				} else if (ctrl === true) {

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

						if (href.startsWith('./') || href.startsWith('../')) {
							href = browser.resolve(tab.url, href).url;
						}

						browser.navigate(href);

					}

				}

				return false;

			};

		});

	};


	const _init = function(browser) {

		browser.on('show', (tab) => {

			let url = _get_url(browser, tab, false);
			if (url !== null && webview !== null) {

				if (webview.src !== url) {

					setTimeout(() => {
						webview.src = url;
					}, 0);

				}

			}

		});

		browser.on('refresh', (tab, tabs, refresh) => {

			let url = _get_url(browser, tab, refresh);
			if (url !== null && webview !== null) {

				setTimeout(() => {
					webview.src = url;
				}, 0);

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

	global.browser ? _init(global.browser) : global.DELAYED.push(_init);

})(typeof window !== 'undefined' ? window : this);

