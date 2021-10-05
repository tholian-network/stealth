
import { Assistant } from '../Assistant.mjs';
import { Element   } from '../Element.mjs';
import { Widget    } from '../Widget.mjs';



const ASSISTANT = new Assistant({
	name:   'Site Mode',
	widget: 'appbar/Mode',
	events: {
		'click': 'Site Mode changed for current Tab.'
	}
});

const update = function(tab) {

	if (tab !== null) {

		if (tab.url.protocol === 'stealth') {

			Object.values(this.model.mode).forEach((button) => {
				button.state('disabled');
				button.value(true);
			});

		} else {

			Object.values(this.model.mode).forEach((button) => {
				button.state('enabled');
			});

		}

		this.value(tab.mode);

	} else {

		Object.values(this.model.mode).forEach((button) => {
			button.state('disabled');
			button.value(false);
		});

	}

};



const Mode = function(browser) {

	this.element = new Element('browser-appbar-mode', [
		'<input type="hidden" data-key="domain" data-val="welcome"/>',
		'<button data-key="mode.text" data-val="false" title="Allow/Disallow Text on current Site" disabled></button>',
		'<button data-key="mode.image" data-val="false" title="Allow/Disallow Image on current Site" disabled></button>',
		'<button data-key="mode.audio" data-val="false" title="Allow/Disallow Audio on current Site" disabled></button>',
		'<button data-key="mode.video" data-val="false" title="Allow/Disallow Video on current Site" disabled></button>',
		'<button data-key="mode.other" data-val="false" title="Allow/Disallow Other on current Site" disabled></button>'
	].join(''));

	this.model = {
		domain: this.element.query('[data-key="domain"]'),
		mode: {
			text:  this.element.query('[data-key="mode.text"]'),
			image: this.element.query('[data-key="mode.image"]'),
			audio: this.element.query('[data-key="mode.audio"]'),
			video: this.element.query('[data-key="mode.video"]'),
			other: this.element.query('[data-key="mode.other"]')
		}
	};

	Widget.call(this);


	this.element.on('contextmenu', (e) => {

		e.preventDefault();
		e.stopPropagation();

	});

	this.element.on('key', (key) => {

		if (key.name === 'f9') {

			let value = this.value();
			if (
				value.mode.text === true
				&& value.mode.image === true
				&& value.mode.audio === true
				&& value.mode.video === true
				&& value.mode.other === true
			) {

				this.model.mode.text.value(false);
				this.model.mode.image.value(false);
				this.model.mode.audio.value(false);
				this.model.mode.video.value(false);
				this.model.mode.other.value(false);

				if (browser.tab !== null) {

					if (
						browser.tab.url.protocol !== 'file'
						&& browser.tab.url.protocol !== 'stealth'
					) {

						let mode = this.value();
						if (mode !== null) {
							browser.setMode(mode);
						}

					}

				}

			} else {

				let button = Object.values(this.model.mode).find((b) => b.value() === false) || null;
				if (button !== null) {
					button.emit('click');
				}

			}

		}

	});


	Object.values(this.model.mode).forEach((button) => {

		button.on('click', () => {

			ASSISTANT.emit('click');

			let val = button.value();
			if (val === true) {
				button.value(false);
			} else if (val === false) {
				button.value(true);
			}


			if (browser.tab !== null) {

				if (
					browser.tab.url.protocol !== 'file'
					&& browser.tab.url.protocol !== 'stealth'
				) {

					let mode = this.value();
					if (mode !== null) {
						browser.setMode(mode);
					}

				}

			}

		});

	});


	browser.on('change',  () => update.call(this, browser.tab));
	browser.on('refresh', () => update.call(this, browser.tab));
	browser.on('show',    () => update.call(this, browser.tab));

};


Mode.prototype = Object.assign({}, Widget.prototype);


export { Mode };

