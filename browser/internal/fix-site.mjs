
import { BROWSER, REFERENCE, init, listen, render } from './internal.mjs';



const elements = {
	wizard:  document.querySelector('#fix-site'),
	sites:   document.querySelector('#fix-site table tbody'),
	footer:  document.querySelector('footer'),
	refresh: document.querySelector('footer #footer-refresh')
};

const _update = function(browser, site) {
	elements.sites.innerHTML = render('site', site, [ 'save' ]);
};

const _update_config = function(config) {

	Object.keys(config.mode).forEach(mode => {

		let button = elements.sites.querySelector('button[data-key="mode.' + mode + '"]');
		if (button !== null) {
			button.setAttribute('data-val', '' + config.mode[mode]);
		}

	});

};



init([
	elements.wizard,
	elements.sites,
	elements.footer,
	elements.refresh
], (browser, result) => {

	if (result === true) {

		listen(elements.sites, (action, data, done) => {

			let service = browser.client.services.site || null;
			if (service !== null) {

				if (action === 'save') {

					let result = browser.set(data);
					if (result === true) {
						done(true);
					} else {
						done(false);
					}

				} else {
					done(false);
				}

			} else {
				done(false);
			}

		});


		elements.refresh.onclick = () => browser.refresh();
		elements.footer.className = 'active';


		browser.on('change', (tab) => {
			_update_config(tab.config);
		});


		if (REFERENCE.domain !== null) {

			browser.client.services.site.read({
				domain:    REFERENCE.domain,
				subdomain: REFERENCE.subdomain,
				host:      REFERENCE.host
			}, site => {

				if (site !== null) {

					_update(browser, site);

				} else {

					let config = browser.tab.config;

					if (REFERENCE.subdomain !== null) {
						config.domain = REFERENCE.subdomain + '.' + REFERENCE.domain;
					} else {
						config.domain = REFERENCE.domain;
					}

					_update(browser, config);

				}

			});

		}

	} else {

		let element = elements.wizard || null;
		if (element !== null) {
			element.parentNode.removeChild(element);
		}

	}

});

