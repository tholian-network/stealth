
import { isArray, isObject, isString } from '../extern/base.mjs';
import { Element, isElement          } from './Element.mjs';



const WIDGETS = [];

export const isWidget = function(obj) {

	let str = Object.prototype.toString.call(obj);
	if (str.startsWith('[') && str.endsWith(']')) {
		str = str.substr(1, str.length - 2);
	}

	if (str.startsWith('object') && str.includes('browser-')) {

		if (isElement(obj.element) === true) {
			return true;
		}

	}

	return false;

};

const get_value = function(element) {

	let value = null;

	if (isElement(element) === true) {

		value = element.value();

	} else if (isArray(element) === true) {

		let check = element.filter((e) => (e.type === 'input' && e.attr('type') === 'radio'));
		if (check.length === element.length) {

			let active = element.find((other) => other.attr('checked') === true) || null;
			if (active !== null) {
				value = get_value(active);
			}

		} else {

			value = [];

			element.forEach((other, e) => {
				value.push(get_value(element[e]));
			});

		}

	} else if (isObject(element) === true) {

		value = {};

		Object.keys(element).forEach((key) => {
			value[key] = get_value(element[key]);
		});

	}

	return value;

};

const set_value = function(element, value) {

	value = value !== undefined ? value : null;


	let result = false;

	if (isElement(element) === true) {

		result = element.value(value);

	} else if (isArray(element) === true && isArray(value) === true) {

		let check = [];

		element.forEach((other, e) => {
			check.push(set_value(element[e], value[e]));
		});

		if (check.includes(false) === false) {
			result = true;
		}

	} else if (isArray(element) === true && isArray(value) === false) {

		let check = element.filter((e) => (e.type === 'input' && e.attr('type') === 'radio'));
		if (check.length === element.length) {

			element.forEach((other) => {

				let val = other.value();
				if (val === value) {
					other.attr('checked', true);
				} else {
					other.attr('checked', false);
				}

			});

		}

	} else if (isObject(element) === true && isObject(value) === true) {

		let check = [];

		Object.keys(element).forEach((key) => {
			check.push(set_value(element[key], value[key]));
		});

		if (check.includes(false) === false) {
			result = true;
		}

	}

	return result;

};



const Widget = function() {

	if (isElement(this.element) === true) {
		this[Symbol.toStringTag] = this.element.type + ' Widget';
	}


	WIDGETS.push(this);

};


Widget.isWidget = isWidget;


Widget.query = function(query) {

	query = isString(query) ? query : null;


	let found = null;

	if (query !== null) {

		found = WIDGETS.find((widget) => {

			if (widget.element !== null) {
				return widget.element.type === query;
			}

			return false;

		}) || null;

		if (found === null) {

			let value = Element.query(query);

			if (isArray(value) === true && value.length > 0) {

				found = [];

				value.forEach((element) => {

					let widget = WIDGETS.find((widget) => {
						return widget.element === element;
					}) || null;

					if (widget !== null) {
						found.push(widget);
					}

				});

			} else if (value !== null) {

				found = WIDGETS.find((widget) => {
					return widget.element === value;
				}) || null;

			}

		}

	}

	return found;

};


Widget.prototype = {

	[Symbol.toStringTag]: 'Widget',

	toJSON: function() {

		let data = {
			element: null,
			model:   null,
			state:   null
		};

		if (isElement(this.element) === true) {
			data.element = this.element.toJSON();
			data.state   = this.element.state();
		}

		if (isObject(this.model) === true) {
			data.model = get_value(this.model);
		}

		return {
			'type': 'Widget',
			'data': data
		};

	},

	area: function(area) {

		area = isObject(area) ? area : null;


		if (isElement(this.element) === true) {
			return this.element.area(area);
		}


		if (area !== null) {
			return false;
		} else {
			return null;
		}

	},

	destroy: function() {

		if (isElement(this.element) === true) {
			this.element.destroy();
		}

		let index = WIDGETS.indexOf(this);
		if (index !== -1) {
			WIDGETS.splice(index, 1);
		}

		return true;

	},

	emit: function(event, args) {

		if (isElement(this.element) === true) {
			return this.element.emit(event, args);
		}


		return null;

	},

	erase: function() {

		if (isElement(this.element) === true) {
			return this.element.erase();
		}


		return false;

	},

	has: function(event) {

		if (isElement(this.element) === true) {
			return this.element.has(event);
		}


		return false;

	},

	off: function(event, callback) {

		if (isElement(this.element) === true) {
			return this.element.off(event, callback);
		}


		return false;

	},

	on: function(event, callback) {

		if (isElement(this.element) === true) {
			return this.element.on(event, callback);
		}


		return false;

	},

	once: function(event, callback) {

		if (isElement(this.element) === true) {
			return this.element.once(event, callback);
		}


		return false;

	},

	query: function(query) {

		if (isElement(this.element) === true) {
			return this.element.query(query);
		}


		return null;

	},

	render: function(target) {

		if (isElement(this.element) === true) {
			return this.element.render(target);
		}


		return false;

	},

	state: function(state) {

		state = isString(state) ? state : null;


		if (isElement(this.element) === true) {
			return this.element.state(state);
		}


		if (state !== null) {
			return false;
		} else {
			return null;
		}

	},

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (isObject(this.model) === true) {
				return set_value(this.model, value);
			} else {
				return false;
			}

		} else {

			if (isObject(this.model) === true) {
				return get_value(this.model);
			} else {
				return null;
			}

		}

	}

};


export { Widget };

