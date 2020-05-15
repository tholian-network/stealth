
import { init            } from '../settings/hosts.mjs';
import { Element, access } from '../../internal/index.mjs';
import { ENVIRONMENT     } from '../../source/ENVIRONMENT.mjs';

const code = Element.query('code[data-key="domain"]');



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

