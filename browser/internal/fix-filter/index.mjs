
import { init    } from '../settings/sites.mjs';
import { Element } from '../../design/Element.mjs';
import { flags   } from '../../source/ENVIRONMENT.mjs';
import { URL     } from '../../source/parser/URL.mjs';

const assistant = Element.query('#help-assistant');
const code      = Element.query('article code[data-key="url"]');
const ELEMENTS  = {
	domain: Element.query('#sites-filters tfoot *[data-key="domain"]'),
	filter: {
		prefix: Element.query('#sites-filters tfoot *[data-key="filter.prefix"]'),
		midfix: Element.query('#sites-filters tfoot *[data-key="filter.midfix"]'),
		suffix: Element.query('#sites-filters tfoot *[data-key="filter.suffix"]')
	}
};



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



(function(global) {

	let browser = global.parent.BROWSER || global.BROWSER || null;
	if (browser !== null) {

		let domain = null;

		if (flags.url.domain !== null) {

			if (flags.url.subdomain !== null) {
				domain = flags.url.subdomain + '.' + flags.url.domain;
			} else {
				domain = flags.url.domain;
			}

		}

		let cache = browser.settings.filters.filter((f) => f.domain === domain) || null;
		if (cache === null) {
			cache = [];
		}

		if (code !== null) {
			code.value(URL.render(flags.url));
		}


		if (assistant !== null && flags.url.path !== '/') {

			let folders = flags.url.path.split('/').filter((v) => v !== '');
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


})(typeof window !== 'undefined' ? window : this);

