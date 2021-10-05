
import { Assistant                                                  } from '../Assistant.mjs';
import { Element                                                    } from '../Element.mjs';
import { Widget                                                     } from '../Widget.mjs';
import { console, isArray, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { URL                                                        } from '../../source/parser/URL.mjs';



const ASSISTANT = new Assistant({
	name:   'Context Menu',
	widget: 'menu/Context',
	events: {
		'hide':   'Hiding Context Menu.',
		'show':   'Showing Context Menu.',
		'select': 'Executing selected Action.'
	}
});

const isTab = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Tab]';
};

const global    = (typeof window !== 'undefined' ? window : this);
const CLIPBOARD = ((navigator) => {

	let read  = function(callback) {
		console.error('Context Menu: Cannot read value from Clipboard.');
		callback(null);
	};

	let write = function(value, callback) {
		console.error('Context Menu: Cannot write value "' + value + '" to Clipboard.');
		callback(false);
	};

	let clipboard = navigator.clipboard || null;
	if (clipboard !== null) {

		if ('readText' in clipboard) {

			read = function(callback) {

				clipboard.readText().then((value) => {

					if (isString(value) === true) {
						callback(value);
					} else {
						callback(null);
					}

				}).catch(() => {
					callback(null);
				});

			};

			// XXX: Request Permission
			setTimeout(() => {
				read(() => {});
			}, 100);

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


	return {
		read:  read,
		write: write
	};

})(global.navigator || {});

const ACTIONS = [{
	icon:     'back',
	label:    'back',
	callback: function(browser) {
		browser.back();
	}
}, {
	icon:     'close',
	label:    'close',
	callback: function(browser, value) {

		if (isTab(value) === true) {

			browser.close(value);

		} else if (isString(value) === true) {

			let tab = browser.tabs.find((t) => t.id === value) || null;
			if (tab !== null) {
				browser.close(tab);
			}

		}

	}
}, {
	icon:     'copy',
	label:    'copy',
	callback: function(browser, value) {

		if (isString(value) === true) {

			CLIPBOARD.write(value, () => {
				// Do nothing
			});

		}

	}
}, {
	icon:     'download',
	label:    'download',
	callback: function(browser, value) {

		if (URL.isURL(value) === true) {

			browser.download(value.link);

		} else if (isString(value) === true) {

			let url = URL.parse(value.trim());
			if (url.protocol !== null) {
				browser.download(url.link);
			}

		}

	}
}, {
	icon:     'focus',
	label:    'focus',
	callback: function(browser, value) {

		if (isString(value) === true) {

			let window  = global;
			let webview = Widget.query('browser-backdrop-webview');
			if (webview !== null) {

				if (webview.window !== null) {
					window = webview.window;
				}

			}


			let element = Element.query(value, window);
			if (element !== null) {

				element.node.scrollIntoView({
					behavior: 'smooth',
					block:    'center'
				});


				let interval = null;
				let prev_val = window['scrollY'];

				interval = setInterval(() => {

					let curr_val = window['scrollY'];
					if (curr_val === prev_val) {

						if (interval !== null) {
							clearInterval(interval);
							interval = null;
						}

						let check = element.query('a, button, input, textarea, *[tabindex]');
						if (isArray(check) === true) {
							check[0].focus();
						} else if (check !== null) {
							check.focus();
						}

					} else {
						prev_val = curr_val;
					}

				}, 100);

			}

		}

	}
}, {
	icon:     'next',
	label:    'next',
	callback: function(browser) {
		browser.next();
	}
}, {
	icon:     'open',
	label:    'open',
	callback: function(browser, value) {

		if (URL.isURL(value) === true) {

			browser.navigate(value.link);

		} else if (isString(value) === true) {

			let url = URL.parse(value.trim());
			if (url.protocol !== null) {
				browser.navigate(url.link);
			}

		}

	}
}, {
	icon:     'pause',
	label:    'pause',
	callback: function(browser) {
		browser.pause();
	}
}, {
	icon:     'refresh',
	label:    'refresh',
	callback: function(browser) {
		browser.refresh();
	}
}];

const toAction = function(action) {

	if (isObject(action) === true) {

		action.icon  = isString(action.icon)  ? action.icon  : 'default';
		action.label = isString(action.label) ? action.label : null;

		if (isFunction(action.callback) === false) {

			if (isString(action.label) === true) {

				let other = ACTIONS.find((a) => a.label === action.label) || null;
				if (other !== null) {

					if (action.icon === 'default') {
						action.icon = other.icon;
					}

					action.callback = other.callback;

					return action;

				}

			}

		} else if (isString(action.label) === true && isFunction(action.callback) === true) {

			return action;

		}

	}


	return null;

};



const Context = function(browser) {

	this.element = new Element('browser-menu-context');
	this.actions = [];
	this.buttons = [];

	this.__state = {
		select: null
	};


	this.element.on('click', (e) => {

		let target = Element.toElement(e.target);
		let result = false;

		if (target !== null) {

			let button = this.buttons.find((b) => b === target) || null;
			if (button !== null) {

				let action = this.actions[this.buttons.indexOf(button)] || null;
				if (action !== null && action.callback !== null) {
					action.callback.call(null, browser, action.value || null);
				}

				result = true;

			}

		}

		if (result === true) {
			ASSISTANT.emit('select');
			this.element.emit('hide');
		} else {
			this.element.emit('hide');
		}

	});

	this.element.on('key', (key) => {

		if (key.name === 'tab') {

			if (key.mods.includes('shift') === true) {
				this.select('prev');
			} else {
				this.select('next');
			}

		} else if (key.name === ' ' || key.name === 'enter') {

			let select = this.__state.select;
			if (select !== null) {
				ASSISTANT.emit('select');
				select.emit('click');
			} else {
				this.element.emit('hide');
			}

		} else if (key.name === 'escape') {

			this.element.emit('hide');

		}

	});

	this.element.on('contextmenu', (e) => {

		e.preventDefault();
		e.stopPropagation();

	});

	this.element.on('show', () => {

		this.element.state('active');

		let select = this.buttons[0] || null;
		if (select !== null) {
			this.__state.select = select;
			this.__state.select.state('active');
		}

		ASSISTANT.emit('show');

	});

	this.element.on('hide', () => {

		if (this.buttons.length > 0) {
			this.actions = [];
			this.buttons = [];
			this.element.value(this.buttons);
		}

		if (this.element.state() === 'active') {
			this.element.state('');
			ASSISTANT.emit('hide');
		}

	});


	Widget.call(this);

};


Context.prototype = Object.assign({}, Widget.prototype, {

	area: function(area) {

		area = isObject(area) ? area : null;


		if (area !== null) {

			area = {
				w: isNumber(area.w) ? (area.w | 0) : null,
				h: isNumber(area.h) ? (area.h | 0) : null,
				x: isNumber(area.x) ? (area.x | 0) : (global.innerWidth  / 2),
				y: isNumber(area.y) ? (area.y | 0) : (global.innerHeight / 2),
				z: isNumber(area.z) ? (area.z | 0) : null
			};

			setTimeout(() => {

				if (area.x < (area.w / 2 + 1)) {
					area.x = (area.w / 2 + 1) | 0;
				}

				if (area.y < (40 + 16)) {
					area.y = (40 + 16) | 0;
				}

				if (area.x > (global.innerWidth - area.w / 2)) {
					area.x = (global.innerWidth - area.w / 2) | 0;
				}

				if (area.y > (global.innerHeight - area.h + 16 - 1)) {
					area.y = (global.innerHeight - area.h + 16 - 1) | 0;
				}

				this.element.area(area);

			}, 0);

			return true;

		} else {

			return this.element.area();

		}

	},

	read: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (callback !== null) {

			CLIPBOARD.read((value) => {

				if (isString(value) === true) {
					callback(value);
				} else {
					callback(null);
				}

			});

		}

	},

	select: function(direction) {

		if (this.buttons.length > 0) {

			if (direction === 'next') {

				let index = this.buttons.indexOf(this.__state.select);
				if (index !== -1) {

					index += 1;
					index %= this.buttons.length;

					this.__state.select.state('');

					this.__state.select = this.buttons[index];
					this.__state.select.state('active');

					return true;

				}

			} else if (direction === 'prev') {

				let index = this.buttons.indexOf(this.__state.select);
				if (index !== -1) {

					index -= 1;
					index  = index >= 0 ? index : (this.buttons.length - 1);

					this.__state.select.state('');

					this.__state.select = this.buttons[index];
					this.__state.select.state('active');

					return true;

				}

			}

		}


		return false;

	},

	value: function(actions) {

		actions = isArray(actions) ? actions : null;


		if (actions !== null) {

			this.actions = [];
			this.buttons = [];

			actions.map((a) => toAction(a)).filter((a) => a !== null).forEach((action) => {

				let button = new Element('button', action.label);
				if (button !== null) {

					button.attr('data-icon', action.icon);

					this.actions.push(action);
					this.buttons.push(button);

				}

			});

			this.element.value(this.buttons);

			return true;

		}


		return false;

	}

});


export { Context };

