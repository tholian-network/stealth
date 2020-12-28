
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';
import { URL               } from '../../source/parser/URL.mjs';



const Video = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'fullscreen', 'download' ];
	this.element = new Element('browser-widget-video', [
		'<browser-widget-video-article>',
		'<video data-key="source" data-map="URL" data-val="null"></video>',
		'</browser-widget-video-article>',
		'<browser-widget-video-footer>',
		'<button title="Play" data-action="play"></button>',
		'<progress value="0" max="100" title="0%"></progress>',
		'<button title="Download" data-action="download"></button>',
		'<button title="Show in Fullscreen Mode" data-action="fullscreen"></button>',
		'</browser-widget-video-footer>',
	]);

	this.buttons = {
		download:   this.element.query('button[data-action="download"]'),
		fullscreen: this.element.query('button[data-action="fullscreen"]'),
		play:       this.element.query('button[data-action="play"]')
	};

	this.model = {
		progress: this.element.query('progress'),
		source:   this.element.query('[data-key="source"]')
	};

	Widget.call(this);


	this.element.on('update', () => {

		this.buttons.download.erase();
		this.buttons.fullscreen.erase();


		let footer = this.element.query('browser-widget-video-footer');

		if (this.actions.includes('fullscreen') === true) {
			this.buttons.fullscreen.render(footer);
		}

		if (this.actions.includes('download') === true) {
			this.buttons.download.render(footer);
		}

	});

	this.model.progress.on('click', (event) => {

		let duration = this.model.source.node.duration || null;
		let rect     = this.model.progress.node.getBoundingClientRect();
		let position = ((event.clientX - rect.left) / rect.width) * duration;

		try {
			this.model.source.node.currentTime = position | 0;
		} catch (err) {
			// Ignore
		}

	});

	this.model.source.on('timeupdate', () => {

		let duration = this.model.source.node.duration    || null;
		let current  = this.model.source.node.currentTime || null;

		if (current !== null && duration !== null) {

			let percentage = (parseFloat((current / duration).toFixed(2)) * 100) | 0;

			this.model.progress.attr('value', percentage);
			this.model.progress.attr('title', percentage + '%');

		}

	});

	this.model.source.on('play', () => {
		this.buttons.play.attr('data-action', 'pause');
	});

	this.model.source.on('ended', () => {
		this.buttons.play.attr('data-action', 'play');
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

	if (this.buttons.play !== null) {

		this.buttons.play.on('click', () => {

			let action = this.buttons.play.attr('data-action');
			if (action === 'play') {

				this.buttons.play.attr('data-action', 'pause');
				this.model.source.node.play().catch(() => {});

			} else if (action === 'pause') {

				this.buttons.play.attr('data-action', 'play');
				this.model.source.node.pause();

			}

		});

	}

	this.element.emit('update');

};


Video.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Video(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Video.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (URL.isURL(value.source) === true) {
				this.model.source.attr('src', '/stealth/' + value.source.link);

				try {
					this.model.source.node.load();
				} catch (err) {
					// Ignore
				}

			}

			return Widget.prototype.value.call(this, value);

		} else {

			return Widget.prototype.value.call(this);

		}

	}

});


export { Video };

