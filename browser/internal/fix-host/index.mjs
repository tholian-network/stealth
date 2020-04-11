
import { init    } from '../settings/hosts.mjs';
import { Element } from '../../design/Element.mjs';
import { flags   } from '../../source/ENVIRONMENT.mjs';

const code = Element.query('code[data-key="domain"]');



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

})(typeof window !== 'undefined' ? window : this);

