
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { Tab               } from '../card/Tab.mjs';
import { isArray, isObject } from '../../extern/base.mjs';
import { isTab             } from '../../source/Tab.mjs';
import { URL               } from '../../source/parser/URL.mjs';



const toElementModel = function(tab) {

	tab = isTab(tab) ? tab : null;


	if (tab !== null) {

		let widget = Tab.from(tab);
		let button = widget.query('button[data-action="remove"]');
		if (button !== null) {

			button.on('click', () => {

				let cache = this.model.tabs.find((t) => t.id.value() === tab.id) || null;
				if (cache !== null) {
					this.model.tabs.remove(cache);
				}

				widget.element.erase();

			});

		}

		return {
			element: widget.element,
			model:   widget.model
		};

	}


	return null;

};



const Session = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove' ];
	this.element = new Element('browser-card-session', [
		'<h3 data-key="domain">Domain</h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-session-article>',
		'<p><code data-key="agent">User Agent</code> has <code data-key="warning">0</code> warnings.</p>',

		// TODO: tabs and other details

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
		agent:   this.element.query('[data-key="agent"]'),
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

					browser.settings['sessions'].removeEvery((r) => r.domain === value.domain && r.path === value.path);
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

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Session(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Session.prototype = Object.assign({}, Widget.prototype);


export { Session };

