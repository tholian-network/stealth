
import { isArray, isBuffer, isNumber, isObject, isString } from '../extern/base.mjs';
import { Element                                         } from '../design/Element.mjs';
import { ENVIRONMENT                                     } from '../source/ENVIRONMENT.mjs';



const CACHE    = {};
const ELEMENTS = {
	search: {
		button:  Element.query('#search [data-action="search"]'),
		element: Element.query('#search'),
		query:   Element.query('#search [data-key="search-query"]')
	},
	results: {
		element: Element.query('#results'),
		list:    Element.query('#results ul[data-key="results-list"]')
	}
};

const render = (results) => {

	ELEMENTS.results.element.state('active');
	ELEMENTS.results.list.query('li', true).forEach((item) => item.erase());

	results.forEach((result) => {

		let item = new Element('li', [
			'<b>' + result['title'] + '</b>',
			'<span>' + result['content'] + '</span>',
			'<a href="' + result['url'] + '">' + result['url'] + '</a>'
		]);

		item.render(ELEMENTS.results.list);

	});

};

const search = (query) => {

	browser.download('https://searx.prvcy.eu/search?q=' + encodeURIComponent(query) + '&format=json', (response) => {

		let cache = CACHE[query] || null;
		if (cache === null) {
			cache = CACHE[query] = [];
		}

		if (isBuffer(response.payload) === true) {

			let data = null;

			try {
				data = JSON.parse(response.payload.toString('utf8'));
			} catch (err) {
				data = null;
			}

			if (isObject(data) === true && isArray(data.results) === true) {

				data.results.map((result) => {

					if (
						isString(result['url']) === true
						&& isString(result['title']) === true
						&& isString(result['content']) === true
						&& isNumber(result['score']) === true
					) {
						return {
							url:     result['url'],
							title:   result['title'],
							content: result['content'],
							score:   result['score']
						};
					}

					return null;

				}).filter((result) => result !== null).forEach((result) => {

					let other = cache.find((c) => c.url === result.url) || null;
					if (other !== null) {
						other.score = result.score;
					} else {
						cache.push(result);
					}

				});

			}

		}

		render(cache.sort((a, b) => {
			if (a.score > b.score) return -1;
			if (a.score < b.score) return  1;
			return 0;
		}));

	});

};



let browser = window.parent.BROWSER || null;
if (browser !== null) {

	ELEMENTS.search.query.state('enabled');

	ELEMENTS.search.button.on('click', () => {

		let query = ELEMENTS.search.query.value();
		if (query.trim().length > 3) {
			search(query);
		}

	});


	if (isString(ENVIRONMENT.flags.query) === true) {

		let query = decodeURIComponent(ENVIRONMENT.flags.query);
		if (query.trim().length > 3) {
			ELEMENTS.search.query.value(query);
			ELEMENTS.search.button.emit('click');
		}

	}

}
