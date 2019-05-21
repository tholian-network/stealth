
import { isArray, isFunction, isNumber, isObject, isString } from '../../source/POLYFILLS.mjs';

import { Element } from '../Element.mjs';

const global = (typeof window !== 'undefined' ? window : this);
const doc    = global.document;



const is_action = function(action) {

	if (isObject(action)) {

		action.icon     = isString(action.icon)       ? action.icon     : 'default';
		action.label    = isString(action.label)      ? action.label    : null;
		action.callback = isFunction(action.callback) ? action.callback : null;

		if (action.label !== null && action.callback !== null) {
			return true;
		}

	}


	return false;

};

const render_button = function(action) {

	if (action.label !== null && action.callback !== null) {

		let button = doc.createElement('button');

		button.innerHTML = action.label;
		button.setAttribute('data-icon', action.icon);

		return button;

	}


	return null;

};



const Context = function() {

	this.element  = Element.from('browser-context');
	this.actions  = [];
	this.buttons  = [];
	this.position = { x: null, y: null };


	this.element.on('click', (e) => {

		let index = this.buttons.indexOf(e.target);
		if (index !== -1) {

			let action = this.actions[index] || null;
			if (action !== null && action.callback !== null) {
				action.callback();
			}

		}

		this.element.state('');

	});

	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.element.on('show', () => {

		this.element.state('active');

		setTimeout(() => {

			if (this.position.x !== null && this.position.y !== null) {

				let rect = this.element.element.getBoundingClientRect();
				if (rect !== null) {

					if (this.position.x < (rect.width / 2 + 1)) {
						this.position.x = (rect.width / 2 + 1) | 0;
					}

					if (this.position.y < (40 + 16)) {
						this.position.y = (40 + 16) | 0;
					}

					if (this.position.x > (global.innerWidth - rect.width / 2)) {
						this.position.x = (global.innerWidth - rect.width / 2) | 0;
					}

					if (this.position.y > (global.innerHeight - rect.height / 2 - 1)) {
						this.position.y = (global.innerHeight - rect.height / 2 - 1) | 0;
					}

				}

				this.element.element.style.left = this.position.x + 'px';
				this.element.element.style.top  = this.position.y + 'px';

			}

		}, 0);

	});

	this.element.on('hide', () => {
		this.element.state('');
	});

};


Context.prototype = {

	emit: function(event, args) {
		this.element.emit(event, args);
	},

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	},

	set: function(actions) {

		actions = isArray(actions) ? actions : null;


		if (actions !== null) {

			this.actions = [];
			this.buttons = [];

			actions.filter((a) => is_action(a)).forEach((action) => {

				let button = render_button(action);
				if (button !== null) {
					this.actions.push(action);
					this.buttons.push(button);
				}

			});

			this.element.value(this.buttons);

			return true;

		}


		return false;

	},

	move: function(position) {

		position = isObject(position) ? position : null;


		if (position !== null) {

			if (isNumber(position.x)) {
				this.position.x = position.x | 0;
			}

			if (isNumber(position.y)) {
				this.position.y = position.y | 0;
			}

			return true;

		}


		return false;

	}

};


export { Context };

