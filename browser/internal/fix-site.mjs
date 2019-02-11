
import { BROWSER, REFERENCE, init, listen, render } from './internal.mjs';



const elements = {
	wizard:  document.querySelector('#fix-site'),
	sites:   document.querySelector('#fix-site table tbody'),
	footer:  document.querySelector('footer'),
	refresh: document.querySelector('footer #footer-refresh')
};

const _on_update = function(settings, site) {
	elements.sites.innerHTML = render('site', site, [ 'save' ]);
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
					done(browser.set(data) === true);
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

			Object.keys(tab.config.mode).forEach(mode => {

				let button = elements.sites.querySelector('button[data-key="mode.' + mode + '"]');
				if (button !== null) {
					button.setAttribute('data-val', '' + tab.config.mode[mode]);
				}

			});

		});


		if (REFERENCE.domain !== null) {

			browser.client.services.site.read({
				domain:    REFERENCE.domain,
				subdomain: REFERENCE.subdomain,
				host:      REFERENCE.host
			}, site => {

				if (site === null) {

					site = browser.tab.config;

					if (REFERENCE.subdomain !== null) {
						site.domain = REFERENCE.subdomain + '.' + REFERENCE.domain;
					} else {
						site.domain = REFERENCE.domain;
					}

				}

				_on_update(browser.settings, site);

			});

		}

	} else {

		let element = elements.wizard || null;
		if (element !== null) {
			element.parentNode.removeChild(element);
		}

	}

});

