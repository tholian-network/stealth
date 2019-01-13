
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



	const _get_url = function(tab) {

		let url = null;

		if (tab.url.startsWith('https://') || tab.url.startsWith('http://')) {
			url = '/stealth/' + tab.url.split('/').slice(2).join('/');
		} else if (tab.url.startsWith('stealth:')) {

			let tmp1 = tab.url.split('?')[0].split(':')[1];
			let tmp2 = tab.url.split('?')[1] || '';

			if (tmp1.endsWith('/')) {
				tmp1 = tmp1.substr(0, tmp1.length - 1);
			}

			url = '/browser/internal/' + tmp1 + '.html';

			if (tmp2 !== '') {
				url += '?' + tmp2;
			}

		} else if (tab.url.includes('://')) {
			url = '/stealth/' + tab.url.substr(tab.url.indexOf('://') + 3).split('/').join('/');
		} else {
			url = '/stealth/' + tab.url;
		}

		return url;

	};

	const _init_events = function(scope) {

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

					let tab = browser.create('stealth:settings');
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

				} else if (ctrl === true) {

					// XXX: Stupid Browser be stupid, yo

					e.preventDefault();
					e.stopPropagation();

				}

			};

		}

	};

	const _init = function(browser) {

		browser.on('show', (tab, tabs) => {

			let url = _get_url(tab);
			if (url !== null) {

				if (webview.src !== url) {
					webview.src = url;
				}

			}

		});


		_init_events(global);


		if (webview !== null) {

			let win = webview.contentWindow || null;
			if (win !== null) {
				_init_events(win);
			}

		}

	};



	if (webview !== null) {

		webview.onload = _ => {

			let win = webview.contentWindow || null;
			if (win !== null) {
				_init_events(win);
			}

		};

	}



	/*
	 * INIT
	 */

	global.browser ? _init(browser) : BROWSER_BINDINGS.push(_init);

})(typeof window !== 'undefined' ? window : this);

