
const browser  = window.browser || parent.browser || null;
const doc      = window.document;
const elements = {
	wizard:  doc.querySelector('#fix-host'),
	hosts:   doc.querySelector('#fix-host table tbody'),
	footer:  doc.querySelector('footer'),
	refresh: doc.querySelector('footer #footer-refresh')
};
const REFERENCE = (function(query) {

	let url = null;

	if (query.startsWith('?')) {

		query.substr(1).split('&').map(t => t.split('=')).forEach(chunk => {

			if (chunk[0] === 'url') {
				url = decodeURIComponent(chunk[1]);
			}

		});

	}

	return browser.parse(url);

})(doc.location.search);



const _render_host = (host) => `
<td>${host.domain}</td>
<td>${(host.ipv4 !== null ? host.ipv4 : '(none)')}</td>
<td>${(host.ipv6 !== null ? host.ipv6 : '(none)')}</td>
<td><button class="icon-refresh" data-method="refresh"></button></td>
`;

const _update = function(host) {

	let cache = browser.settings.hosts.find(h => h.domain === host.domain) || null;
	if (cache !== null) {
		cache.ipv4 = host.ipv4;
		cache.ipv6 = host.ipv6;
	} else if (cache === null) {
		browser.settings.hosts.push(host);
	}

	let old_row = elements.hosts.querySelector('tr');
	if (old_row !== null) {
		old_row.parentNode.removeChild(old_row);
	}

	let new_row = doc.createElement('tr');
	new_row.innerHTML = _render_host(host);
	elements.hosts.appendChild(new_row);

};



const WIZARD = {

	init: function(browser) {

		if (elements.hosts !== null) {

			elements.hosts.addEventListener('click', e => {

				let element = e.target;
				let state   = element.className;
				let tagname = element.tagName.toLowerCase();
				if (tagname === 'button') {

					let method  = element.getAttribute('data-method') || null;
					let service = browser.client.services.host;
					if (service !== null && typeof service[method] === 'function') {

						element.className += ' busy';

						service[method]({
							domain:    REFERENCE.domain,
							subdomain: REFERENCE.subdomain,
							host:      REFERENCE.host
						}, response => {

							element.className = state;

							if (typeof response === 'boolean') {
								// Do nothing
							} else if (response !== null) {
								_update(response);
							}

						});

					} else {
						element.setAttribute('disabled', true);
					}

				}

			});

		}


		if (elements.footer !== null && elements.refresh !== null) {
			elements.refresh.onclick = () => browser.refresh();
			elements.footer.className = 'active';
		}


		if (REFERENCE.domain !== null) {

			browser.client.services.host.read({
				domain:    REFERENCE.domain,
				subdomain: REFERENCE.subdomain,
				host:      REFERENCE.host
			}, host => {

				if (host !== null) {

					_update(host);

				} else {

					let element = elements.wizard || null;
					if (element !== null) {
						element.parentNode.removeChild(element);
					}

				}

			});

		} else {

			let element = elements.wizard || null;
			if (element !== null) {
				element.parentNode.removeChild(element);
			}

		}

	}

};


export { WIZARD };


if (browser !== null) {
	WIZARD.init(browser);
} else {

	let element = elements.wizard || null;
	if (element !== null) {
		element.parentNode.removeChild(element);
	}

}

