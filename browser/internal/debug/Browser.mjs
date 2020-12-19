
import { Element           } from '../../design/Element.mjs';
import { Widget            } from '../../design/Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';
import { Session           } from '../../design/card/Session.mjs';
import { Tab               } from '../../design/card/Tab.mjs';



const update = function(browser) {

	let article = this.element.query('browser-widget-browser-article');
	if (article !== null) {

		article.query('*', true).forEach((element) => {
			element.erase();
		});


		let cards = [];

		if (this.allowed.includes('client')) {
			// TODO: Client.from()
		}

		if (this.allowed.includes('tabs')) {

			browser.tabs.map((tab) => {

				let data = tab.toJSON();
				if (data !== null) {

					try {

						if (this.actions.includes('remove')) {
							return Tab.from(data, [ 'remove', 'save' ]);
						} else {
							return Tab.from(data, [ 'save' ]);
						}

					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}

				return null;

			}).forEach((card) => cards.push(card));

		}

		if (this.allowed.includes('settings') === true) {

			// TODO: settings[type].forEach(...)
			// but without search functionality

		} else if (this.allowed.includes('sessions') === true) {

			browser.settings.sessions.map((session) => {

				try {

					if (this.actions.includes('remove')) {
						return Session.from(session, [ 'remove', 'save' ]);
					} else {
						return Session.from(session, [ 'save' ]);
					}

				} catch (err) {
					this.emit('error', [ err ]);
				}

				return null;

			}).forEach((card) => cards.push(card));

		}

		if (cards.length > 0) {

			cards.forEach((card) => {

				if (card !== null) {
					card.render(article);
				}

			});

		}

	}

};



const Browser = function(browser, allowed, actions) {

	this.allowed = isArray(allowed) ? allowed : [ 'client', 'tabs', 'sessions', 'settings' ];
	this.actions = isArray(actions) ? actions : [ 'refresh', 'remove' ];
	this.element = new Element('browser-widget-browser', [
		'<h3>Browser</h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-widget-browser-article>',
		'</browser-widget-browser-article>',
		'<browser-widget-browser-footer>',
		'<button title="Refresh" data-action="refresh"></button>',
		'</browser-widget-browser-footer>'
	]);

	this.buttons = {
		refresh: this.element.query('button[data-action="refresh"]'),
		toggle:  this.element.query('button[data-action="toggle"]')
	};

	Widget.call(this);


	this.element.on('show', () => {

		this.element.state('active');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('active');
		}

	});

	this.element.on('hide', () => {

		this.element.state('');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('');
		}

	});

	this.element.on('update', () => {

		this.buttons.refresh.erase();


		let footer = this.element.query('browser-widget-browser-footer');

		if (this.actions.includes('refresh')) {
			this.buttons.refresh.render(footer);
		}

		update.call(this, browser);

	});


	if (this.buttons.refresh !== null) {

		this.buttons.refresh.on('click', () => {
			update.call(this, browser);
		});

	}

	setTimeout(() => {
		this.element.emit('update');
	}, 0);

};


Browser.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Browser(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Browser.prototype = Object.assign({}, Widget.prototype);


export { Browser };

