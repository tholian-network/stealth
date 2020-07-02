
import { Element  } from '../../design/index.mjs';
import { isString } from '../../extern/base.mjs';



const render = function() {

	if (this.header !== null) {

		this.widgets['history'].erase();
		this.widgets['address'].erase();
		this.widgets['mode'].erase();
		this.widgets['settings'].erase();
		this.button.erase();

		if (this.__state === 'active') {

			this.widgets['history'].render(this.element);
			this.widgets['address'].render(this.header);
			this.widgets['mode'].render(this.element);
			this.widgets['settings'].render(this.element);
			this.button.render(this.header);

			this.element.render(this.header);

		} else {

			this.widgets['history'].render(this.header);
			this.widgets['address'].render(this.header);
			this.widgets['mode'].render(this.header);
			this.widgets['settings'].render(this.header);

			this.element.erase();

		}

	}

};



const Splitter = function(browser, widgets) {

	this.button  = Element.from('button');
	this.element = Element.from('browser-splitter');
	this.header  = null;
	this.widgets = {};

	this.__state = '';


	this.widgets['history']  = widgets['history'];
	this.widgets['address']  = widgets['address'];
	this.widgets['mode']     = widgets['mode'];
	this.widgets['settings'] = widgets['settings'];


	this.button.attr('data-key', 'splitter');
	this.button.attr('title',    'Show additional Settings');

	this.button.on('click', () => {

		if (this.element.state() === 'active') {

			this.button.state('');
			this.element.state('');

		} else {

			this.button.state('active');
			this.element.state('active');

		}

	});

};


Splitter.prototype = {

	render: function(element) {

		element = Element.isElement(element) ? element : null;


		if (element !== null) {

			this.header = element;
			render.call(this);

		} else {

			this.header = null;
			render.call(this);

		}

	},

	state: function(state) {

		state = isString(state) ? state : null;


		if (state === 'active') {

			this.__state = 'active';
			render.call(this);

		} else {

			this.__state = '';
			render.call(this);

		}

		return true;

	}

};

export { Splitter };

