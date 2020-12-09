
import { Element     } from '../design/Element.mjs';
import { Image       } from '../design/widget/Image.mjs';
// import { Audio       } from '../design/widget/Audio.mjs';
// import { Video       } from '../design/widget/Video.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { URL         } from '../source/parser/URL.mjs';



let browser = window.parent.BROWSER || null;
if (browser !== null) {

	if (URL.isURL(ENVIRONMENT.flags.url) === true) {

		let body = Element.query('body');
		if (body !== null) {

			let widget = null;

			let url = ENVIRONMENT.flags.url;
			if (url.mime.type === 'image') {
				widget = Image.from({ source: url });
			} else if (url.mime.type === 'audio') {
				// widget = Audio.from({ source: url });
			} else if (url.mime.type === 'video') {
				// widget = Video.from({ source: url });
			}

			if (widget !== null) {
				widget.render(body);
			}

		}

	}

}

