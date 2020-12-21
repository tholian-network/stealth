
import { Element           } from '../../design/Element.mjs';
import { Widget            } from '../../design/Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';
import { Image             } from '../../design/widget/Image.mjs';
import { Audio             } from '../../design/widget/Audio.mjs';
import { Video             } from '../../design/widget/Video.mjs';
import { URL               } from '../../source/parser/URL.mjs';



const Media = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'refresh', 'fullscreen', 'download' ];
	this.element = new Element('browser-widget-media', [
		'<h3>Media Player</h3>',
		'<browser-widget-media-header>',
		'<input type="text" data-key="source" data-map="URL" placeholder="Media URL" disabled/>',
		'</browser-widget-media-header>',
		'<browser-widget-media-article>',
		'</browser-widget-media-article>',
		'<browser-widget-media-footer>',
		'<button title="Refresh" data-action="refresh"></button>',
		'</browser-widget-media-footer>'
	]);

	this.buttons = {
		refresh: this.element.query('button[data-action="refresh"]')
	};

	this.model = {
		source: this.element.query('[data-key="source"]')
	};

	Widget.call(this);


	this.model.source.on('keyup', () => {
		this.model.source.validate();
	});

	this.element.on('update', () => {

		this.buttons.refresh.erase();


		if (this.actions.includes('refresh')) {

			this.model.source.attr('required', true);
			this.model.source.state('enabled');

		} else {

			this.model.source.attr('required', null);
			this.model.source.state('disabled');

		}


		let footer = this.element.query('browser-widget-media-footer');

		if (this.actions.includes('refresh')) {
			this.buttons.refresh.render(footer);
		}

	});


	if (this.buttons.refresh !== null) {

		this.buttons.refresh.on('click', () => {

			let value = this.value();
			if (value !== null) {

				if (URL.isURL(value.source) === true) {

					if (this.model.source.state() === 'enabled') {

						this.value({
							source: value.source
						});

					}

				}

			}

		});

	}

	this.element.emit('update');

};


Media.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Media(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Media.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (URL.isURL(value.source) === true) {

				let article = this.element.query('browser-widget-media-article');

				article.query('*', true).forEach((element) => {
					element.erase();
				});

				let type = value.source.mime.type;
				if (type === 'image') {

					let image = Image.from({ source: value.source }, this.actions);
					if (image !== null) {
						image.render(article);
					}

				} else if (type === 'audio') {

					let audio = Audio.from({ source: value.source }, this.actions);
					if (audio !== null) {
						audio.render(article);
					}

				} else if (type === 'video') {

					let video = Video.from({ source: value.source }, this.actions);
					if (video !== null) {
						video.render(article);
					}

				}

			}

			return Widget.prototype.value.call(this, value);

		} else {

			return Widget.prototype.value.call(this);

		}

	}

});


export { Media };

