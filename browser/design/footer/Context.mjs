
import { isArray, isFunction, isNumber, isObject, isString } from '../../source/POLYFILLS.mjs';

import { Element } from '../Element.mjs';
import { URL     } from '../../source/parser/URL.mjs';

const global    = (typeof window !== 'undefined' ? window : this);
const CLIPBOARD = (function(navigator) {

	let read  = null;
	let write = null;

	let clipboard = navigator.clipboard || null;
	if (clipboard !== null) {

		if ('readText' in clipboard) {

			read = function(callback) {

				clipboard.readText().then((value) => {

					if (isString(value)) {
						callback(value);
					} else {
						callback(null);
					}

				}).catch(() => {
					callback(null);
				});

			};

		}

		if ('writeText' in clipboard) {

			write = function(value, callback) {

				value = isString(value) ? value : null;

				if (value !== null) {

					clipboard.writeText(value).then(() => {
						callback(true);
					}, () => {
						callback(false);
					});

				} else {
					callback(false);
				}

			};

		}

	}


	if (read !== null) {

		// XXX: Request Permission
		setTimeout(() => {
			read(() => {});
		}, 100);

	}


	return {
		read:  read,
		write: write
	};

})(global.navigator || {});


const ACTIONS = [{
	icon:     'copy',
	label:    'copy',
	callback: function(browser, value) {

		if (isString(value)) {

			CLIPBOARD.write(value, () => {
				// Do nothing
			});

		}

	}
}, {
	icon:     'download',
	label:    'download',
	callback: function(browser, value) {

		if (isString(value)) {

			let ref = URL.parse(value.trim());
			if (ref.protocol !== null) {
				browser.download(ref.url);
			}

		}

	}
}, {
	icon:     'open',
	label:    'open',
	callback: function(browser, value) {

		if (isString(value)) {

			let ref = URL.parse(value.trim());
			if (ref.protocol !== null) {

				let tab = browser.open(ref.url);
				if (tab !== null) {
					browser.show(tab);
				}

			}

		}

	}
}, {
	icon:     'refresh',
	label:    'refresh',
	callback: function(browser) {
		browser.refresh();
	}
}];



const is_action = function(action) {

	if (isObject(action)) {

		action.icon  = isString(action.icon)  ? action.icon  : 'default';
		action.label = isString(action.label) ? action.label : null;

		if (isString(action.label) && isFunction(action.callback)) {

			return true;

		} else if (isString(action.label)) {

			let other = ACTIONS.find((a) => a.label === action.label) || null;
			if (other !== null) {

				action.icon     = other.icon;
				action.callback = other.callback;

				return true;

			}

		}

	}


	return false;

};

const render_button = function(action) {

	if (action.label !== null && action.callback !== null) {

		let button = Element.from('button', action.label, false);

		button.attr('data-icon', action.icon);

		return button;

	}


	return null;

};



const Context = function(browser) {

	this.element = Element.from('browser-context');
	this.actions = [];
	this.buttons = [];

	this._select = null;


	this.element.on('click', (e) => {

		let button = this.buttons.find((b) => b.element === e.target) || null;
		if (button !== null) {

			let action = this.actions[this.buttons.indexOf(button)] || null;
			if (action !== null && action.callback !== null) {
				action.callback.call(null, browser, action.value || null);
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

		let select = this.buttons[0] || null;
		if (select !== null) {
			this._select = select;
			this._select.state('active');
		}

	});

	this.element.on('hide', () => {

		if (this.buttons.length > 0) {
			this.actions = [];
			this.buttons = [];
			this.element.value(this.buttons);
		}

		if (this.element.state() === 'active') {
			this.element.state('');
		}

	});

};


Context.prototype = {

	area: function(pos) {

		pos = isObject(pos) ? pos : null;


		if (pos !== null) {

			pos.x = isNumber(pos.x) ? pos.x : (global.innerWidth  / 2);
			pos.y = isNumber(pos.y) ? pos.y : (global.innerHeight / 2);
			pos.z = isNumber(pos.z) ? pos.z : null;


			if (this.element !== null) {

				setTimeout(() => {

					let area = this.element.area();

					if (pos.x < (area.w / 2 + 1)) {
						pos.x = (area.w / 2 + 1) | 0;
					}

					if (pos.y < (40 + 16)) {
						pos.y = (40 + 16) | 0;
					}

					if (pos.x > (global.innerWidth - area.w / 2)) {
						pos.x = (global.innerWidth - area.w / 2) | 0;
					}

					if (pos.y > (global.innerHeight - area.h + 16 - 1)) {
						pos.y = (global.innerHeight - area.h + 16 - 1) | 0;
					}

					this.element.area(pos);

				}, 0);

				return true;

			}

			return false;

		} else {

			if (this.element !== null) {
				return this.element.area();
			}

			return null;

		}

	},

	emit: function(event, args) {
		this.element.emit(event, args);
	},

	erase: function(target) {
		this.element.erase(target);
	},

	select: function(direction) {

		if (this.buttons.length > 0) {

			if (direction === 'next') {

				let index = this.buttons.indexOf(this._select);
				if (index !== -1) {

					index += 1;
					index %= this.buttons.length;

					this._select.state('');

					this._select = this.buttons[index];
					this._select.state('active');

					return true;

				}

			} else if (direction === 'prev') {

				let index = this.buttons.indexOf(this._select);
				if (index !== -1) {

					index -= 1;
					index  = index >= 0 ? index : (this.buttons.length - 1);

					this._select.state('');

					this._select = this.buttons[index];
					this._select.state('active');

					return true;

				}

			}

		}


		return false;

	},

	read: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (callback !== null) {

			CLIPBOARD.read((value) => {

				if (isString(value)) {
					callback(value);
				}

			});

		}

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

				let button = render_button.call(this, action);
				if (button !== null) {
					this.actions.push(action);
					this.buttons.push(button);
				}

			});

			this.element.value(this.buttons);

			return true;

		}


		return false;

	}

};


export { Context };

