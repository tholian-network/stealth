
import { isArray, isBoolean, isFunction, isNumber, isObject, isString } from '../source/POLYFILLS.mjs';

import { console } from '../source/console.mjs';
import { IP      } from '../source/parser/IP.mjs';
import { URL     } from '../source/parser/URL.mjs';

const global = (typeof window !== 'undefined' ? window : this);
const doc    = global.document;
const CACHE  = {
	reality: [],
	virtual: []
};

const isElement = function(element) {

	let str = Object.prototype.toString.call(element);
	if (str.startsWith('[object') && str.includes('HTML') && str.endsWith('Element]')) {
		return true;
	}

	return false;

};

const Dummy = function() {

	this.x = 0;
	this.y = 0;
	this.preventDefault  = function() {};
	this.stopPropagation = function() {};

};



const Element = function(type, template, virtual) {

	virtual = isBoolean(virtual) ? virtual : true;


	this.element = null;

	this.__events    = {};
	this.__listeners = {};


	if (isElement(type)) {
		this.element = type;
	} else if (isString(type)) {
		this.element = doc.createElement(type);
	}

	if (isArray(template)) {

		template.filter((v) => isElement(v)).forEach((node) => {
			this.element.appendChild(node);
		});

	} else if (isString(template)) {
		this.element.innerHTML = template.trim().split('\n').join('');
	}


	if (this.element !== null && virtual === true) {

		if (CACHE.reality.includes(this.element) === false) {
			CACHE.reality.push(this.element);
			CACHE.virtual.push(this);
		}

	}

};


Element.isElement = function(element) {

	if (element !== undefined && element !== null) {
		return element instanceof Element;
	}

	return false;

};

Element.from = function(type, template, virtual) {

	if (isElement(type)) {
		return new Element(type);
	} else if (isString(type) && isString(template) && isBoolean(virtual)) {
		return new Element(type, template, virtual);
	} else if (isString(type) && isString(template)) {
		return new Element(type, template);
	} else if (isString(type)) {
		return new Element(type);
	}


	return null;

};

Element.query = function(query) {

	let node = doc.querySelector(query);
	if (node !== null) {

		let index = CACHE.reality.indexOf(node);
		if (index !== -1) {
			return CACHE.virtual[index];
		} else {
			return new Element(node);
		}

	}


	return null;

};


