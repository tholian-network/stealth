
import { console, isArray, isBoolean, isFunction, isNumber, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                                           } from '../source/ENVIRONMENT.mjs';
import { DATETIME                                                              } from '../source/parser/DATETIME.mjs';
import { IP                                                                    } from '../source/parser/IP.mjs';
import { UA                                                                    } from '../source/parser/UA.mjs';
import { URL                                                                   } from '../source/parser/URL.mjs';



const global   = (typeof window !== 'undefined' ? window : this);
const ELEMENTS = [];

const DOMEVENT = {

	// Media
	'load':        null,

	// Mouse
	'click':       'click',
	'contextmenu': null,
	'dblclick':    null,
	'mousedown':   null,
	'mouseenter':  null,
	'mouseleave':  null,
	'mousemove':   null,
	'mouseout':    null,
	'mouseover':   null,
	'mouseup':     null,

	// Pointer
	'pointercancel': null,
	'pointerdown':   null,
	'pointerenter':  null,
	'pointerleave':  null,
	'pointermove':   null,
	'pointerout':    null,
	'pointerover':   null,
	'pointerup':     null,

	// Focus
	'blur':     'blur',
	'change':   null,
	'focus':    'focus',
	'focusin':  null,
	'focusout': null,
	'input':    null,
	'select':   'select',

	// Keyboard
	'keydown':  null,
	'keypress': null,
	'keyup':    null,

	// Drag
	'drag':      null,
	'dragend':   null,
	'dragenter': null,
	'dragleave': null,
	'dragover':  null,
	'dragstart': null,
	'drop':      null,

	// Media
	'abort':          null,
	'canplay':        null,
	'canplaythrough': null,
	'durationchange': null,
	'emptied':        null,
	'ended':          null,
	'error':          null,
	'loadeddata':     null,
	'loadedmetadata': null,
	'loadstart':      null,
	'pause':          'pause',
	'play':           'play',
	'playing':        null,
	'progress':       null,
	'ratechange':     null,
	'seeked':         null,
	'seeking':        null,
	'stalled':        null,
	'suspend':        null,
	'timeupdate':     null,
	'volumechange':   null,
	'waiting':        null

};

const FakeEvent = function() {

	this.x = 0;
	this.y = 0;
	this.preventDefault  = function() {};
	this.stopPropagation = function() {};

};

const isHTMLElement = function(element) {

	let str = Object.prototype.toString.call(element);
	if (
		str.startsWith('[object') === true
		&& str.includes('HTML') === true
		&& str.includes('Element]') === true
	) {
		return true;
	}


	return false;

};

const isContent = function(content) {

	if (isString(content) === true) {

		return true;

	} else if (isHTMLElement(content) === true) {

		return true;

	} else if (isArray(content) === true) {

		let check = content.filter((c) => (
			isElement(c) === true
			|| isHTMLElement(c) === true
			|| isString(c) === true
		));
		if (check.length === content.length) {
			return true;
		}

	}

};

export const isElement = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Element]';
};

const isWindow = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Window]';
};

const destroy_children = function() {

	let children = Array.from(this.node.children);
	if (children.length > 0) {

		children.forEach((child) => {

			let element = ELEMENTS.find((e) => e.node === child) || null;
			if (element !== null) {
				element.destroy();
			}

		});

	}

};

const filter_value = (value, parsify, verify, mapify) => {

	value   = isString(value)     ? value   : null;
	parsify = isFunction(parsify) ? parsify : (v) => v;
	verify  = isFunction(verify)  ? verify  : (v) => (v !== undefined && v !== null);
	mapify  = isFunction(mapify)  ? mapify  : (v) => v;


	let data = parsify(value);

	if (verify(data) === true) {
		return mapify(data);
	}

	return null;

};

const filter_values = (values, parsify, verify, mapify) => {

	values  = isArray(values)     ? values  : [];
	parsify = isFunction(parsify) ? parsify : (v) => v;
	verify  = isFunction(verify)  ? verify  : (v) => (v !== undefined && v !== null);
	mapify  = isFunction(mapify)  ? mapify  : (v) => v;


	return values.map((value) => {
		return value.trim();
	}).filter((value) => {
		return value !== '';
	}).map((value) => {
		return parsify(value);
	}).filter((value) => {
		return verify(value);
	}).map((value) => {
		return mapify(value);
	});

};

