
import { init    } from '../settings/sites.mjs';
import { Element } from '../../design/Element.mjs';
import { flags   } from '../../source/ENVIRONMENT.mjs';
import { URL     } from '../../source/parser/URL.mjs';

const code   = Element.query('article code[data-key="url"]');
const button = Element.query('article button[data-key]');



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
			code.value(URL.render(flags.url));
		}

		if (button !== null) {
			button.attr('data-key', 'mode.' + flags.url.mime.type);
		}

		init(browser, {
			modes: [ cache ]
		}, [ 'save' ]);

	}

})(typeof window !== 'undefined' ? window : this);

