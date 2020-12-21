
import { isString    } from '../extern/base.mjs';
import { Element     } from '../design/Element.mjs';
import { Search      } from '../internal/search/Search.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';



let browser = window.parent.BROWSER || null;
if (browser !== null) {

	let widget = Search.from({ keywords: '', results: [] }, [ 'search' ]);
	if (widget !== null) {

		let body = Element.query('body');
		if (body !== null) {
			widget.render(body);
		}


		if (isString(ENVIRONMENT.flags.keywords) === true) {

			let keywords = decodeURIComponent(ENVIRONMENT.flags.keywords).trim();
			if (keywords.length > 3) {

				widget.value({
					keywords: keywords,
					results:  []
				});

				widget.buttons.search.emit('click');

			}

		}

	}

}

