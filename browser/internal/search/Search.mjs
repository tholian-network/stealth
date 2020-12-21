
import { Element                                         } from '../../design/Element.mjs';
import { Widget                                          } from '../../design/Widget.mjs';
import { isArray, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';



const isResult = function(result) {

	if (
		isObject(result) === true
		&& isString(result['url']) === true
		&& isString(result['title']) === true
		&& isString(result['content']) === true
		&& isNumber(result['score']) === true
	) {
		return true;
	}

	return false;

};

const toResult = function(result) {

	if (
		isObject(result) === true
		&& isString(result['url']) === true
		&& isString(result['title']) === true
		&& isString(result['content']) === true
		&& isNumber(result['score']) === true
	) {

		return {
			url:     result['url'],
			title:   result['title'],
			content: result['content'],
			score:   parseFloat((result['score']).toFixed(2))
		};

	}

	return null;

};

const toMap = function(result) {

	result = isResult(result) ? result : null;


	if (result !== null) {

		let element = new Element('li', [
			'<h4 data-key="title">Title</h4>',
			'<a data-key="url" href="#">URL</a>',
			'<span data-key="score">0</span>',
			'<code data-key="content">Content</code>'
		]);

		let model = {
			title:   element.query('[data-key="title"]'),
			content: element.query('[data-key="content"]'),
			score:   element.query('[data-key="score"]'),
			url:     element.query('[data-key="url"]')
		};

		model.title.value(result.title);
		model.content.value(result.content);
		model.score.value(result.score);
		model.url.value(result.url);
		model.url.attr('href', result.url);


		return {
			result:  result,
			element: element,
			model:   model
		};

	}


	return null;

};



const Search = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'search' ];
	this.element = new Element('browser-widget-search', [
		'<h3>Web Search</h3>',
		'<browser-widget-search-header>',
		'<input type="text" data-key="keywords" placeholder="Search for keywords..." disabled/>',
		'</browser-widget-search-header>',
		'<browser-widget-search-article>',
		'<ul></ul>',
		'</browser-widget-search-article>',
		'<browser-widget-search-footer>',
		'<button title="Search the Web" data-action="search"></button>',
		'</browser-widget-search-footer>'
	]);

	this.buttons = {
		search: this.element.query('button[data-action="search"]')
	};

	this.model = {
		keywords: this.element.query('[data-key="keywords"]'),
		results:  []
	};

	Widget.call(this);


	this.model.keywords.on('keyup', () => {
		this.model.keywords.validate();
	});

	this.element.on('update', () => {

		this.buttons.search.erase();


		if (this.actions.includes('search')) {

			this.model.keywords.attr('required', true);
			this.model.keywords.state('enabled');

		} else {

			this.model.keywords.attr('required', null);
			this.model.keywords.state('disabled');

		}


		let footer = this.element.query('browser-widget-search-footer');

		if (this.actions.includes('search')) {
			this.buttons.search.render(footer);
		}

	});


	if (this.buttons.search !== null) {

		this.buttons.search.on('click', () => {

			let value = this.value();
			if (value !== null) {

				if (isString(value.keywords) === true && value.keywords.trim().length > 3) {

					browser.download('https://searx.prvcy.eu/search?q=' + encodeURIComponent(value.keywords.trim()) + '&format=json', (response) => {

						if (isBuffer(response.payload) === true) {

							let data = null;

							try {
								data = JSON.parse(response.payload.toString('utf8'));
							} catch (err) {
								data = null;
							}

							if (isObject(data) === true && isArray(data.results) === true) {

								this.value({
									keywords: value.keywords.trim(),
									results:  data.results.filter((r) => isResult(r)).map((r) => toResult(r))
								});

								this.model.results.forEach((model) => {

									model.url.on('click', () => {

										let tab = browser.open(model.url.attr('href'));
										if (tab !== null) {
											browser.show(tab);
										}

									});

								});

							}

						}

					});

				}

			}

		});

	}

	this.element.emit('update');

};


Search.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Search(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Search.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (isArray(value.results) === true) {

				value.results = value.results.filter((r) => isResult(r));


				let article = this.element.query('browser-widget-search-article');
				let list    = article.query('ul');

				if (list !== null) {

					list.query('li', true).forEach((item) => item.erase());
					this.model.results = [];

					value.results.map((result) => {
						return toMap.call(this, result);
					}).sort((a, b) => {
						if (a.score > b.score) return -1;
						if (a.score < b.score) return  1;
						return 0;
					}).forEach((map) => {

						if (map !== null) {
							map.element.render(list);
							this.model.results.push(map.model);
						}

					});

				}

			}

			return Widget.prototype.value.call(this, value);

		} else {

			return Widget.prototype.value.call(this);

		}

	}

});


export { Search };