const parse_value = (raw) => {

	raw = isString(raw) ? raw : (raw).toString();


	let val = null;

	if (raw === 'true') {
		val = true;
	} else if (raw === 'false') {
		val = false;
	} else if (raw === '(none)' || raw === 'null') {
		val = null;
	} else if (raw.startsWith('[') === true) {

		try {
			val = JSON.parse(raw);
		} catch (err) {
			val = null;
		}

	} else if (raw.startsWith('{') === true) {

		try {
			val = JSON.parse(raw);
		} catch (err) {
			val = null;
		}

	} else if (/^([0-9.]+)$/g.test(raw) === true) {

		let num = null;

		if (raw.includes('.') === true) {
			num = parseFloat(raw);
		} else {
			num = parseInt(raw, 10);
		}

		if (Number.isNaN(num) === false) {

			if ((num).toString() === raw.trim()) {
				val = num;
			} else {
				val = raw;
			}

		} else {
			val = raw;
		}

	} else {
		val = raw;
	}

	return val;

};

const render_value = (val) => {

	let san = '';

	if (val === null) {
		san = 'null';
	} else if (isBoolean(val) === true) {
		san = (val).toString();
	} else if (isString(val) === true) {
		san = val;
	} else if (isArray(val) === true) {
		san = JSON.stringify(val);
	} else if (isObject(val) === true) {
		san = JSON.stringify(val);
	} else if (isNumber(val) === true) {
		san = (val).toString();
	}

	return san;

};

const validate_value = (value, pattern) => {

	value   = isString(value)   ? value   : render_value(value);
	pattern = isString(pattern) ? pattern : null;


	if (pattern !== null) {

		if (pattern.startsWith('^') === false) {
			pattern = '^' + pattern;
		}

		if (pattern.endsWith('$') === false) {
			pattern = pattern + '$';
		}

		let regexp = new RegExp(pattern);
		if (regexp.test(value) === true) {
			return true;
		}

	}

	return false;

};



const Element = function(type, content) {

	this.node = null;
	this.type = null;

	this.__events    = {};
	this.__journal   = [];
	this.__listeners = {};


	if (isHTMLElement(type) === true) {

		this.node = type;
		this.type = this.node.tagName.toLowerCase();

		// XXX: Used with event.target, so don't push to ELEMENTS cache

	} else if (isString(type) === true) {

		this.node = global.document.createElement(type);
		this.type = this.node.tagName.toLowerCase();

		ELEMENTS.push(this);

	} else {

		return null;

	}


	if (isContent(content) === true) {

		if (isString(content) === true) {

			this.node.innerHTML = content.trim().split('\n').map((c) => c.trim()).join('');

		} else if (isHTMLElement(content) === true) {

			this.node.appendChild(content);

		} else if (isArray(content) === true) {

			let elements = content.filter((c) => isElement(c) === true);
			let nodes    = content.filter((c) => isHTMLElement(c) === true);
			let strings  = content.filter((c) => isString(c) === true);

			if (elements.length > 0) {

				elements.forEach((element) => {

					if (element.node !== null) {
						this.node.appendChild(element.node);
					}

				});

			} else if (nodes.length > 0) {

				nodes.forEach((node) => {
					this.node.appendChild(node);
				});

			} else if (strings.length > 0) {

				this.node.innerHTML = strings.map((str) => {
					return str.trim().split('\n').map((c) => c.trim()).join('');
				}).join('');

			}

		}

	}

};


Element.isElement = isElement;


Element.query = function(query, scope, multiple) {

	query    = isString(query)     ? query    : null;
	scope    = isWindow(scope)     ? scope    : global;
	multiple = isBoolean(multiple) ? multiple : false;


	let document = scope['document'] || null;
	let found    = null;

	if (document !== null && query !== null) {

		let nodes = Array.from(document.querySelectorAll(query));
		if (nodes.length > 1 || multiple === true) {

			found = [];

			nodes.forEach((node) => {

				let element = ELEMENTS.find((e) => e.node === node) || null;
				if (element === null) {
					element = new Element(node);
				}

				found.push(element);

			});

		} else if (nodes.length === 1) {

			found = ELEMENTS.find((element) => {
				return element.node === nodes[0];
			}) || null;

			if (found === null) {
				found = new Element(nodes[0]);
			}

		}

	}

	return found;

};


Element.toElement = function(node) {

	node = isHTMLElement(node) ? node : null;


	if (node !== null) {

		let element = ELEMENTS.find((e) => e.node === node) || null;
		if (element === null) {
			element = new Element(node);
		}

		return element;

	}


	return null;

};


