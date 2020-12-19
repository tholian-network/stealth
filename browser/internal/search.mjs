
import { isString    } from '../extern/base.mjs';
import { Element     } from '../design/Element.mjs';
import { Search      } from '../internal/search/Search.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';



let browser = window.parent.BROWSER || null;
if (browser !== null) {

	let search_widget = Search.from({ keywords: '', results: [] }, [ 'search' ]);
	if (search_widget !== null) {

		let body = Element.query('body');
		if (body !== null) {
			search_widget.render(body);
		}

	}

	if (isString(ENVIRONMENT.flags.keywords) === true) {

		let keywords = decodeURIComponent(ENVIRONMENT.flags.keywords).trim();
		if (keywords.length > 3) {

			search_widget.value({
				keywords: keywords,
				results:  []
			});

			search_widget.buttons.search.emit('click');

		}

	}

}