Element.prototype = {

	area: function(area) {

		area = isObject(area) ? area : null;


		if (area !== null) {

			let w = isNumber(area.w) ? (area.w | 0) : null;
			let h = isNumber(area.h) ? (area.h | 0) : null;
			let x = isNumber(area.x) ? (area.x | 0) : null;
			let y = isNumber(area.y) ? (area.y | 0) : null;
			let z = isNumber(area.z) ? (area.z | 0) : null;

			if (this.element !== null) {

				if (w !== null) {
					this.element.style['width'] = w + 'px';
				} else {
					this.element.style['width'] = '';
				}

				if (h !== null) {
					this.element.style['height'] = h + 'px';
				} else {
					this.element.style['height'] = '';
				}

				if (x !== null) {
					this.element.style['left'] = x + 'px';
				} else {
					this.element.style['left'] = '';
				}

				if (y !== null) {
					this.element.style['top'] = y + 'px';
				} else {
					this.element.style['top'] = '';
				}

				if (z !== null) {
					this.element.style['z-index'] = z + 'px';
				} else {
					this.element.style['z-index'] = '';
				}

				return true;

			}


			return false;

		} else {

			area = {
				w: 0, h: 0,
				x: 0, y: 0, z: 0
			};

			if (this.element !== null) {

				let rect = this.element.getBoundingClientRect();
				if (rect !== null) {
					area.w = rect.width;
					area.h = rect.height;
					area.x = (rect.left + area.w / 2) | 0;
					area.y = (rect.top  + area.h / 2) | 0;
				}

				let z_index = this.element.style['z-index'] || null;
				if (z_index !== null) {

					let num = parseInt(z_index, 10);
					if (Number.isNaN(num) === false) {
						area.z = num;
					}

				}

			}

			return area;

		}

	},

	emit: function(event, args) {

		event = isString(event) ? event : null;
		args  = isArray(args)   ? args  : (args !== undefined ? [ args ] : []);


		if (event !== null) {

			// Delegate DOM Event correctly instead
			let listener = this.__listeners[event] || null;
			if (listener !== null && args.length === 0) {

				if (this.element !== null) {

					if (isFunction(this.element[event])) {

						this.element[event]();

						return null;

					}

				}

				args = [ new Dummy() ];

			}


			let events = this.__events[event] || null;
			if (events !== null) {

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

						if (this.element !== null) {
							this.element.removeEventListener(event, listener, true);
						}

						listener = this.__listeners[event] = null;

					}

				}

				return data;

			}

		}


		return null;

	},

	erase: function(target) {

		target = isElement(target) ? target : null;


		if (target !== null) {

			if (isFunction(target.removeChild)) {

				if (this.element !== null) {
					target.removeChild(this.element);
				}

				if (this.element !== null) {

					let index1 = CACHE.reality.indexOf(this.element);
					let index2 = CACHE.virtual.indexOf(this);
					if (index1 !== -1 && index2 !== -1 && index1 === index2) {
						CACHE.reality.splice(index1, 1);
						CACHE.virtual.splice(index2, 1);
					} else if (index1 !== index2) {
						console.error('Virtual DOM cache corruption.      ');
						console.error('Please use Element.query(selector).');
					}

				}

			}

			return true;

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

				listener = this.__listeners[event] = this.emit.bind(this, event);

				if (this.element !== null) {
					this.element.addEventListener(event, listener, true);
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

						if (this.element !== null) {
							this.element.removeEventListener(event, listener, true);
						}

						listener = this.__listeners[event] = null;

					}

				}

				return true;

			}

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

				listener = this.__listeners[event] = this.emit.bind(this, event);

				if (this.element !== null) {
					this.element.addEventListener(event, listener, true);
				}

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


		if (query !== null) {

			if (this.element !== null) {

				let elements = Array.from(this.element.querySelectorAll(query));
				if (elements.length > 1) {
					return elements.map((e) => Element.from(e));
				} else if (elements.length === 1) {
					return Element.from(elements[0]);
				}

			}

		}


		return null;

	},

	render: function(target) {

		target = isElement(target) ? target : null;


		if (target !== null) {

			if (isFunction(target.appendChild)) {

				if (this.element !== null) {
					target.appendChild(this.element);
				}

			}

			return true;

		}


		return false;

	},

	attr: function(key, val) {

		key = isString(key) ? key : null;


		if (key !== null) {

			let san = null;

			if (isString(val)) {
				san = val;
			} else if (isArray(val)) {
				san = JSON.stringify(val);
			} else if (isObject(val)) {
				san = JSON.stringify(val);
			} else if (isNumber(val)) {
				san = (val).toString();
			}


			if (san !== null) {

				if (this.element !== null) {

					this.element.setAttribute(key, san);

					return true;

				}

				return false;

			} else {

				if (this.element !== null) {

					let raw = this.element.getAttribute(key);

					if (isString(raw)) {

						let val = null;

						if (raw.startsWith('[')) {

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
								val = num;
							}

						} else {
							val = raw;
						}

						return val;

					}

				}

				return null;

			}

		}


		return null;

	},

	state: function(state) {

		state = isString(state) ? state : null;


		if (state !== null) {

			if (this.element !== null) {

				if (state === 'enabled' || state === 'disabled') {

					let type = this.element.tagName.toLowerCase();
					if (type === 'button' || type === 'input' || type === 'textarea') {

						if (state === 'disabled') {
							this.element.setAttribute('disabled', true);
						} else {
							this.element.removeAttribute('disabled');
						}

					} else {
						this.element.className = state;
					}

				} else {
					this.element.className = state;
				}


				return true;

			}

			return false;

		} else {

			if (this.element !== null) {

				let type = this.element.tagName.toLowerCase();
				if (type === 'button' || type === 'input' || type === 'textarea') {

					let state = this.element.getAttribute('disabled') || null;
					if (state !== null) {
						return 'disabled';
					} else {
						return this.element.className || null;
					}

				} else {
					return this.element.className || null;
				}

			}

			return null;

		}

	},

	title: function(title) {

		title = isString(title) ? title : null;


		if (this.element !== null) {

			if (title !== null) {
				this.element.setAttribute('title', title);
			} else {
				this.element.removeAttribute('title');
			}

			return true;

		}


		return false;

	},

	value: function(value) {

		value = value !== undefined ? value : null;


		if (value !== null) {

			let element = this.element || null;
			if (element !== null) {

				let val = element.getAttribute('data-val');
				if (val !== null) {
					element.setAttribute('data-val', value);
				} else {

					let type = element.tagName.toLowerCase();
					if (type === 'input') {

						let map = element.getAttribute('data-map');
						if (map === 'IP') {
							element.value = IP.render(value);
						} else if (map === 'URL') {
							element.value = URL.render(value);
						} else {
							element.value = value;
						}

					} else if (type === 'textarea') {

						let map = element.getAttribute('data-map');
						if (map === 'IP') {

							if (isArray(value)) {
								element.value = value.map((v) => IP.render(v)).join('\n');
							} else {
								element.value = IP.render(value);
							}

						} else if (map === 'URL') {

							if (isArray(value)) {
								element.value = value.map((v) => URL.render(v)).join('\n');
							} else {
								element.value = URL.render(value);
							}

						} else {
							element.value = value;
						}

					} else {

						let map = element.getAttribute('data-map');
						if (map === 'IP') {

							if (isArray(value)) {
								element.innerHTML = value.map((v) => IP.render(v)).join('\n');
							} else {
								element.innerHTML = IP.render(value);
							}

						} else if (map === 'URL') {

							if (isArray(value)) {
								element.innerHTML = value.map((v) => URL.render(v)).join('\n');
							} else {
								element.innerHTML = URL.render(value);
							}

						} else {

							if (isArray(value) && value.length > 0 && isElement(value[0].element)) {

								element.innerHTML = '';

								value.forEach((child) => {
									element.appendChild(child.element);
								});

							} else if (isArray(value) && value.length > 0 && isElement(value[0])) {

								element.innerHTML = '';

								value.forEach((child) => {
									element.appendChild(child);
								});

							} else {
								element.innerHTML = value;
							}

						}

					}

				}

				return true;

			}


			return false;

		} else {

			let element = this.element || null;
			if (element !== null) {

				let val = element.getAttribute('data-val');
				if (val !== null) {
					return val;
				} else {

					let type = element.tagName.toLowerCase();
					if (type === 'input') {

						let map = element.getAttribute('data-map');
						let val = (element.value).trim();
						if (map === 'IP') {
							return IP.parse(val);
						} else if (map === 'URL') {
							return URL.parse(val);
						} else {
							return val;
						}

					} else if (type === 'textarea') {

						let map = element.getAttribute('data-map');
						let val = (element.value).trim();

						if (map === 'IP') {

							let raw = val.split('\n').map((v) => v.trim()).filter((v) => v !== '');

							return raw.map((v) => IP.parse(v)).filter((ip) => ip.type !== null);

						} else if (map === 'URL') {

							let raw = val.split('\n').map((v) => v.trim()).filter((v) => v !== '');

							return raw.map((v) => URL.parse(v)).filter((ref) => (ref.domain !== null || ref.host !== null));

						} else {
							return val;
						}

					} else {

						let map = element.getAttribute('data-map');
						let val = (element.innerHTML).trim();

						if (map === 'IP') {

							let raw = val.split('\n').map((v) => v.trim()).filter((v) => v !== '');

							return raw.map((v) => IP.parse(v)).filter((ip) => ip.type !== null);

						} else if (map === 'URL') {

							let raw = val.split('\n').map((v) => v.trim()).filter((v) => v !== '');

							return raw.map((v) => URL.parse(v)).filter((ref) => (ref.domain !== null || ref.host !== null));

						} else {
							return val;
						}

					}

				}

			}

		}


		return null;

	}

};


export const from  = Element.from;
export const query = Element.query;

export { Element };

