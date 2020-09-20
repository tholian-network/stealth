
import { Element                                          } from '../Element.mjs';
import { Widget                                           } from '../Widget.mjs';
import { isArray, isBoolean, isNumber, isObject, isString } from '../../extern/base.mjs';
import { isTab                                            } from '../../source/Tab.mjs';



const isEvent = function(event) {

	if (
		isObject(event) === true
		&& isString(event.link) === true
		&& isNumber(event.time) === true
		&& isObject(event.mode) === true
		&& isString(event.mode.domain) === true
		&& isBoolean(event.mode.mode.text) === true
		&& isBoolean(event.mode.mode.image) === true
		&& isBoolean(event.mode.mode.audio) === true
		&& isBoolean(event.mode.mode.video) === true
		&& isBoolean(event.mode.mode.other) === true
	) {
		return true;
	}


	return false;

};

const toElementModel = function(event) {

	event = isEvent(event) ? event : null;


	if (event !== null) {

		let element = new Element('button');

		element.attr('title', event.link);

		element.on('click', () => {
			this.select(event);
		});

		let model = {
			link: { value: (v) => element.attr('title', v) }
		};

		model.link.value(event.link);

		return {
			element: element,
			model:   model
		};

	}


	return null;

};



const Tab = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove' ];
	this.element = new Element('browser-card-tab', [
		'<h3>Tab #<span data-key="id">0</span></h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-tab-header>',
		'</browser-card-tab-header>',
		'<browser-card-tab-article>',
		'<code data-key="history.link" data-map="URL">stealth:welcome</code>',
		'<code data-key="history.time">01.02.2021 13:37:00</code>',
		'<button title="Allow/Disallow Text" data-key="history.mode.text" data-val="false" disabled></button>',
		'<button title="Allow/Disallow Image" data-key="history.mode.image" data-val="false" disabled></button>',
		'<button title="Allow/Disallow Audio" data-key="history.mode.audio" data-val="false" disabled></button>',
		'<button title="Allow/Disallow Video" data-key="history.mode.video" data-val="false" disabled></button>',
		'<button title="Allow/Disallow Other" data-key="history.mode.other" data-val="false" disabled></button>',
		'</browser-card-tab-article>',
		'<browser-card-tab-footer>',
		'<button title="Remove Tab" data-action="remove"></button>',
		'</browser-card-tab-footer>'
	]);

	this.buttons = {
		remove: this.element.query('button[data-action="remove"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.event = {
		element: this.element.query('browser-card-tab-article'),
		model: {
			link: this.element.query('[data-key="history.link"]'),
			mode: {
				text:  this.element.query('[data-key="history.mode.text"]'),
				image: this.element.query('[data-key="history.mode.image"]'),
				audio: this.element.query('[data-key="history.mode.audio"]'),
				video: this.element.query('[data-key="history.mode.video"]'),
				other: this.element.query('[data-key="history.mode.other"]')
			}
		}
	};

	this.model = {
		id:      this.element.query('[data-key="id"]'),
		history: [],
	};

	this.__state = {
		history: []
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

		this.buttons.remove.erase();


		let footer = this.element.query('browser-card-tab-footer');

		if (this.actions.includes('remove')) {
			this.buttons.remove.render(footer);
		}

	});

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {
			this.element.emit('remove');
			this.element.erase();
		});

	}

	if (this.buttons.toggle !== null) {

		this.buttons.toggle.on('click', () => {

			if (this.element.state() === 'active') {
				this.element.emit('hide');
			} else {
				this.element.emit('show');
			}

		});

	}

	this.element.emit('update');

};


Tab.from = function(value, actions) {

	value   = isTab(value)     ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Tab(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Tab.prototype = Object.assign({}, Widget.prototype, {

	select: function(event) {

		event = isEvent(event) ? event : null;


		if (event !== null) {

			if (this.__state.history.includes(event) === true) {

				this.__state.select = event;

				Widget.prototype.value.call(this.event, event);
				this.event.element.state('active');

				return true;

			}

		}


		return false;

	},

	value: function(value) {

		value = isTab(value) ? value : null;


		if (value !== null) {

			if (isArray(value.history) === true) {

				value.history = value.history.filter((h) => isEvent(h));


				let header = this.element.query('browser-card-tab-header');
				if (header !== null) {

					header.query('button', true).forEach((button) => button.erase());
					this.model.history = [];

					value.history.reverse().map((h) => toElementModel.call(this, h)).forEach((event) => {

						if (event !== null) {
							event.element.render(header);
							this.model.history.push(event.model);
							this.__state.history.push(event);
						}

					});

				}

				this.event.element.state('');

			}

			return Widget.prototype.value.call(this, value);

		} else {

			return Widget.prototype.value.call(this);

		}

	}

});


export { Tab };

