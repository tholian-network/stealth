
import { BROWSER, REFERENCE, init, listen, render } from './internal.mjs';



const elements = {
	wizard:  document.querySelector('#fix-host'),
	hosts:   document.querySelector('#fix-host table tbody'),
	footer:  document.querySelector('footer'),
	refresh: document.querySelector('footer #footer-refresh')
};

const _update = function(browser, host) {

	let cache = browser.settings.hosts.find(h => h.domain === host.domain) || null;
	if (cache !== null) {
		cache.ipv4 = host.ipv4;
		cache.ipv6 = host.ipv6;
	} else if (cache === null) {
		browser.settings.hosts.push(host);
	}

	elements.hosts.innerHTML = render('host', host, false);

};



init([
	elements.wizard,
	elements.hosts,
	elements.footer,
	elements.refresh
], (browser, result) => {

	if (result === true) {

		listen(elements.hosts, (action, data, done) => {

			let service = browser.client.services.host || null;
			if (service !== null) {

				if (action === 'refresh') {

					service.refresh({
						domain:    REFERENCE.domain,
						subdomain: REFERENCE.subdomain,
						host:      REFERENCE.host
					}, (host) => {

						done(true);

						if (host !== null) {
							_update(browser, host);
						}

					});

				} else {
					done(false);
				}

			} else {
				done(false);
			}

		});


		elements.refresh.onclick = () => browser.refresh();
		elements.footer.className = 'active';


		if (REFERENCE.domain !== null) {

			browser.client.services.host.read({
				domain:    REFERENCE.domain,
				subdomain: REFERENCE.subdomain,
				host:      REFERENCE.host
			}, (host) => {

				if (host !== null) {
					_update(browser, host);
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

