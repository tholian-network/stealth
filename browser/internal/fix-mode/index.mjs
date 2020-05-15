
import { init            } from '../settings/sites.mjs';
import { Element, access } from '../../internal/index.mjs';
import { ENVIRONMENT     } from '../../source/ENVIRONMENT.mjs';
import { URL             } from '../../source/parser/URL.mjs';

const code   = Element.query('article code[data-key="url"]');
const button = Element.query('article button[data-key]');



let browser = access('browser');
if (browser !== null) {

	let domain = null;

	if (ENVIRONMENT.flags.url.domain !== null) {

		if (ENVIRONMENT.flags.url.subdomain !== null) {
			domain = ENVIRONMENT.flags.url.subdomain + '.' + ENVIRONMENT.flags.url.domain;
		} else {
			domain = ENVIRONMENT.flags.url.domain;
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
		code.value(URL.render(ENVIRONMENT.flags.url));
	}

	if (button !== null) {
		button.attr('data-key', 'mode.' + ENVIRONMENT.flags.url.mime.type);
	}

	init(browser, {
		modes: [ cache ]
	}, [ 'save' ]);

}

