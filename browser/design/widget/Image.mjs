
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';
import { URL               } from '../../source/parser/URL.mjs';



const Image = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'fullscreen', 'download' ];
	this.element = new Element('browser-widget-image', [
		'<browser-widget-image-article>',
		'<img data-key="source" data-map="URL" data-val="null"/>',
		'</browser-widget-image-article>',
		'<browser-widget-image-footer>',
		'<button title="Download" data-action="download"></button>',
		'<button title="Show in Fullscreen Mode" data-action="fullscreen"></button>',
		'</browser-widget-image-footer>',
	]);

	this.buttons = {
		download:   this.element.query('button[data-action="download"]'),
		fullscreen: this.element.query('button[data-action="fullscreen"]')
	};

	this.model = {
		source: this.element.query('[data-key="source"]')
	};

	Widget.call(this);


	this.element.on('update', () => {

		this.buttons.download.erase();
		this.buttons.fullscreen.erase();


		let footer = this.element.query('browser-widget-image-footer');

		if (this.actions.includes('fullscreen') === true) {
			this.buttons.fullscreen.render(footer);
		}

		if (this.actions.includes('download') === true) {
			this.buttons.download.render(footer);
		}

	});


	if (this.buttons.download !== null) {

		this.buttons.download.on('click', () => {

			let value = this.value();
			if (value !== null) {

				let download = new Element('a');
				let filename = value.source.path.split('/').pop();

				download.attr('download', filename);
				download.attr('href',     '/stealth/' + value.source.link);

				download.emit('click');

			}

		});

	}

	if (this.buttons.fullscreen !== null) {

		this.buttons.fullscreen.on('click', () => {

			this.model.source.node.requestFullscreen().catch(() => {

				this.actions.remove('fullscreen');
				this.element.emit('update');

			});

		});

	}

	this.element.emit('update');

};


Image.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Image(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Image.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (URL.isURL(value.source) === true) {
				this.model.source.attr('src', '/stealth/' + value.source.link);
			}

			return Widget.prototype.value.call(this, value);

		} else {

			return Widget.prototype.value.call(this);

		}

	}

});


export { Image };

