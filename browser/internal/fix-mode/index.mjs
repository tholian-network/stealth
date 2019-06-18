
import { init    } from '../settings/sites.mjs';
import { Element } from '../../design/Element.mjs';
import { URL     } from '../../source/parser/URL.mjs';

const code   = Element.query('article code[data-key="url"]');
const button = Element.query('article button[data-key]');
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

	let cache = browser.settings.modes.find((m) => m.domain === domain) || null;
	if (cache === null) {

		cache = {
			domain: domain,
			mode:   {
				text:  false,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		};

	}

	if (code !== null) {
		code.value(URL.render(STATUS.url));
	}

	if (button !== null) {
		button.attr('data-key', 'mode.' + STATUS.url.mime.type);
	}

	init(browser, {
		modes: [ cache ]
	}, [ 'save' ]);

}

