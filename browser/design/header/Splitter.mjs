
import { Element } from '../../design/index.mjs';



const update = function() {

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


	this.button.attr('data-key', 'splitter');
	this.button.attr('title',    'Show additional Settings');

	this.widgets['history']  = widgets['history'];
	this.widgets['address']  = widgets['address'];
	this.widgets['mode']     = widgets['mode'];
	this.widgets['settings'] = widgets['settings'];


	this.button.on('click', () => {

		if (this.element.state() === 'active') {
			this.element.emit('hide');
		} else {
			this.element.emit('show');
		}

	});

	this.element.on('hide', () => {

		this.button.state('');
		this.element.state('');

	});

	this.element.on('resize', (width /*, height */) => {

		if (width < 640) {
			this.__state = 'active';
		} else {
			this.__state = '';
		}

		update.call(this);

	});

	this.element.on('show', () => {

		this.button.state('active');
		this.element.state('active');

	});

};


Splitter.prototype = {

	render: function(element) {

		element = Element.isElement(element) ? element : null;


		if (element !== null) {
			this.header = element;
		} else {
			this.header = null;
		}

	}

};

export { Splitter };

