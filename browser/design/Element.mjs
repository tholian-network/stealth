
import { isArray, isBoolean, isFunction, isNumber, isObject, isString } from '../extern/base.mjs';
import { IP                                                           } from '../source/parser/IP.mjs';
import { UA                                                           } from '../source/parser/UA.mjs';
import { URL                                                          } from '../source/parser/URL.mjs';



const global   = (typeof window !== 'undefined' ? window : this);
const ELEMENTS = [];

const FakeEvent = function() {

	this.x = 0;
	this.y = 0;
	this.preventDefault  = function() {};
	this.stopPropagation = function() {};

};

const isHTMLElement = function(element) {

	let str = Object.prototype.toString.call(element);
	if (str.startsWith('[object') && str.includes('HTML') && str.includes('Element]')) {
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

		let check = content.filter((c) => isElement(c) || isHTMLElement(c) || isString(c));
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

const parse_value = function(raw) {

	raw = isString(raw) ? raw : (raw).toString();


	let val = null;

	if (raw === 'true') {
		val = true;
	} else if (raw === 'false') {
		val = false;
	} else if (raw === '(none)' || raw === 'null') {
		val = null;
	} else if (raw.startsWith('[')) {

		try {
			val = JSON.parse(raw);
		} catch (err) {
			val = null;
		}

	} else if (raw.startsWith('{')) {

		try {
			val = JSON.parse(raw);
		} catch (err) {
			val = null;
		}

	} else if (/^([0-9.]+)$/g.test(raw)) {

		let num = null;

		if (raw.includes('.')) {
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

const render_value = function(val) {

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

			let elements = content.filter((c) => isElement(c));
			let nodes    = content.filter((c) => isHTMLElement(c));
			let strings  = content.filter((c) => isString(c));

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


Element.query = function(query, scope) {

	query = isString(query) ? query : null;
	scope = isWindow(scope) ? scope : global;


	let document = scope['document'] || null;
	let found    = null;

	if (document !== null && query !== null) {

		let nodes = Array.from(document.querySelectorAll(query));
		if (nodes.length > 1) {

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
				if (attributes.includes(key)) {

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
				if (attributes.includes(key)) {

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

			// Delegate DOM Event correctly instead
			let listener = this.__listeners[event] || null;
			if (listener !== null && args.length === 0) {

				if (isFunction(this.node[event]) === true) {

					this.node[event]();

					return null;

				}

				args = [ new FakeEvent() ];

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
							// Ignore
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
							// Ignore
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

	query: function(query) {

		query = isString(query) ? query : null;


		let found = null;

		if (query !== null) {

			let nodes = Array.from(this.node.querySelectorAll(query));
			if (nodes.length > 1) {

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

			if (state === 'enabled' || state === 'disabled') {

				let type = this.type;
				if (type === 'button' || type === 'input' || type === 'textarea') {

					if (state === 'disabled') {
						this.node.setAttribute('disabled', true);
					} else {
						this.node.removeAttribute('disabled');
					}

				} else {
					this.node.className = state;
				}

			} else {
				this.node.className = state;
			}

			return true;

		} else {

			let type = this.type;
			if (type === 'button' || type === 'input' || type === 'textarea') {

				let state = this.node.getAttribute('disabled') || null;
				if (state !== null) {
					return 'disabled';
				} else {
					return 'enabled';
				}

			} else {
				return this.node.className || null;
			}

		}

	},

	value: function(value) {

		value = value !== undefined ? value : undefined;


		if (value !== undefined) {

			let val = this.node.getAttribute('data-val');
			if (val !== null) {

				this.node.setAttribute('data-val', render_value(value));

			} else {

				let type = this.type;
				if (type === 'input') {

					let map = this.node.getAttribute('data-map');
					if (map === 'IP') {
						this.node.value = IP.render(value);
					} else if (map === 'UA') {
						this.node.value = UA.render(value);
					} else if (map === 'URL') {
						this.node.value = URL.render(value);
					} else {
						this.node.value = value !== null ? render_value(value) : null;
					}

				} else if (type === 'textarea') {

					let map = this.node.getAttribute('data-map');
					if (map === 'IP') {

						if (isArray(value) === true) {
							this.node.value = value.map((v) => IP.render(v)).join('\n');
							this.node.setAttribute('rows', value.length);
						} else {
							this.node.value = IP.render(value);
							this.node.setAttribute('rows', 1);
						}

					} else if (map === 'UA') {

						if (isArray(value) === true) {
							this.node.value = value.map((v) => UA.render(v)).join('\n');
							this.node.setAttribute('rows', value.length);
						} else {
							this.node.value = UA.render(value);
							this.node.setAttribute('rows', 1);
						}

					} else if (map === 'URL') {

						if (isArray(value) === true) {
							this.node.value = value.map((v) => URL.render(v)).join('\n');
							this.node.setAttribute('rows', value.length);
						} else {
							this.node.value = URL.render(value);
							this.node.setAttribute('rows', 1);
						}

					} else {

						if (isArray(value) === true) {
							this.node.value = value.map((v) => render_value(v)).join('\n');
							this.node.setAttribute('rows', value.length);
						} else {
							this.node.value = value !== null ? render_value(value) : null;
							this.node.setAttribute('rows', 1);
						}

					}

				} else {

					let map = this.node.getAttribute('data-map');
					if (map === 'IP') {

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

							let elements = value.filter((v) => isElement(v));
							let nodes    = value.filter((v) => isHTMLElement(v));
							let strings  = value.filter((v) => isString(v));

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

								this.node.innerHTML = strings.join('');

							} else {

								this.node.innerHTML = value.map((v) => render_value(v)).join('\n');

							}

						} else {

							this.node.innerHTML = render_value(value);

						}

					}

				}

			}

		} else {

			let val = this.node.getAttribute('data-val');
			if (val !== null) {

				return parse_value(val);

			} else {

				let type = this.type;
				if (type === 'input') {

					let map = this.node.getAttribute('data-map');
					let val = (this.node.value).trim();

					if (map === 'IP') {

						let check = IP.parse(val);
						if (IP.isIP(check) === true) {
							return check;
						} else {
							return null;
						}

					} else if (map === 'UA') {

						let check = UA.parse(val);
						if (UA.isUA(check) === true) {
							return check;
						} else {
							return null;
						}

					} else if (map === 'URL') {

						let check = URL.parse(val);
						if (URL.isURL(check) === true) {
							return check;
						} else {
							return null;
						}

					} else {
						return parse_value(val);
					}

				} else if (type === 'textarea') {

					let map = this.node.getAttribute('data-map');
					let val = (this.node.value).trim();

					if (map === 'IP') {

						return val.split('\n').map((v) => {
							return v.trim();
						}).filter((v) => {
							return v !== '';
						}).map((v) => {
							return IP.parse(v);
						}).filter((ip) => {
							return IP.isIP(ip);
						});

					} else if (map === 'UA') {

						return val.split('\n').map((v) => {
							return v.trim();
						}).filter((v) => {
							return v !== '';
						}).map((v) => {
							return UA.parse(v);
						}).filter((ua) => {
							return UA.isUA(ua);
						});

					} else if (map === 'URL') {

						return val.split('\n').map((v) => {
							return v.trim();
						}).filter((v) => {
							return v !== '';
						}).map((v) => {
							return URL.parse(v);
						}).filter((url) => {
							return URL.isURL(url);
						});

					} else {

						return val.split('\n').map((v) => {
							return parse_value(v.trim());
						});

					}

				} else {

					let map = this.node.getAttribute('data-map');
					let val = (this.node.innerHTML).trim();

					if (map === 'IP') {

						if (val.includes('\n')) {

							return val.split('\n').map((v) => {
								return v.trim();
							}).filter((v) => {
								return v !== '';
							}).map((v) => {
								return IP.parse(v);
							}).filter((ip) => {
								return IP.isIP(ip);
							});

						} else {

							let check = IP.parse(val);
							if (IP.isIP(check) === true) {
								return check;
							} else {
								return null;
							}

						}

					} else if (map === 'UA') {

						if (val.includes('\n')) {

							return val.split('\n').map((v) => {
								return v.trim();
							}).filter((v) => {
								return v !== '';
							}).map((v) => {
								return UA.parse(v);
							}).filter((ua) => {
								return UA.isUA(ua);
							});

						} else {

							let check = UA.parse(val);
							if (UA.isUA(check) === true) {
								return check;
							} else {
								return null;
							}

						}

					} else if (map === 'URL') {

						if (val.includes('\n')) {

							return val.split('\n').map((v) => {
								return v.trim();
							}).filter((v) => {
								return v !== '';
							}).map((v) => {
								return URL.parse(v);
							}).filter((url) => {
								return URL.isURL(url);
							});

						} else {

							let check = URL.parse(val);
							if (URL.isURL(check) === true) {
								return check;
							} else {
								return null;
							}

						}

					} else {

						if (val.includes('\n')) {
							return val.split('\n').map((v) => parse_value(v));
						} else {
							return parse_value(val);
						}

					}

				}

			}

		}

	}

};


export { Element };

