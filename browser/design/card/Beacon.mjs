
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
		'<h3>',
		'<input title="Domain" type="text" data-key="domain" placeholder="domain.tld" size="10" disabled/>',
		'<input title="Path" type="text" data-key="path" pattern="/([A-Za-z0-9/._-]+)" placeholder="/path" size="5" disabled/>',
		'</h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-beacon-article>',
		'<table>',
		'<thead>',
		'\t<tr>',
		'\t\t<th>Label</th>',
		'\t\t<th>Select</th>',
		'\t\t<th>Mode</th>',
		'\t\t<th></th>',
		'\t</tr>',
		'</thead>',
		'<tbody></tbody>',
		'<tfoot class="disabled">',
		'\t<tr>',
		'\t\t<td><input title="Label for Beacon" type="text" data-key="beacon.label" placeholder="Label" disabled/></td>',
		'\t\t<td><textarea title="List of Selectors" data-key="beacon.select" rows="3" disabled></textarea></td>',
		'\t\t<td>',
		'\t\t\t<button title="Allow/Disallow Text" data-key="beacon.mode.text" data-val="false" disabled></button>',
		'\t\t\t<button title="Allow/Disallow Image" data-key="beacon.mode.image" data-val="false" disabled></button>',
		'\t\t\t<button title="Allow/Disallow Audio" data-key="beacon.mode.audio" data-val="false" disabled></button>',
		'\t\t\t<button title="Allow/Disallow Video" data-key="beacon.mode.video" data-val="false" disabled></button>',
		'\t\t\t<button title="Allow/Disallow Other" data-key="beacon.mode.other" data-val="false" disabled></button>',
		'\t\t</td>',
		'\t\t<td><button title="Append Beacon" data-action="append" disabled></button></td>',
		'\t</tr>',
		'</tfoot>',
		'</table>',
		'</browser-card-beacon-article>',
		'<browser-card-beacon-footer>',
		'<button title="Create Beacon" data-action="create"></button>',
		'<button title="Remove Beacon" data-action="remove"></button>',
		'<button title="Save Beacon" data-action="save"></button>',
		'</browser-card-beacon-footer>'
	]);

	this.buttons = {
		append:  this.element.query('button[data-action="append"]'),
		create:  this.element.query('button[data-action="create"]'),
		remove:  this.element.query('button[data-action="remove"]'),
		save:    this.element.query('button[data-action="save"]'),
		toggle:  this.element.query('button[data-action="toggle"]')
	};

	this.form = {
		create: this.element.query('[data-action="append"]'),
		model: {
			label:  this.element.query('[data-key="beacon.label"]'),
			select: this.element.query('[data-key="beacon.select"]'),
			mode: {
				text:  this.element.query('[data-key="beacon.mode.text"]'),
				image: this.element.query('[data-key="beacon.mode.image"]'),
				audio: this.element.query('[data-key="beacon.mode.audio"]'),
				video: this.element.query('[data-key="beacon.mode.video"]'),
				other: this.element.query('[data-key="beacon.mode.other"]')
			}
		}
	};

	this.model = {
		domain: this.element.query('[data-key="domain"]'),
		path:   this.element.query('[data-key="path"]'),
		beacons: []
	};

	Widget.call(this);


	this.model.domain.on('keyup', () => {
		this.model.domain.validate();
	});

	this.model.path.on('keyup', () => {
		this.model.path.validate();
	});

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

	this.element.on('update', () => {

		this.buttons.append.erase();
		this.buttons.create.erase();
		this.buttons.remove.erase();
		this.buttons.save.erase();


		if (this.actions.includes('create')) {

			this.model.domain.attr('required', true);
			this.model.domain.state('enabled');

			this.model.path.attr('required', true);
			this.model.path.state('enabled');

			this.forms.beacon.state('enabled');
			this.forms.beacon.query('button, input, textarea').forEach((element) => {
				element.state('enabled');
			});

		} else if (this.actions.includes('save')) {

			this.model.domain.attr('required', true);
			this.model.domain.state('disabled');

			this.model.path.attr('required', true);
			this.model.path.state('disabled');

			this.forms.beacon.state('enabled');
			this.forms.beacon.query('button, input, textarea').forEach((element) => {
				element.state('enabled');
			});

		} else {

			this.model.domain.state('disabled');
			this.model.path.state('disabled');

			this.forms.beacon.state('disabled');
			this.forms.beacon.query('button, input, textarea').forEach((element) => {
				element.state('disabled');
			});

		}

	});

	if (this.buttons.create !== null) {

		this.buttons.create.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['beacon'].save(value, (result) => {

					if (result === true) {

						browser.settings['beacons'].removeEvery((b) => b.domain === value.domain && b.path === value.path);
						browser.settings['beacons'].push(value);

						if (this.actions.includes('create') === true) {
							this.actions.remove('create');
						}

						if (this.actions.includes('save') === false) {
							this.actions.push('save');
						}

						this.element.emit('update');

					}

				});

			}

		});

	}

	if (this.buttons.remove !== null) {

		this.buttons.remove.on('click', () => {

			let value = this.value();

			browser.client.services['beacon'].remove(value, (result) => {

				if (result === true) {

					browser.settings['beacons'].removeEvery((b) => b.domain === value.domain && b.path === value.path);
					this.element.erase();

				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['beacon'].save(value, (result) => {

					if (result === true) {

						browser.settings['beacons'].removeEvery((b) => b.domain === value.domain && b.path === value.path);
						browser.settings['beacons'].push(value);

					}

				});

			}

		});

	}

	if (this.buttons.toggle !== null) {

		this.buttons.toggle.on('click', () => {

			if (this.element.state() === 'active') {
				this.element.emit('hide');
			} else {
				this.element.emit('show');
			}

		});

	}

	this.element.emit('update');

};


Beacon.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Beacon(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Beacon.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		// TODO: This needs to be refactored

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

