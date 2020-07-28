
import { Element                                } from '../Element.mjs';
import { Widget                                 } from '../Widget.mjs';
import { isArray, isBoolean, isObject, isString } from '../../extern/base.mjs';



const isBeacon = function(beacon) {

	if (
		isObject(beacon) === true
		&& isString(beacon.label) === true
		&& isArray(beacon.select) === true
		&& isObject(beacon.mode) === true
		&& isBoolean(beacon.mode.text) === true
		&& isBoolean(beacon.mode.image) === true
		&& isBoolean(beacon.mode.audio) === true
		&& isBoolean(beacon.mode.video) === true
		&& isBoolean(beacon.mode.other) === true
	) {
		return true;
	}


	return false;

};



const Beacon = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-beacon', [
		'<h3 title="Domain and Path">',
		'<span data-key="domain">example.com</span>',
		'<span data-key="path">/</span>',
		'</h3>',
		'<button title="Toggle visibility of this card" data-action="toggle"></button>',
		'<browser-card-beacon-article>',
		'</browser-card-beacon-article>',
		'<browser-card-beacon-footer>',
		'<button title="Create Beacon" data-action="create"></button>',
		'<button title="Remove Beacon" data-action="remove"></button>',
		'<button title="Save Beacon" data-action="save"></button>',
		'</browser-card-beacon-footer>'
	]);

	this.buttons = {
		create: this.element.query('button[data-action="create"]'),
		remove: this.element.query('button[data-action="remove"]'),
		save:   this.element.query('button[data-action="save"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		domain: this.element.query('[data-key="domain"]'),
		path:   this.element.query('[data-key="path"]'),
		beacons: []
	};

	Widget.call(this);


	this.element.on('show', () => {

		this.element.state('active');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('active');
		}

	});

	this.element.on('hide', () => {

		this.element.state('');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('');
		}

	});


	if (this.buttons.toggle !== null) {

		this.buttons.toggle.on('click', () => {

			if (this.element.state() === 'active') {
				this.element.emit('hide');
			} else {
				this.element.emit('show');
			}

		});

	}

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			browser.client.services['beacon'].remove(this.value(), (result) => {

				if (result === true) {
					// remove(browser, this.value());
					this.element.erase();
				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			browser.client.services['beacon'].save(this.value(), (result) => {

				if (result === true) {
					// update(browser, this.value());
				}

			});

		});

	}


};


Beacon.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (isArray(value.beacons) === true) {

				value.beacons = value.beacons.filter((b) => isBeacon(b));


				let article = this.element.query('browser-card-beacon-article');


				this.model.beacons = value.beacons.map(() => {

					let element = new Element('browser-card-beacon-beacon', [
						'<input title="Label" type="text" data-key="label"/>',
						'<input title="List of Selectors" type="text" data-key="select" data-map="CSV"/>',
						'<button title="Allow/Disallow Text Content" data-key="mode.text" data-val="false"></button>',
						'<button title="Allow/Disallow Image Content" data-key="mode.image" data-val="false"></button>',
						'<button title="Allow/Disallow Audio Content" data-key="mode.audio" data-val="false"></button>',
						'<button title="Allow/Disallow Video Content" data-key="mode.video" data-val="false"></button>',
						'<button title="Allow/Disallow Other Content" data-key="mode.other" data-val="false"></button>',
					]);

					element.render(article);


					return {
						label:  element.query('[data-key="label"]'),
						select: element.query('[data-key="select"]'),
						mode:   {
							text:  element.query('[data-key="mode.text"]'),
							image: element.query('[data-key="mode.image"]'),
							audio: element.query('[data-key="mode.audio"]'),
							video: element.query('[data-key="mode.video"]'),
							other: element.query('[data-key="mode.other"]')
						}
					};

				});

			}

			return Widget.prototype.value.call(this, value);

		} else {

			return Widget.prototype.value.call(this);

		}

	}

});


export { Beacon };

