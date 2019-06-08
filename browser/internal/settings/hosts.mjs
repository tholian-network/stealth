
import { isArray, isObject } from '../../source/POLYFILLS.mjs';

import { Element } from '../../design/Element.mjs';

const ELEMENTS = {
	input:  Element.query('#hosts table tfoot'),
	output: Element.query('#hosts table tbody'),
	search: Element.query('#hosts-search input')
};

export const listen = function(browser, callback) {

	console.log(ELEMENTS);

	let input = ELEMENTS.input || null;
	if (input !== null) {

		input.on('click', (e) => {

			console.log(e);

		});

	}

	// TODO: listen() implementation
};

export const render = (host, actions) => `
<tr data-visible="true">
	<td data-key="domain">${host.domain}</td>
	${actions.includes('save') === true ? '<td><textarea data-key="hosts" data-map="IP" placeholder="One IPv4/IPv6 per line">' + (host.hosts.map((h) => h.ip).join('\n')) + '</textarea></td>' : '<td data-key="hosts" data-map="IP">' + (host.hosts.map((h) => h.ip).join('<br>\n')) + '</td>' }
	<td>${actions.map((a) => '<button data-action="' + a + '"></button>').join('')}</td>
</tr>
`;

export const reset = () => {

	// TODO: reset input element

};

const sort = function(a, b) {

	let a_domains = a.domain.split('.').reverse();
	let b_domains = b.domain.split('.').reverse();

	let max = Math.max(a_domains.length, b_domains.length);

	for (let d = 0; d < max; d++) {

		let a_domain = a_domains[d] || null;
		let b_domain = b_domains[d] || null;

		if (a_domain === null) {

			if (b_domain === null) {
				return 0;
			} else {
				return -1;
			}

		} else if (b_domain === null) {
			return 1;
		}

		if (a_domain > b_domain) return  1;
		if (b_domain > a_domain) return -1;

	}

	return 0;

};

const update = function(settings, actions) {

	settings = isObject(settings) ? settings : {};
	actions  = isArray(actions)   ? actions  : [ 'refresh', 'remove', 'save' ];


	let hosts = settings.hosts || null;
	if (hosts !== null) {
		ELEMENTS.output.value(hosts.sort(sort).map((host) => render(host, actions)));
	}

};



export const init = function(browser) {

	listen(browser, (action, data, done) => {

		let service = browser.client.services.host || null;
		if (service !== null) {

			if (action === 'refresh') {

				service.refresh(data, (host) => {

					if (host !== null) {

						let cache = browser.settings.hosts.find((h) => h.domain === host.domain) || null;
						if (cache !== null) {
							cache.hosts = host.hosts;
						}

						update({
							hosts: browser.settings.hosts
						});

					}

					done(host !== null);

				});

			} else if (action === 'confirm') {

				let cache = browser.settings.hosts.find((h) => h.domain === data.domain) || null;
				if (cache !== null) {
					cache.hosts = data.hosts;
					data = cache;
				}

				service.save(data, (result) => {

					if (result === true) {

						browser.settings.hosts.push(data);

						update({
							hosts: browser.settings.hosts
						});

						reset(ELEMENTS.input);

					}

					done(result);

				});

			} else if (action === 'remove') {

				service.remove(data, (result) => {

					if (result === true) {

						let cache = browser.settings.hosts.find((h) => h.domain === data.domain) || null;
						if (cache !== null) {

							let index = browser.settings.hosts.indexOf(cache);
							if (index !== -1) {
								browser.settings.hosts.splice(index, 1);
							}

							update({
								hosts: browser.settings.hosts
							});

						}

					}

					done(result);

				});

			} else if (action === 'save') {

				service.save(data, (result) => {

					if (result === true) {

						let cache = browser.settings.hosts.find((h) => h.domain === data.domain) || null;
						if (cache !== null) {
							cache.hosts = data.hosts;
						}

					}

					done(result);

				});

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});

	reset(ELEMENTS.input);

};

// TODO: Implement better listen() method

