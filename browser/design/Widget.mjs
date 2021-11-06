
import { console, isArray, isBoolean, isNumber, isObject, isString } from '../extern/base.mjs';
import { Element, isElement                                        } from './Element.mjs';



const WIDGETS = [];

const isObjectAlike = function(obj) {

	if (obj === null) {
		return false;
	} else if (obj === undefined) {
		return false;
	} else if (isObject(obj) === true) {
		return true;
	} else {

		let str = Object.prototype.toString.call(obj);
		if (
			str.startsWith('[object') === true
			&& str.endsWith(']') === true
		) {
			return true;
		}

	}

	return false;

};

export const isWidget = function(obj) {

	let str = Object.prototype.toString.call(obj);
	if (str.startsWith('[') === true && str.endsWith(']') === true) {
		str = str.substr(1, str.length - 2);
	}

	if (str.startsWith('object') === true && str.includes('browser-') === true) {

		if (isElement(obj.element) === true) {
			return true;
		}

	}

	return false;

};

const getValue = function(element) {

	let value = null;

	if (isElement(element) === true) {

		value = element.value();

	} else if (isArray(element) === true) {

		let check = element.filter((e) => (e.type === 'input' && e.attr('type') === 'radio'));
		if (element.length > 0 && element.length === check.length) {

			let active = element.find((other) => other.attr('checked') === true) || null;
			if (active !== null) {
				value = getValue(active);
			}

		} else if (element.length > 0) {

			value = [];

			element.forEach((other, e) => {
				value.push(getValue(element[e]));
			});

		} else {

			value = [];

		}

	} else if (isObject(element) === true) {

		value = {};

		Object.keys(element).forEach((key) => {
			value[key] = getValue(element[key]);
		});

	} else if (
		isBoolean(element) === true
		|| isNumber(element) === true
		|| isString(element) === true
	) {

		value = element;

	}

	return value;

};

const setValue = (element, value) => {

	value = value !== undefined ? value : null;


	let result = false;

	if (isElement(element) === true) {

		element.value(value);

		result = true;

	} else if (
		isArray(element) === true
		&& isArray(value) === true
	) {

		let check = [];

		element.forEach((other, e) => {

			if (isBoolean(element[e]) === true && isBoolean(value[e]) === true) {
				element[e] = value[e];
				check.push(true);
			} else if (isNumber(element[e]) === true && isNumber(value[e]) === true) {
				element[e] = value[e];
				check.push(true);
			} else if (isString(element[e]) === true && isString(value[e]) === true) {
				element[e] = value[e];
				check.push(true);
			} else {
				check.push(setValue(element[e], value[e]));
			}

		});

		if (check.includes(false) === false) {
			result = true;
		}

	} else if (
		isArray(element) === true
		&& isArray(value) === false
	) {

		let check = element.filter((e) => (e.type === 'input' && e.attr('type') === 'radio'));
		if (element.length > 0 && element.length === check.length) {

			element.forEach((other) => {

				let val = other.value();
				if (val === value) {
					other.attr('checked', true);
				} else {
					other.attr('checked', false);
				}

			});

		}

	} else if (
		isObject(element) === true
		&& isObjectAlike(value) === true
	) {

		let check = [];

		Object.keys(element).forEach((key) => {

			if (isBoolean(element[key]) === true && isBoolean(value[key]) === true) {
				element[key] = value[key];
				check.push(true);
			} else if (isNumber(element[key]) === true && isNumber(value[key]) === true) {
				element[key] = value[key];
				check.push(true);
			} else if (isString(element[key]) === true && isString(value[key]) === true) {
				element[key] = value[key];
				check.push(true);
			} else {
				check.push(setValue(element[key], value[key]));
			}

		});

		if (check.includes(false) === false) {
			result = true;
		}

	}

	return result;

};

const validateValue = function(element, value) {

	let result = true;

	if (isElement(element) === true) {

		if (element.attr('required') === true) {

			if (value !== null) {
				element.state('');
			} else {
				element.state('invalid');
				result = false;
			}

		}

	} else if (isArray(element) === true) {

		let check = element.filter((e) => (e.type === 'input' && e.attr('type') === 'radio'));
		if (check.length === element.length) {

			let tmp = check.find((c) => c.attr('required') === true) || null;
			if (tmp !== null) {

				if (value !== null) {
					check.forEach((c) => c.state(''));
				} else {
					check.forEach((c) => c.state('invalid'));
					result = false;
				}

			}

		} else {

			element.forEach((other, e) => {

				let check = validateValue(other, value[e]);
				if (check !== true) {
					result = false;
				}

			});

		}

	} else if (isObject(element) === true) {

		Object.keys(element).forEach((key) => {

			let check = validateValue(element[key], value[key]);
			if (check !== true) {
				result = false;
			}

		});

	}

	return result;

};



const Widget = function() {

	if (isElement(this.element) === true) {
		this[Symbol.toStringTag] = this.element.type + ' Widget';
	}

	this.on('error', (err) => {
		console.error(err);
	});

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
			data.model = getValue(this.model);
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

	validate: function() {

		if (isObject(this.model) === true) {
			return validateValue(this.model, getValue(this.model));
		}


		return false;

	},

	value: function(value_or_instance) {

		let value = null;

		if (value_or_instance === undefined) {
			value = null;
		} else if (value_or_instance === null) {
			value = null;
		} else if (isObject(value_or_instance) === true) {
			value = value_or_instance;
		} else if (Object.keys(value_or_instance).length > 0) {
			value = value_or_instance;
		}

		if (value !== null) {

			if (isObject(this.model) === true) {
				return setValue(this.model, value);
			} else {
				return false;
			}

		} else {

			if (isObject(this.model) === true) {
				return getValue(this.model);
			} else {
				return null;
			}

		}

	}

};


export { Widget };

