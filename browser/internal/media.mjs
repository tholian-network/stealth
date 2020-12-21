
import { Element     } from '../design/Element.mjs';
import { Media       } from '../internal/media/Media.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { URL         } from '../source/parser/URL.mjs';



let browser = window.parent.BROWSER || null;
if (browser !== null) {

	let widget = Media.from({ source: null }, [ 'refresh', 'fullscreen', 'download' ]);
	if (widget !== null) {

		let body = Element.query('body');
		if (body !== null) {
			widget.render(body);
		}


		if (URL.isURL(ENVIRONMENT.flags.url) === true) {

			widget.value({
				source: ENVIRONMENT.flags.url
			});

		}

	}

}

