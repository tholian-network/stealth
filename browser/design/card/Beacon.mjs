
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

		if (beacon.label.length > 3) {

			let check = beacon.select.filter((s) => isString(s));
			if (check.length === beacon.select.length) {
				return true;
			}

		}

	}


	return false;

};

const toElementModel = function(beacon) {

	beacon = isBeacon(beacon) ? beacon : null;


	if (beacon !== null) {

		let element = new Element('tr', [
			'<td><code data-key="beacon.label"></code></td>',
			'<td><code data-key="beacon.select"></code></td>',
			'<td>',
			'<button title="Allow/Disallow Text" data-key="beacon.mode.text" data-val="false" disabled></button>',
			'<button title="Allow/Disallow Image" data-key="beacon.mode.image" data-val="false" disabled></button>',
			'<button title="Allow/Disallow Audio" data-key="beacon.mode.audio" data-val="false" disabled></button>',
			'<button title="Allow/Disallow Video" data-key="beacon.mode.video" data-val="false" disabled></button>',
			'<button title="Allow/Disallow Other" data-key="beacon.mode.other" data-val="false" disabled></button>',
			'</td>',
			'<td><button title="Remove Beacon" data-action="beacon.remove"></button></td>'
		]);

		let model = {
			label:  element.query('[data-key="beacon.label"]'),
			select: element.query('[data-key="beacon.select"]'),
			mode: {
				text:  element.query('[data-key="beacon.mode.text"]'),
				image: element.query('[data-key="beacon.mode.image"]'),
				audio: element.query('[data-key="beacon.mode.audio"]'),
				video: element.query('[data-key="beacon.mode.video"]'),
				other: element.query('[data-key="beacon.mode.other"]')
			}
		};

		model.label.value(beacon.label);
		model.select.value(beacon.select);
		Object.keys(model.mode).forEach((key) => {
			model.mode[key].value(beacon.mode[key]);
		});


		let button = element.query('button[data-action="beacon.remove"]');
		if (button !== null) {

			button.on('click', () => {

				let cache = this.model.beacons.find((b) => b.label.value() === beacon.label) || null;
				if (cache !== null) {
					this.model.beacons.remove(cache);
				}

				element.erase();

			});

		}


		return {
			element: element,
			model:   model
		};

	}


	return null;

};



const Beacon = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-beacon', [
		'<h3>',
		'<input title="Domain" type="text" data-key="domain" placeholder="domain.tld" size="10" disabled/>',
		'<input title="Path" type="text" data-key="path" pattern="/([A-Za-z0-9\\/._\\-*]+)" placeholder="/path" size="5" disabled/>',
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
		'\t\t<td><textarea title="List of Selectors" data-key="beacon.select" rows="1" disabled></textarea></td>',
		'\t\t<td>',
		'\t\t\t<button title="Allow/Disallow Text" data-key="beacon.mode.text" data-val="false" disabled></button>',
		'\t\t\t<button title="Allow/Disallow Image" data-key="beacon.mode.image" data-val="false" disabled></button>',
		'\t\t\t<button title="Allow/Disallow Audio" data-key="beacon.mode.audio" data-val="false" disabled></button>',
		'\t\t\t<button title="Allow/Disallow Video" data-key="beacon.mode.video" data-val="false" disabled></button>',
		'\t\t\t<button title="Allow/Disallow Other" data-key="beacon.mode.other" data-val="false" disabled></button>',
		'\t\t</td>',
		'\t\t<td><button title="Create Beacon" data-action="beacon.create" disabled></button></td>',
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
		create: this.element.query('button[data-action="create"]'),
		remove: this.element.query('button[data-action="remove"]'),
		save:   this.element.query('button[data-action="save"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.beacon = {
		buttons: {
			create: this.element.query('button[data-action="beacon.create"]')
		},
		element: this.element.query('table tfoot'),
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
		domain:  this.element.query('[data-key="domain"]'),
		path:    this.element.query('[data-key="path"]'),
		beacons: []
	};

	Widget.call(this);


	this.model.domain.on('keyup', () => {
		this.model.domain.validate();
	});

	this.model.path.on('keyup', () => {
		this.model.path.validate();
	});

	this.beacon.model.label.on('keyup', () => {
		this.beacon.model.label.validate();
	});

	this.beacon.model.select.on('keyup', () => {
		this.beacon.model.select.validate();
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

		this.buttons.create.erase();
		this.buttons.remove.erase();
		this.buttons.save.erase();


		if (this.actions.includes('create')) {

			this.model.domain.attr('required', true);
			this.model.domain.state('enabled');

			this.model.path.attr('required', true);
			this.model.path.state('enabled');

			this.beacon.buttons.create.state('enabled');
			this.beacon.element.state('enabled');
			this.beacon.element.query('button, input, textarea').forEach((element) => {
				element.state('enabled');
			});

		} else if (this.actions.includes('save')) {

			this.model.domain.attr('required', true);
			this.model.domain.state('disabled');

			this.model.path.attr('required', true);
			this.model.path.state('disabled');

			this.beacon.buttons.create.state('enabled');
			this.beacon.element.state('enabled');
			this.beacon.element.query('button, input, textarea').forEach((element) => {
				element.state('enabled');
			});

		} else {

			this.model.domain.state('disabled');
			this.model.path.state('disabled');

			this.beacon.buttons.create.state('disabled');
			this.beacon.element.state('disabled');
			this.beacon.element.query('button, input, textarea').forEach((element) => {
				element.state('disabled');
			});

		}


		let footer = this.element.query('browser-card-beacon-footer');

		if (this.actions.includes('remove')) {
			this.buttons.remove.render(footer);
		}

		if (this.actions.includes('create')) {
			this.buttons.create.render(footer);
		} else if (this.actions.includes('save')) {
			this.buttons.save.render(footer);
		}

	});

	if (this.beacon.buttons.create !== null) {

		this.beacon.buttons.create.on('click', () => {

			let beacon = this.value.call(this.beacon);
			let value  = this.value();

			if (beacon !== null && value !== null) {

				if (value.beacons === null) {
					value.beacons = [];
				}

				let cache = value.beacons.find((b) => b.label === beacon.label) || null;
				if (cache !== null) {

					cache.select     = beacon.select;
					cache.mode.text  = beacon.mode.text;
					cache.mode.image = beacon.mode.image;
					cache.mode.audio = beacon.mode.audio;
					cache.mode.video = beacon.mode.video;
					cache.mode.other = beacon.mode.other;

				} else {

					value.beacons.push(beacon);

				}

				this.value(value);

				this.beacon.model.label.value('');
				this.beacon.model.select.value('');
				this.beacon.model.select.attr('rows', 1);
				Object.values(this.beacon.model.mode).forEach((button) => {
					button.value(false);
				});

			}

		});

	}

	Object.values(this.beacon.model.mode).forEach((button) => {

		button.on('click', () => {

			if (button.value() === true) {
				button.value(false);
			} else {
				button.value(true);
			}

		});

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

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (isArray(value.beacons) === true) {

				value.beacons = value.beacons.filter((b) => isBeacon(b));


				let table = this.element.query('table tbody');
				if (table !== null) {

					table.query('tr', true).forEach((row) => row.erase());
					this.model.beacons = [];

					value.beacons.map((b) => toElementModel.call(this, b)).forEach((beacon) => {

						if (beacon !== null) {
							beacon.element.render(table);
							this.model.beacons.push(beacon.model);
						}

					});

				}

			}

			return Widget.prototype.value.call(this, value);

		} else {

			return Widget.prototype.value.call(this);

		}

	}

});


export { Beacon };

