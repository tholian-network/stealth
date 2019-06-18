
import { init    } from '../settings/sites.mjs';
import { Element } from '../../design/Element.mjs';
import { URL     } from '../../source/parser/URL.mjs';

const assistant = Element.query('#help-assistant');
const code      = Element.query('article code[data-key="url"]');
const global    = (typeof window !== 'undefined' ? window : this);
const ELEMENTS  = {
	domain: Element.query('#sites-filters tfoot *[data-key="domain"]'),
	filter: {
		prefix: Element.query('#sites-filters tfoot *[data-key="filter.prefix"]'),
		midfix: Element.query('#sites-filters tfoot *[data-key="filter.midfix"]'),
		suffix: Element.query('#sites-filters tfoot *[data-key="filter.suffix"]')
	}
};
const STATUS = ((search) => {

	let status = {
		url: URL.parse()
	};

	if (search.startsWith('?')) {

		search.substr(1).split('&').map((ch) => ch.split('=')).forEach((ch) => {

			if (ch[0] === 'url') {
				status[ch[0]] = URL.parse(decodeURIComponent(ch.slice(1).join('=')));
			} else {
				status[ch[0]] = ch[1];
			}

		});

	}

	return status;

})(document.location.search);



const render_label = (filter) => {

	let label = [];

	if (filter.filter.prefix !== null) {
		label.push('start with <code>' + filter.filter.prefix + '</code>');
	}

	if (filter.filter.midfix !== null) {
		label.push('include <code>' + filter.filter.midfix + '</code>');
	}

	if (filter.filter.suffix !== null) {
		label.push('end with <code>' + filter.filter.suffix + '</code>');
	}

	return 'Allow URLs that ' + label.join(' and ') + '.';

};

const render_choice = (filter) => `
<input id="${filter.id}" name="help-assistant-choices" type="radio" data-key="filter" data-val="${filter.filter.prefix}|${filter.filter.midfix}|${filter.filter.suffix}">
<label for="${filter.id}">${render_label(filter)}</label>
`;



let browser = global.parent.BROWSER || global.BROWSER || null;
if (browser !== null) {

	let domain = null;

	if (STATUS.url.domain !== null) {

		if (STATUS.url.subdomain !== null) {
			domain = STATUS.url.subdomain + '.' + STATUS.url.domain;
		} else {
			domain = STATUS.url.domain;
		}

	}

	let cache = browser.settings.filters.filter((f) => f.domain === domain) || null;
	if (cache === null) {
		cache = [];
	}

	if (code !== null) {
		code.value(URL.render(STATUS.url));
	}


	if (assistant !== null && STATUS.url.path !== '/') {

		let folders = STATUS.url.path.split('/').filter((v) => v !== '');
		let file    = folders.pop();
		let choices = [];

		choices.push({ id: 'help-assistant-' + choices.length, domain: domain, filter: { prefix: '/' + folders.join('/'), midfix: null, suffix: null }});
		choices.push({ id: 'help-assistant-' + choices.length, domain: domain, filter: { prefix: '/' + folders.join('/'), midfix: null, suffix: file }});

		if (folders.length > 0) {
			choices.push({ id: 'help-assistant-' + choices.length, domain: domain, filter: { prefix: null, midfix: folders.join('/'), suffix: null }});
			choices.push({ id: 'help-assistant-' + choices.length, domain: domain, filter: { prefix: null, midfix: folders.join('/'), suffix: file }});
		}

		choices.push({ id: 'help-assistant-' + choices.length, domain: domain, filter: { prefix: null, midfix: null, suffix: file }});
		choices.push({ id: 'help-assistant-' + choices.length, domain: domain, filter: { prefix: null, midfix: null, suffix: folders.join('/') + '/' + file }});

		assistant.on('click', (e) => {

			let target = e.target;
			let type   = target.tagName.toLowerCase();

			if (type === 'input') {

				let input  = Element.from(target, null, false);
				let filter = input.attr('data-val').split('|');

				if (filter.length === 3) {

					ELEMENTS.domain.value(domain);

					ELEMENTS.filter.prefix.value(filter[0] === 'null' ? null : filter[0]);
					ELEMENTS.filter.midfix.value(filter[1] === 'null' ? null : filter[1]);
					ELEMENTS.filter.suffix.value(filter[2] === 'null' ? null : filter[2]);

				}

			}

		});

		assistant.value(choices.map((c) => render_choice(c)).join(''));

	}

	init(browser, {
		filters: cache
	}, [ 'remove' ]);

}

