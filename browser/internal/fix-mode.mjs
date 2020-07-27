
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { Element     } from '../design/Element.mjs';
import { Mode        } from '../design/card/Mode.mjs';
import { URL         } from '../source/parser/URL.mjs';



let domain  = URL.toDomain(ENVIRONMENT.flags.url);
let browser = window.parent.BROWSER || null;

if (browser !== null && domain !== null) {

	let mode   = browser.settings.modes.find((m) => m.domain === domain) || { domain: domain };
	let body   = Element.query('body');
	let widget = new Mode(browser, [ 'save' ]);

	if (body !== null && widget !== null) {

		widget.render(body);
		widget.value(mode);

		setTimeout(() => {
			widget.emit('show');
		}, 0);

	}


	let button = Element.query('article:nth-of-type(2) button');
	if (button !== null) {

		let type = ENVIRONMENT.flags.url.mime.type;

		button.attr('data-key', 'mode.' + type);
		button.attr('title',    type.substr(0, 1).toUpperCase() + type.substr(1) + ' Media Type');

	}

}

