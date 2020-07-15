
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
			element: null
		};

		if (isElement(this.element) === true) {
			data.element = this.element.toJSON();
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

	}

};


export { Widget };

