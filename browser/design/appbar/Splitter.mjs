
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';



const update = function() {

	if (this.header !== null) {

		this.appbar['address'].erase();
		this.appbar['history'].erase();
		this.appbar['mode'].erase();
		this.appbar['settings'].erase();
		this.button.erase();

		if (this.__state.mobile === true) {

			this.appbar['history'].render(this.element);

			this.appbar['address'].render(this.header);
			this.button.render(this.header);

			this.appbar['mode'].render(this.element);
			this.appbar['settings'].render(this.element);

			this.element.render(this.header);

		} else {

			this.appbar['history'].render(this.header);
			this.appbar['address'].render(this.header);
			this.appbar['mode'].render(this.header);
			this.appbar['settings'].render(this.header);

			this.element.erase();

		}

	}

};



const Splitter = function(/* browser */) {

	this.element = new Element('browser-splitter');
	this.header  = Element.query('header');

	this.__state = {
		mobile: false
	};


	this.appbar = {
		'history':  Widget.query('browser-history'),
		'address':  Widget.query('browser-address'),
		'mode':     Widget.query('browser-mode'),
		'settings': Widget.query('browser-settings')
	};

	this.button = new Element('button');
	this.button.attr('data-key', 'splitter');
	this.button.attr('title',    'Show additional Settings');

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
			this.__state.mobile = true;
		} else {
			this.__state.mobile = false;
		}

		update.call(this);

	});

	this.element.on('show', () => {

		this.button.state('active');
		this.element.state('active');

	});


	Widget.call(this);

};


Splitter.prototype = Object.assign({}, Widget.prototype);


export { Splitter };