Element.prototype = {

	[Symbol.toStringTag]: 'Element',

	toJSON: function() {

		let data = {
			node:    null,
			type:    null,
			content: null,
			events:  Object.keys(this.__events),
			journal: []
		};

		if (this.node !== null) {
			data.content = this.node.innerHTML.trim();
		}

		if (this.type !== null) {
			data.type = this.type;
		}

		if (this.__journal.length > 0) {

			this.__journal.sort((a, b) => {

				if (a.time < b.time) return -1;
				if (b.time < a.time) return  1;

				if (a.event < b.event) return -1;
				if (b.event < a.event) return  1;

				return 0;

			}).forEach((entry) => {

				data.journal.push({
					event: entry.event,
					time:  entry.time
				});

			});

		}

		return {
			'type': 'Element',
			'data': data
		};

	},

	area: function(area) {

		area = isObject(area) ? area : null;


		if (area !== null) {

			let w = isNumber(area.w) ? (area.w | 0) : null;
			let h = isNumber(area.h) ? (area.h | 0) : null;
			let x = isNumber(area.x) ? (area.x | 0) : null;
			let y = isNumber(area.y) ? (area.y | 0) : null;
			let z = isNumber(area.z) ? (area.z | 0) : null;

			if (w !== null) {
				this.node.style['width'] = w + 'px';
			} else {
				this.node.style['width'] = '';
			}

			if (h !== null) {
				this.node.style['height'] = h + 'px';
			} else {
				this.node.style['height'] = '';
			}

			if (x !== null) {

				if (w !== null) {
					x -= w / 2;
				}

				this.node.style['left'] = x + 'px';

			} else {
				this.node.style['left'] = '';
			}

			if (y !== null) {

				if (h !== null) {
					y -= h / 2;
				}

				this.node.style['top'] = y + 'px';

			} else {
				this.node.style['top'] = '';
			}

			if (z !== null) {
				this.node.style['z-index'] = z;
			} else {
				this.node.style['z-index'] = '';
			}

			return true;

		} else {

			area = {
				w: 0, h: 0,
				x: 0, y: 0, z: 0
			};

			let rect = this.node.getBoundingClientRect();
			if (rect !== null) {
				area.w = rect.width;
				area.h = rect.height;
				area.x = (rect.left + area.w / 2) | 0;
				area.y = (rect.top  + area.h / 2) | 0;
			}

			let z_index = this.node.style['z-index'] || null;
			if (z_index !== null) {

				let num = parseInt(z_index, 10);
				if (Number.isNaN(num) === false) {
					area.z = num;
				}

			}

			return area;

		}

	},

	attr: function(key, val) {

		key = isString(key)     ? key : null;
		val = val !== undefined ? val : undefined;


		if (key !== null) {

			if (val !== undefined) {

				let attributes = Object.keys(this.node.attributes).map((a) => this.node.attributes[a].name);

				if (key === 'required') {

					// Not listed in node.attributes
					this.node.setAttribute('required', val);

				} else if (attributes.includes(key) === true) {

					let san = render_value(val);
					if (san.length === 0) {
						this.node.removeAttribute(key);
					} else {
						this.node.setAttribute(key, san);
					}

				} else if (this.node[key] !== undefined) {

					this.node[key] = val;

				} else {

					let san = render_value(val);
					if (san.length === 0) {
						this.node.removeAttribute(key);
					} else {
						this.node.setAttribute(key, san);
					}

				}

				return true;

			} else {

				let attributes = Object.keys(this.node.attributes).map((a) => this.node.attributes[a].name);

				if (key === 'required') {

					// Not listed in node.attributes
					let raw = this.node.getAttribute(key);
					if (raw === 'true') {
						return true;
					} else if (raw === 'false') {
						return false;
					}

				} else if (attributes.includes(key) === true) {

					let raw = this.node.getAttribute(key);
					if (isString(raw) === true) {
						return parse_value(raw);
					} else if (raw !== null) {
						return raw;
					}

				} else if (this.node[key] !== undefined) {

					let raw = this.node[key];
					if (isString(raw) === true) {
						return parse_value(raw);
					} else if (raw !== null) {
						return raw;
					}

				}

				return null;

			}

		}


		return null;

	},

	destroy: function() {

		destroy_children.call(this);

		let parent = this.node.parentNode || null;
		if (parent !== null) {
			parent.removeChild(this.node);
		}

		let index = ELEMENTS.indexOf(this);
		if (index !== -1) {
			ELEMENTS.splice(index, 1);
		}

		return true;

	},

	emit: function(event, args) {

		event = isString(event) ? event : null;
		args  = isArray(args)   ? args  : [];


		if (event !== null) {

			if (
				Object.keys(DOMEVENT).includes(event) === true
				&& args.length === 0
			) {

				let listener = this.__listeners[event] || null;
				let trigger  = DOMEVENT[event] || null;
				if (listener !== null && trigger !== null) {

					if (isFunction(this.node[trigger]) === true) {

						this.node[trigger]();

						return null;

					}

				}

				if (args.length === 0) {
					args = [ new FakeEvent() ];
				}

			}

			let events = this.__events[event] || null;
			if (events !== null) {

				this.__journal.push({
					event: event,
					time:  Date.now()
				});


				let data = null;

				for (let e = 0, el = events.length; e < el; e++) {

					let entry = events[e];
					if (entry.once === true) {

						try {

							let result = entry.callback.apply(null, args);
							if (result !== null && result !== undefined) {
								data = result;
							}

						} catch (err) {

							if (ENVIRONMENT.flags.debug === true) {
								console.error(err);
							}

						}

						events.splice(e, 1);
						el--;
						e--;

					} else {

						try {

							let result = entry.callback.apply(null, args);
							if (result !== null && result !== undefined) {
								data = result;
							}

						} catch (err) {

							if (ENVIRONMENT.flags.debug === true) {
								console.error(err);
							}

						}

					}

				}

				if (events.length === 0) {

					let listener = this.__listeners[event] || null;
					if (listener !== null) {

						this.node.removeEventListener(event, listener, true);
						listener = this.__listeners[event] = null;

					}

				}

				return data;

			} else {

				if (isFunction(this.node[event]) === true) {

					this.node[event]();

					return null;

				}

			}

		}


		return null;

	},

	erase: function() {

		let parent = this.node.parentNode || null;
		if (parent !== null) {
			parent.removeChild(this.node);
		}

	},

	focus: function() {

		if (
			this.type === 'a'
			|| this.type === 'button'
			|| this.type === 'input'
			|| this.type === 'textarea'
			|| this.attr('tabindex') !== null
		) {

			this.node.focus();

			return true;

		}


		return false;

	},

	has: function(event) {

		event = isString(event) ? event : null;


		if (event !== null) {

			let events = this.__events[event] || null;
			if (isArray(events) === true && events.length > 0) {
				return true;
			}

		}


		return false;

	},

	off: function(event, callback) {

		event    = isString(event)      ? event    : null;
		callback = isFunction(callback) ? callback : null;


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events !== null) {

				if (callback !== null) {
					this.__events[event] = events.filter((e) => e.callback !== callback);
				} else {
					this.__events[event] = [];
				}

				if (this.__events[event].length === 0) {

					let listener = this.__listeners[event] || null;
					if (listener !== null) {

						this.node.removeEventListener(event, listener, true);
						listener = this.__listeners[event] = null;

					}

				}

				return true;

			}

		}


		return false;

	},

	on: function(event, callback) {

		event    = isString(event)      ? event    : null;
		callback = isFunction(callback) ? callback : null;


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events === null) {
				events = this.__events[event] = [];
			}

			if (Object.keys(DOMEVENT).includes(event) === true) {

				let listener = this.__listeners[event] || null;
				if (listener === null) {

					listener = this.__listeners[event] = function() {

						let args = [];
						for (let a = 0, al = arguments.length; a < al; a++) {
							args.push(arguments[a]);
						}

						if (args.length === 0) {
							args.push(new FakeEvent());
						}

						this.emit(event, args);

					}.bind(this);

					this.node.addEventListener(event, listener, true);

				}

			}

			events.push({
				callback: callback,
				once:     false
			});

			return true;

		}


		return false;

	},

	once: function(event, callback) {

		event    = isString(event)      ? event    : null;
		callback = isFunction(callback) ? callback : null;


		if (event !== null) {

			let events = this.__events[event] || null;
			if (events === null) {
				events = this.__events[event] = [];
			}

			let listener = this.__listeners[event] || null;
			if (listener === null) {

				listener = this.__listeners[event] = function() {

					let args = [];
					for (let a = 0, al = arguments.length; a < al; a++) {
						args.push(arguments[a]);
					}

					this.emit(event, args);

				}.bind(this);

				this.node.addEventListener(event, listener, true);

			}

			events.push({
				callback: callback,
				once:     true
			});

			return true;

		}


		return false;

	},

	query: function(query, multiple) {

		query    = isString(query)     ? query    : null;
		multiple = isBoolean(multiple) ? multiple : false;


		let found = null;

		if (query !== null) {

			let nodes = Array.from(this.node.querySelectorAll(query));
			if (nodes.length > 1 || multiple === true) {

				found = [];

				nodes.forEach((node) => {

					let element = ELEMENTS.find((e) => e.node === node) || null;
					if (element !== null) {

						found.push(element);

					} else {

						element      = new Element(node.tagName.toLowerCase());
						element.node = node;

						found.push(element);

					}

				});

			} else if (nodes.length === 1) {

				found = ELEMENTS.find((element) => {
					return element.node === nodes[0];
				}) || null;

				if (found === null) {

					found      = new Element(nodes[0].tagName.toLowerCase());
					found.node = nodes[0];

				}

			}

		}

		return found;

	},

	render: function(target) {

		target = isElement(target) ? target : null;


		if (target !== null) {

			if (isFunction(target.node.appendChild) === true) {
				target.node.appendChild(this.node);
			}

			return true;

		}


		return false;

	},

	state: function(state) {

		state = isString(state) ? state : null;


		if (state !== null) {

			let type = this.type;
			if (type === 'button') {

				if (state === 'disabled') {
					this.node.setAttribute('disabled', true);
				} else if (state === 'enabled') {
					this.node.removeAttribute('disabled');
				} else {
					this.node.className = state;
				}

			} else if (type === 'input' || type === 'textarea') {

				if (state === 'disabled') {
					this.node.setAttribute('disabled', true);
				} else if (state === 'enabled') {
					this.node.removeAttribute('disabled');
				} else {
					this.node.className = state;
				}

			} else {
				this.node.className = state;
			}

			return true;

		} else {

			let type = this.type;
			if (type === 'button') {

				let state = this.node.getAttribute('disabled') || null;
				if (state !== null) {
					return 'disabled';
				} else if (this.node.className !== '') {
					return this.node.className;
				} else {
					return 'enabled';
				}

			} else if (type === 'input' || type === 'textarea') {

				let state = this.node.getAttribute('disabled') || null;
				if (state !== null) {
					return 'disabled';
				} else if (this.node.className !== '') {
					return this.node.className;
				} else {
					return 'enabled';
				}

			} else {
				return this.node.className || null;
			}

		}

	},

	validate: function() {

		let value = this.value();

		if (this.type === 'input') {

			if (this.node.getAttribute('size') !== null) {

				let min_bound = 1;

				if (this.node.getAttribute('placeholder') !== null) {
					min_bound = this.node.getAttribute('placeholder').length;
				}

				this.node.setAttribute('size', Math.max(min_bound, this.node.value.length));

			}

			if (value === null) {
				this.state('invalid');
			} else {
				this.state('');
			}

		} else if (this.type === 'textarea') {

			if (this.node.getAttribute('rows') !== null) {
				this.node.setAttribute('rows', Math.max(1, this.node.value.split('\n').length));
			}

			if (value.length === 0) {
				this.state('invalid');
			} else {
				this.state('');
			}

		}

	},

	value: function(value) {

		value = value !== undefined ? value : undefined;


		if (value !== undefined) {

			let val = this.node.getAttribute('data-val');
			if (val !== null) {

				let map = this.node.getAttribute('data-map');
				if (map === 'DATETIME' || map === 'DATE' || map === 'TIME') {
					this.node.setAttribute('data-val', DATETIME.render(value));
				} else if (map === 'IP') {
					this.node.setAttribute('data-val', IP.render(value));
				} else if (map === 'UA') {
					this.node.setAttribute('data-val', UA.render(value));
				} else if (map === 'URL') {
					this.node.setAttribute('data-val', URL.render(value));
				} else {

					let pattern = this.node.getAttribute('pattern');
					if (pattern !== null) {

						if (validate_value(value, pattern) === true) {
							this.node.setAttribute('data-val', render_value(value));
						} else {
							this.node.setAttribute('data-val', null);
						}

					} else {
						this.node.setAttribute('data-val', render_value(value));
					}

				}

			} else {

				let type = this.type;
				if (type === 'input') {

					let map = this.node.getAttribute('data-map');
					if (map === 'DATETIME' || map === 'DATE' || map === 'TIME') {
						this.node.value = DATETIME.render(value);
					} else if (map === 'IP') {
						this.node.value = IP.render(value);
					} else if (map === 'UA') {
						this.node.value = UA.render(value);
					} else if (map === 'URL') {
						this.node.value = URL.render(value);
					} else {

						let pattern = this.node.getAttribute('pattern');
						if (pattern !== null) {

							if (validate_value(value, pattern) === true) {
								this.node.value = render_value(value);
							} else {
								this.node.value = null;
							}

						} else {
							this.node.value = value !== null ? render_value(value) : null;
						}

					}

					if (this.node.getAttribute('size') !== null) {

						let min_bound = 1;

						if (this.node.getAttribute('placeholder') !== null) {
							min_bound = this.node.getAttribute('placeholder').length;
						}

						this.node.setAttribute('size', Math.max(min_bound, this.node.value.length));

					}

				} else if (type === 'select') {

					let tmp = isArray(value) ? value : [ value ];
					let map = this.node.getAttribute('data-map');
					if (map === 'DATETIME' || map === 'DATE' || map === 'TIME') {
						tmp = tmp.map((v) => DATETIME.render(v));
					} else if (map === 'IP') {
						tmp = tmp.map((v) => IP.render(v));
					} else if (map === 'UA') {
						tmp = tmp.map((v) => UA.render(v));
					} else if (map === 'URL') {
						tmp = tmp.map((v) => URL.render(v));
					} else {

						let pattern = this.node.getAttribute('pattern');
						if (pattern !== null) {
							tmp = tmp.map((v) => render_value(v)).filter((v) => validate_value(v, pattern));
						} else {
							tmp = tmp.map((v) => render_value(v));
						}

					}

					let multiple = this.node.getAttribute('multiple');
					if (multiple !== null) {

						Array.from(this.node.options).forEach((option) => {

							if (tmp.includes(option.getAttribute('value')) === true) {
								option.setAttribute('selected', true);
							} else {
								option.removeAttribute('selected');
							}

						});

					} else {

						Array.from(this.node.options).forEach((option) => {
							option.removeAttribute('selected');
						});

						let active = Array.from(this.node.options).find((option) => {
							return tmp.includes(option.getAttribute('value')) === true;
						}) || null;

						if (active !== null) {
							active.setAttribute('selected', true);
						}

					}

				} else if (type === 'textarea') {

					let map = this.node.getAttribute('data-map');
					if (map === 'DATETIME' || map === 'DATE' || map === 'TIME') {

						if (isArray(value) === true) {
							this.node.value = value.map((v) => DATETIME.render(v)).join('\n');
						} else {
							this.node.value = DATETIME.render(value);
						}

					} else if (map === 'IP') {

						if (isArray(value) === true) {
							this.node.value = value.map((v) => IP.render(v)).join('\n');
						} else {
							this.node.value = IP.render(value);
						}

					} else if (map === 'UA') {

						if (isArray(value) === true) {
							this.node.value = value.map((v) => UA.render(v)).join('\n');
						} else {
							this.node.value = UA.render(value);
						}

					} else if (map === 'URL') {

						if (isArray(value) === true) {
							this.node.value = value.map((v) => URL.render(v)).join('\n');
						} else {
							this.node.value = URL.render(value);
						}

					} else {

						let pattern = this.node.getAttribute('pattern');
						if (pattern !== null) {

							if (isArray(value) === true) {
								let validated = value.map((v) => render_value(v)).filter((v) => validate_value(v, pattern));
								this.node.value = validated.join('\n');
							} else {

								if (validate_value(value, pattern) === true) {
									this.node.value = render_value(value);
								} else {
									this.node.value = null;
								}

							}

						} else {

							if (isArray(value) === true) {
								this.node.value = value.map((v) => render_value(v)).join('\n');
							} else {
								this.node.value = value !== null ? render_value(value) : null;
							}

						}

					}

					if (this.node.getAttribute('rows') !== null) {
						this.node.setAttribute('rows', Math.max(1, this.node.value.split('\n').length));
					}

				} else {

					let map = this.node.getAttribute('data-map');
					if (map === 'DATETIME' || map === 'DATE' || map === 'TIME') {

						destroy_children.call(this);

						if (isArray(value) === true) {
							this.node.innerHTML = value.map((v) => DATETIME.render(v)).join('\n');
						} else {
							this.node.innerHTML = DATETIME.render(value);
						}

					} else if (map === 'IP') {

						destroy_children.call(this);

						if (isArray(value) === true) {
							this.node.innerHTML = value.map((v) => IP.render(v)).join('\n');
						} else {
							this.node.innerHTML = IP.render(value);
						}

					} else if (map === 'UA') {

						destroy_children.call(this);

						if (isArray(value) === true) {
							this.node.innerHTML = value.map((v) => UA.render(v)).join('\n');
						} else {
							this.node.innerHTML = UA.render(value);
						}

					} else if (map === 'URL') {

						destroy_children.call(this);

						if (isArray(value) === true) {
							this.node.innerHTML = value.map((v) => URL.render(v)).join('\n');
						} else {
							this.node.innerHTML = URL.render(value);
						}

					} else {

						destroy_children.call(this);

						if (isArray(value) === true) {

							let elements = value.filter((v) => isElement(v) === true);
							let nodes    = value.filter((v) => isHTMLElement(v) === true);
							let strings  = value.filter((v) => isString(v) === true);

							if (elements.length > 0) {

								elements.forEach((element) => {

									if (element.node !== null) {
										this.node.appendChild(element.node);
									}

								});

							} else if (nodes.length > 0) {

								nodes.forEach((node) => {
									this.node.appendChild(node);
								});

							} else if (strings.length > 0) {

								this.node.innerHTML = strings.join('\n');

							} else {

								this.node.innerHTML = value.map((v) => render_value(v)).join('\n');

							}

						} else {

							this.node.innerHTML = render_value(value);

						}

					}

				}

			}

			return true;

		} else {

			let val = this.node.getAttribute('data-val');
			if (val !== null) {

				let map = this.node.getAttribute('data-map');
				if (map === 'DATETIME') {
					return filter_value(val, DATETIME.parse, DATETIME.isDATETIME);
				} else if (map === 'DATE') {
					return filter_value(val, DATETIME.parse, DATETIME.isDate);
				} else if (map === 'TIME') {
					return filter_value(val, DATETIME.parse, DATETIME.isTime);
				} else if (map === 'IP') {
					return filter_value(val, IP.parse, IP.isIP);
				} else if (map === 'UA') {
					return filter_value(val, UA.parse, UA.isUA);
				} else if (map === 'URL') {
					return filter_value(val, URL.parse, URL.isURL);
				} else {

					return filter_value(val, null, (value) => {

						let pattern = this.node.getAttribute('pattern');
						if (pattern !== null) {
							return validate_value(value, pattern);
						} else {
							return true;
						}

					}, (value) => parse_value(value));

				}

			} else {

				let type = this.type;
				if (type === 'input') {

					let map = this.node.getAttribute('data-map');
					let val = (this.node.value).trim();

					if (map === 'DATETIME') {
						return filter_value(val, DATETIME.parse, DATETIME.isDATETIME);
					} else if (map === 'DATE') {
						return filter_value(val, DATETIME.parse, DATETIME.isDate);
					} else if (map === 'TIME') {
						return filter_value(val, DATETIME.parse, DATETIME.isTime);
					} else if (map === 'IP') {
						return filter_value(val, IP.parse, IP.isIP);
					} else if (map === 'UA') {
						return filter_value(val, UA.parse, UA.isUA);
					} else if (map === 'URL') {
						return filter_value(val, URL.parse, URL.isURL);
					} else {

						return filter_value(val, null, (value) => {

							let pattern = this.node.getAttribute('pattern');
							if (pattern !== null) {
								return validate_value(value, pattern);
							} else {
								return true;
							}

						}, (value) => parse_value(value));

					}

				} else if (type === 'select') {

					let map = this.node.getAttribute('data-map');
					let val = null;

					let multiple = this.node.getAttribute('multiple');
					if (multiple !== null) {

						val = Array.from(this.node.options).filter((option) => {
							return option.selected === true;
						}).map((option) => ('' + option.getAttribute('value')).trim());

					} else {

						let option = Array.from(this.node.options).find((option) => {
							return option.selected === true;
						}) || null;

						if (option !== null) {
							val = ('' + option.getAttribute('value')).trim();
						} else {
							val = 'null';
						}

					}

					if (map === 'DATETIME') {

						if (isArray(val) === true) {
							return filter_values(val, DATETIME.parse, DATETIME.isDATETIME);
						} else {
							return filter_value(val, DATETIME.parse, DATETIME.isDATETIME);
						}

					} else if (map === 'DATE') {

						if (isArray(val) === true) {
							return filter_values(val, DATETIME.parse, DATETIME.isDate);
						} else {
							return filter_value(val, DATETIME.parse, DATETIME.isDate);
						}

					} else if (map === 'TIME') {

						if (isArray(val) === true) {
							return filter_values(val, DATETIME.parse, DATETIME.isTime);
						} else {
							return filter_value(val, DATETIME.parse, DATETIME.isTime);
						}

					} else if (map === 'IP') {

						if (isArray(val) === true) {
							return filter_values(val, IP.parse, IP.isIP);
						} else {
							return filter_value(val, IP.parse, IP.isIP);
						}

					} else if (map === 'UA') {

						if (isArray(val) === true) {
							return filter_values(val, UA.parse, UA.isUA);
						} else {
							return filter_value(val, UA.parse, UA.isUA);
						}

					} else if (map === 'URL') {

						if (isArray(val) === true) {
							return filter_values(val, URL.parse, URL.isURL);
						} else {
							return filter_value(val, URL.parse, URL.isURL);
						}

					} else {

						if (isArray(val) === true) {

							return filter_values(val, null, (value) => {

								let pattern = this.node.getAttribute('pattern');
								if (pattern !== null) {
									return validate_value(value, pattern);
								} else {
									return true;
								}

							}, (value) => parse_value(value));

						} else {

							return filter_value(val, null, (value) => {

								let pattern = this.node.getAttribute('pattern');
								if (pattern !== null) {
									return validate_value(value, pattern);
								} else {
									return true;
								}

							}, (value) => parse_value(value));

						}

					}

				} else if (type === 'textarea') {

					let map = this.node.getAttribute('data-map');
					let val = (this.node.value).trim();

					if (map === 'DATETIME') {

						return filter_values(val.split('\n'), DATETIME.parse, DATETIME.isDATETIME);

					} else if (map === 'DATE') {

						return filter_values(val.split('\n'), DATETIME.parse, DATETIME.isDate);

					} else if (map === 'TIME') {

						return filter_values(val.split('\n'), DATETIME.parse, DATETIME.isTime);

					} else if (map === 'IP') {

						return filter_values(val.split('\n'), IP.parse, IP.isIP);

					} else if (map === 'UA') {

						return filter_values(val.split('\n'), UA.parse, UA.isUA);

					} else if (map === 'URL') {

						return filter_values(val.split('\n'), URL.parse, URL.isURL);

					} else {

						return filter_values(val.split('\n'), null, (value) => {

							let pattern = this.node.getAttribute('pattern');
							if (pattern !== null) {
								return validate_value(value, pattern);
							} else {
								return true;
							}

						}, (value) => parse_value(value));

					}

				} else {

					let map = this.node.getAttribute('data-map');
					let val = (this.node.innerHTML).trim();

					if (map === 'DATETIME') {

						if (val.includes('\n') === true) {
							return filter_values(val.split('\n'), DATETIME.parse, DATETIME.isDATETIME);
						} else {
							return filter_value(val, DATETIME.parse, DATETIME.isDATETIME);
						}

					} else if (map === 'DATE') {

						if (val.includes('\n') === true) {
							return filter_values(val.split('\n'), DATETIME.parse, DATETIME.isDate);
						} else {
							return filter_value(val, DATETIME.parse, DATETIME.isDate);
						}

					} else if (map === 'TIME') {

						if (val.includes('\n') === true) {
							return filter_values(val.split('\n'), DATETIME.parse, DATETIME.isTime);
						} else {
							return filter_value(val, DATETIME.parse, DATETIME.isTime);
						}

					} else if (map === 'IP') {

						if (val.includes('\n') === true) {
							return filter_values(val.split('\n'), IP.parse, IP.isIP);
						} else {
							return filter_value(val, IP.parse, IP.isIP);
						}

					} else if (map === 'UA') {

						if (val.includes('\n') === true) {
							return filter_values(val.split('\n'), UA.parse, UA.isUA);
						} else {
							return filter_value(val, UA.parse, UA.isUA);
						}

					} else if (map === 'URL') {

						if (val.includes('\n') === true) {
							return filter_values(val.split('\n'), URL.parse, URL.isURL);
						} else {
							return filter_value(val, URL.parse, URL.isURL);
						}

					} else {

						if (val.includes('\n') === true) {
							return filter_values(val.split('\n'), null, null, (value) => parse_value(value));
						} else {
							return filter_value(val, null, null, (value) => parse_value(value));
						}

					}

				}

			}

		}

	}

};


export { Element };

