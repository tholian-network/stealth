
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { Element     } from '../design/Element.mjs';
import { Host        } from '../design/card/Host.mjs';
import { URL         } from '../source/parser/URL.mjs';



let domain  = URL.toDomain(ENVIRONMENT.flags.url);
let browser = window.parent.BROWSER || null;

if (browser !== null && domain !== null) {

	let host   = browser.settings.hosts.find((h) => h.domain === domain) || { domain: domain };
	let body   = Element.query('body');
	let widget = new Host(browser, [ 'refresh', 'save' ]);

	if (body !== null && widget !== null) {
		widget.render(body);
		widget.value(host);
	}

}

