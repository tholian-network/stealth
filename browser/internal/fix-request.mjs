
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { Element     } from '../design/Element.mjs';
// import { Archive     } from './fix-request/Archive.mjs';
// import { Peers       } from './fix-request/Peers.mjs';
import { URL         } from '../source/parser/URL.mjs';



let domain  = URL.toDomain(ENVIRONMENT.flags.url);
let browser = window.parent.BROWSER || null;

if (browser !== null && domain !== null) {

	let body  = Element.query('body');
	let code  = ENVIRONMENT.flags.code  || null;
	let cause = ENVIRONMENT.flags.cause || null;

	if (code !== null) {
		body.query('[data-key="code"]').value(code);
	}

	if (cause !== null) {

		body.query('p[data-key="cause"]').forEach((element) => {

			if (element.value() !== cause) {
				element.erase();
			}

		});

	} else {

		body.query('p[data-key="cause"]').forEach((element) => {
			element.erase();
		});

	}

}

