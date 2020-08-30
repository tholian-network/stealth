
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';



const update = function() {

	let appbar  = Element.query('browser-appbar');
	let element = this.element;

	if (appbar !== null && element !== null) {

		this.appbar['address'].erase();
		this.appbar['history'].erase();
		this.appbar['mode'].erase();
		this.appbar['settings'].erase();
		this.button.erase();

		if (this.__state.mobile === true) {

			this.appbar['history'].render(element);

			this.appbar['address'].render(appbar);
			this.button.render(appbar);

			this.appbar['mode'].render(element);
			this.appbar['settings'].render(element);

			element.render(appbar);

		} else {

			this.appbar['history'].render(appbar);
			this.appbar['address'].render(appbar);
			this.appbar['mode'].render(appbar);
			this.appbar['settings'].render(appbar);

			element.erase();

		}

	}

};



const Splitter = function(/* browser */) {

	this.element = new Element('browser-appbar-splitter');

	this.__state = {
		mobile: false
	};


	this.appbar = {
		'history':  Widget.query('browser-appbar-history'),
		'address':  Widget.query('browser-appbar-address'),
		'mode':     Widget.query('browser-appbar-mode'),
		'settings': Widget.query('browser-appbar-settings')
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

		let old_state = this.__state.mobile;
		let new_state = old_state;

		if (width < 640) {
			new_state = true;
		} else {
			new_state = false;
		}

		if (old_state !== new_state) {
			this.__state.mobile = new_state;
			update.call(this);
		}

	});

	this.element.on('show', () => {

		this.button.state('active');
		this.element.state('active');

	});


	Widget.call(this);

};


Splitter.prototype = Object.assign({}, Widget.prototype);


export { Splitter };

