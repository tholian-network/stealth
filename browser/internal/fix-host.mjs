
import { REFERENCE, init, listen, render } from './internal.mjs';



const elements = {
	wizard: document.querySelector('#fix-host'),
	hosts:  document.querySelector('#fix-host table tbody')
};

const _on_update = function(settings, host) {

	let cache = settings.hosts.find((h) => h.domain === host.domain) || null;
	if (cache !== null) {
		cache.ipv4 = host.ipv4;
		cache.ipv6 = host.ipv6;
	} else if (cache === null) {
		settings.hosts.push(host);
	}

	elements.hosts.innerHTML = render('host', host, [ 'refresh' ]);

};



init([
	elements.wizard,
	elements.hosts
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

						if (host !== null) {
							_on_update(browser.settings, host);
						}

						done(host !== null);

					});

				} else {
					done(false);
				}

			} else {
				done(false);
			}

		});


		if (REFERENCE.domain !== null) {

			browser.client.services.host.read({
				domain:    REFERENCE.domain,
				subdomain: REFERENCE.subdomain,
				host:      REFERENCE.host
			}, (host) => {

				if (host !== null) {
					_on_update(browser.settings, host);
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

