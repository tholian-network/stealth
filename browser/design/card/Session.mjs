
import { Element                               } from '../Element.mjs';
import { Widget                                } from '../Widget.mjs';
import { Tab as TabCard                        } from '../card/Tab.mjs';
import { isArray, isNumber, isObject, isString } from '../../extern/base.mjs';
import { Tab, isTab                            } from '../../source/Tab.mjs';



const isSession = (object) => {

	if (
		isObject(object) === true
		&& isString(object.type) === true
		&& isObject(object.data) === true
		&& object.type === 'Session'
	) {
		return true;
	}


	return false;

};

const toSession = (json) => {

	json = isObject(json) ? json : null;


	let session = {
		agent:   null,
		domain:  Date.now() + '.tholian.network',
		stealth: null,
		tabs:    [],
		warning: 0
	};


	if (json !== null) {

		let type = json.type === 'Session' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {

			if (isObject(data.agent) === true) {
				session.agent = data.agent;
			}

			if (isString(data.domain) === true) {
				session.domain = data.domain;
			}

			if (isNumber(data.warning) === true) {
				session.warning = data.warning;
			}

			if (isArray(data.tabs) === true) {
				session.tabs = data.tabs.map((data) => Tab.from(data)).filter((tab) => tab !== null);
			}

		}

	}


	return session;

};


const toMap = function(tab, session) {

	tab     = isTab(tab)        ? tab     : null;
	session = isObject(session) ? session : null;


	if (tab !== null) {

		let widget = TabCard.from(tab);
		if (widget !== null) {

			widget.on('remove', () => {

				if (isObject(session) === true) {

					if (isArray(session.tabs) === true) {

						if (session.tabs.includes(tab) === true) {
							session.tabs.removeEvery((t) => t === tab);
						}

					}

				}

				if (this.model.tabs.includes(widget.model) === true) {
					this.model.tabs.remove(widget.model);
				}

			});

			return {
				element: widget.element,
				model:   widget.model
			};

		}

	}


	return null;

};



const Session = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove' ];
	this.element = new Element('browser-card-session', [
		'<h3>Session #<span data-key="domain">0.tholian.network</h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-session-header>',
		'\t<code data-key="agent-engine">Engine</code> <code data-key="agent-version">13.37</code> on <code data-key="agent-system">System</code> has <code data-key="warning">0</code> warnings.',
		'</browser-card-session-header>',
		'<browser-card-session-article>',
		'</browser-card-session-article>',
		'<browser-card-session-footer>',
		'<button title="Remove Session" data-action="remove"></button>',
		'</browser-card-session-footer>'
	]);

	this.buttons = {
		remove: this.element.query('button[data-action="remove"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		agent:   {
			engine:  this.element.query('[data-key="agent-engine"]'),
			system:  this.element.query('[data-key="agent-system"]'),
			version: this.element.query('[data-key="agent-version"]')
		},
		domain:  this.element.query('[data-key="domain"]'),
		warning: this.element.query('[data-key="warning"]'),
		tabs:    []
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


		let footer = this.element.query('browser-card-session-footer');

		if (this.actions.includes('remove')) {
			this.buttons.remove.render(footer);
		}

	});

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			let value = this.value();

			browser.client.services['session'].remove(value, (result) => {

				if (result === true) {

					browser.settings['sessions'].removeEvery((r) => r.domain === value.domain);
					this.element.erase();

				}

			});

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


Session.from = function(value, actions) {

	value   = isSession(value) ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Session(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Session.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isSession(value) ? toSession(value) : null;


		if (value !== null) {

			if (isArray(value.tabs) === true) {

				let article = this.element.query('browser-card-session-article');
				if (article !== null) {

					article.query('browser-card-tab', true).forEach((tab) => tab.erase());
					this.model.tabs = [];

					value.tabs.map((tab) => {
						return toMap.call(this, tab, value);
					}).forEach((map) => {

						if (map !== null) {
							map.element.render(article);
							this.model.tabs.push(map.model);
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

// TODO: Might be necessary to override value() method because
// value({ type: Session, data: {}}) should work, too


export { Session };

