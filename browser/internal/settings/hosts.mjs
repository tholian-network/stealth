
import { isArray, isObject } from '../../source/POLYFILLS.mjs';

import { Element } from '../../design/Element.mjs';

const ELEMENTS = {
	input: {
		domain: Element.query('#hosts table tfoot *[data-key="domain"]'),
		hosts:  Element.query('#hosts table tfoot *[data-key="hosts"]'),
		button: Element.query('#hosts table tfoot *[data-action]')
	},
	label:  Element.query('#hosts-filter label'),
	output: Element.query('#hosts table tbody'),
	search: Element.query('#hosts-filter input')
};

export const listen = (browser, callback) => {

	let button = ELEMENTS.input.button || null;
	if (button !== null) {

		button.on('click', () => {

			if (button.state() !== 'disabled') {

				button.state('disabled');
				button.state('busy');

				callback('save', {
					'domain': ELEMENTS.input.domain.value(),
					'hosts':  ELEMENTS.input.hosts.value()
				}, (result) => {

					button.state('enabled');
					button.state(result === true ? '' : 'error');

					reset();

				});

			}

		});

	}

	let output = ELEMENTS.output || null;
	if (output !== null) {

		output.on('click', (e) => {

			let target = e.target;
			let type   = target.tagName.toLowerCase();

			if (type === 'button') {

				let button  = Element.from(e.target, null, false);
				let action  = button.attr('data-action');
				let dataset = button.parent('tr');

				if (action !== null) {

					button.state('disabled');
					button.state('busy');

					callback(action, {
						'domain': dataset.query('*[data-key="domain"]').value(),
						'hosts':  dataset.query('*[data-key="hosts"]').value()
					}, (result) => {

						button.state('enabled');
						button.state(result === true ? '' : 'error');

					});

				}

			}

		});

	}

	let search = ELEMENTS.search || null;
	if (search !== null) {

		search.on('change', () => {
			update(browser.settings);
		});

	}

};

const render = (host, actions, visible) => `
<tr data-visible="${visible}">
	<td data-key="domain">${host.domain}</td>
	${actions.includes('save') === true ? '<td><textarea data-key="hosts" data-map="IP" placeholder="One IPv4/IPv6 per line">' + (host.hosts.map((h) => h.ip).join('\n')) + '</textarea></td>' : '<td data-key="hosts" data-map="IP">' + (host.hosts.map((h) => h.ip).join('<br>\n')) + '</td>' }
	<td>${actions.map((a) => '<button data-action="' + a + '"></button>').join('')}</td>
</tr>
`;

export const reset = () => {

	let domain = ELEMENTS.input.domain || null;
	if (domain !== null) {
		domain.value(null);
	}

	let hosts = ELEMENTS.input.hosts || null;
	if (hosts !== null) {
		hosts.value(null);
	}

	let button = ELEMENTS.input.button || null;
	if (button !== null) {
		button.state('enabled');
		button.state('');
	}

};

const sort = (a, b) => {

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

export const update = (settings, actions) => {

	settings = isObject(settings) ? settings : {};
	actions  = isArray(actions)   ? actions  : [ 'refresh', 'remove', 'save' ];


	let hosts = settings.hosts || null;
	if (hosts !== null) {

		let visible = 0;
		let total   = hosts.length;

		let search = ELEMENTS.search || null;
		if (search !== null) {

			let value = search.value() || '';
			if (value !== '') {

				ELEMENTS.output.value(hosts.sort(sort).map((host) => {

					if (host.domain.includes(value)) {
						visible++;
						return render(host, actions, true);
					} else {
						return render(host, actions, false);
					}

				}));

			} else {

				ELEMENTS.output.value(hosts.sort(sort).map((host) => {

					if (host.domain.includes('.') === false) {
						visible++;
						return render(host, actions, true);
					} else {
						return render(host, actions, false);
					}

				}));

			}

		} else {

			ELEMENTS.output.value(hosts.sort(sort).map((host) => {
				visible++;
				return render(host, actions, true);
			}));

		}

		let label = ELEMENTS.label || null;
		if (label !== null) {
			label.value(visible + ' out of ' + total + ' Hosts.');
		}

	}

};



export const init = (browser) => {

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
						} else {
							browser.settings.hosts.push(data);
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

	reset();

	update(browser.settings);

};

