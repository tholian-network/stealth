
import { init    } from '../settings/hosts.mjs';
import { Element } from '../../design/Element.mjs';
import { URL     } from '../../source/parser/URL.mjs';

const code   = Element.query('code[data-key="domain"]');
const global = (typeof window !== 'undefined' ? window : this);
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

	let cache = browser.settings.hosts.find((h) => h.domain === domain) || null;
	if (cache === null) {

		cache = {
			domain: domain,
			hosts:  []
		};

	}

	if (code !== null) {
		code.value(domain);
	}

	init(browser, {
		hosts: [ cache ]
	}, [ 'refresh', 'save' ]);

}

