
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
		'\t<button title="Earlier Site" data-action="back"></button>',
		'\t<browser-card-tab-header-history></browser-card-tab-header-history>',
		'\t<button title="Later Site" data-action="next"></button>',
		'</browser-card-tab-header>',
		'<browser-card-tab-article>',
		'\t<code data-key="history.link">stealth:welcome</code>',
		'\t<code data-key="history.time" data-map="DATETIME">01.02.2021 13:37:00</code>',
		'\t<button title="Allow/Disallow Text" data-key="history.mode.text" data-val="false" disabled></button>',
		'\t<button title="Allow/Disallow Image" data-key="history.mode.image" data-val="false" disabled></button>',
		'\t<button title="Allow/Disallow Audio" data-key="history.mode.audio" data-val="false" disabled></button>',
		'\t<button title="Allow/Disallow Video" data-key="history.mode.video" data-val="false" disabled></button>',
		'\t<button title="Allow/Disallow Other" data-key="history.mode.other" data-val="false" disabled></button>',
		'</browser-card-tab-article>',
		'<browser-card-tab-footer>',
		'\t<button title="Remove Tab" data-action="remove"></button>',
		'</browser-card-tab-footer>'
	]);

	this.buttons = {
		back:   this.element.query('button[data-action="back"]'),
		next:   this.element.query('button[data-action="next"]'),
		remove: this.element.query('button[data-action="remove"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.event = {
		element: this.element.query('browser-card-tab-article'),
		model: {
			link: this.element.query('[data-key="history.link"]'),
			mode: {
				mode: {
					text:  this.element.query('[data-key="history.mode.text"]'),
					image: this.element.query('[data-key="history.mode.image"]'),
					audio: this.element.query('[data-key="history.mode.audio"]'),
					video: this.element.query('[data-key="history.mode.video"]'),
					other: this.element.query('[data-key="history.mode.other"]')
				}
			},
			time: this.element.query('[data-key="history.time"]')
		}
	};

	this.model = {
		id:      this.element.query('[data-key="id"]'),
		history: [],
	};

	this.__state = {
		history: [],
		select:  null
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

	if (this.buttons.back !== null) {

		this.buttons.back.on('click', () => {

			let select = this.__state.select;
			if (select !== null) {

				let index = this.__state.history.indexOf(select);
				if (index > 0) {

					let tmp = this.__state.history[index - 1] || null;
					if (tmp !== null) {
						this.select(tmp.event);
					}

				}

			}

		});

	}

	if (this.buttons.next !== null) {

		this.buttons.next.on('click', () => {

			let select = this.__state.select;
			if (select !== null) {

				let index = this.__state.history.indexOf(select);
				if (index < this.__state.history.length - 1) {

					let tmp = this.__state.history[index + 1] || null;
					if (tmp !== null) {
						this.select(tmp.event);
					}

				}

			}

		});

	}

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

			let map = this.__state.history.find((m) => m.event === event) || null;
			if (map !== null) {

				if (this.__state.select !== null) {
					this.__state.select.element.state('');
				}


				if (map.element !== null) {

					map.element.state('active');

					map.element.node.scrollIntoView({
						behavior: 'smooth',
						block:    'center',
						inline:   'center'
					});

				}

				this.__state.select = map;


				let index = this.__state.history.indexOf(map);

				if (index === 0) {
					this.buttons.back.state('disabled');
				} else {
					this.buttons.back.state('enabled');
				}

				if (index === this.__state.history.length - 1) {
					this.buttons.next.state('disabled');
				} else {
					this.buttons.next.state('enabled');
				}


				Widget.prototype.value.call(this.event, map.event);
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


				let history = this.element.query('browser-card-tab-header-history');
				if (history !== null) {

					history.query('button', true).forEach((button) => button.erase());
					this.model.history = [];


					let events = value.history.slice().reverse();
					let deltas = events.map((event, e) => {

						let current = Date.now();

						if (e < events.length - 1) {
							current = events[e + 1].time;
						}

						return ((current - event.time) / 1000) | 0;

					});

					events.map((event) => {

						let object = toElementModel.call(this, event);
						if (object !== null) {

							return {
								event:   event,
								element: object.element,
								model:   object.model,
							};

						}

						return null;

					}).forEach((map) => {

						if (map !== null) {
							map.element.render(history);
							this.model.history.push(map.model);
							this.__state.history.push(map);
						}

					});


					setTimeout(() => {

						let area = history.area();
						if (area.w > 0 && area.h > 0) {

							deltas.map((delta) => {

								if (delta > 60) {

									if (delta / 60 * 32 > area.w - 2) {
										return area.w - 2;
									} else {
										return (delta / 60 * 32) | 0;
									}

								} else {
									return 32;
								}

							}).forEach((width, e) => {

								let map = this.__state.history[e] || null;
								if (map !== null) {
									map.element.area({
										w: width
									});
								}

							});

						}

					}, 0);

					setTimeout(() => {
						this.select(events[events.length - 1]);
					}, 250);

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

