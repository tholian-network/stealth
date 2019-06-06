
import { Element } from '../../design/Element.mjs';

const ELEMENTS = {
	input:  Element.query('#hosts table tfoot'),
	output: Element.query('#hosts table tbody'),
	search: Element.query('#hosts-search input')
};

export const listen = function(browser, callback) {
	// TODO: listen() implementation
};

export const render = (host, actions) => `
<tr data-visible="true">
	<td data-key="domain">${host.domain}</td>
	${actions.includes('save') === true ? '<td><textarea data-key="hosts" data-map="IP" placeholder="One IPv4/IPv6 per line">' + (host.hosts.map((h) => h.ip).join('\n')) + '</textarea></td>' : '<td data-key="hosts" data-map="IP">' + (host.hosts.map((h) => h.ip).join('<br>\n')) + '</td>' }
	<td>${actions.map((a) => '<button data-action="' + a + '"></button>').join('')}</td>
</tr>
`;

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

const update = function(settings) {

	let hosts = settings.hosts || null;
	if (hosts !== null) {
		ELEMENTS.output.value(hosts.sort(sort).map((host) => render(host)));
		// TODO: on_search('hosts', elements.hosts.search.value);
	}

};



export const init = function(browser) {

	listen(browser, (action, data, done) => {


	});

};

// TODO: Implement better listen() method

