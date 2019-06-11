
import { isArray, isObject } from '../../source/POLYFILLS.mjs';

import { Element } from '../../design/Element.mjs';

const ELEMENTS = {
	input: {
		domain:     Element.query('#peers table tfoot *[data-key="domain"]'),
		connection: Element.query('#peers table tfoot *[data-key="connection"]'),
		button:     Element.query('#peers table tfoot *[data-action]')
	},
	label:  Element.query('#peers-filter label'),
	output: Element.query('#peers table tbody'),
	search: Element.query('#peers-filter input')
};

export const listen = function(browser, callback) {

	let button = ELEMENTS.input.button || null;
	if (button !== null) {

		console.log(button);

		button.on('click', () => {

			if (button.attr('data-action') === 'refresh') {

				if (button.state() !== 'disabled') {

					button.state('disabled');
					button.state('busy');


					// TODO: If IP.isIP(domain)
					// TODO: isHostname(domain)


					callback('refresh', {
						'domain': ELEMENTS.input.domain.value()
					}, (result) => {

						console.log(result);

						if (result !== null && result.hosts.length > 0) {

							button.attr('data-action', 'confirm');

						}

						button.state('enabled');
						button.state(result === true ? '' : 'error');

					});

				}

			} else if (button.attr('data-action') === 'confirm') {

				// TODO: callback with domain and connection
				// TODO: reset();

			}

		});

	}

	let output = ELEMENTS.output || null;
	if (output !== null) {

		output.on('click', () => {
			// TODO: Handle clicks on rendered buttons
		});

	}

	let search = ELEMENTS.search || null;
	if (search !== null) {

		search.on('change', () => {
			update(browser.settings);
		});

	}

};

const render = (peer, actions, visible) => `
<tr data-visible="${visible}">
	<td data-key="domain">${peer.domain}</td>
	<td><button data-key="connection" data-val="${peer.connection}" disabled></button></td>
	<td>${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}</td>
</tr>
`;

export const reset = () => {

	ELEMENTS.input.domain.value(null);
	ELEMENTS.input.connection.value('offline');
	ELEMENTS.input.connection.state('disabled');
	ELEMENTS.input.button.attr('data-action', 'refresh');

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
	actions  = isArray(actions)   ? actions  : [ 'refresh', 'remove' ];


	let peers = settings.peers || null;
	if (peers !== null) {

		let visible = 0;
		let total   = peers.length;

		let search = ELEMENTS.search || null;
		if (search !== null) {

			let value = search.value() || '';
			if (value !== '') {

				ELEMENTS.output.value(peers.sort(sort).map((peer) => {

					if (peer.domain.includes(value)) {
						visible++;
						return render(peer, actions, true);
					} else {
						return render(peer, actions, false);
					}

				}));

			} else {

				ELEMENTS.output.value(peers.sort(sort).map((peer) => {

					if (peer.domain.includes('.') === false) {
						visible++;
						return render(peer, actions, true);
					} else {
						return render(peer, actions, false);
					}

				}));

			}

		} else {

			ELEMENTS.output.value(peers.sort(sort).map((peer) => {
				visible++;
				return render(peer, actions, true);
			}));

		}

		let label = ELEMENTS.label || null;
		if (label !== null) {
			label.value(visible + ' out of ' + total + ' Peers.');
		}

	}

};



export const init = (browser) => {

	listen(browser, (action, data, done) => {

		let service = browser.client.services.peer || null;
		if (service !== null) {

			if (action === 'refresh') {

				service.refresh(data, (peer) => {

					if (peer !== null) {

					}

				});

			} else if (action === 'confirm') {
			} else if (action === 'remove') {
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

