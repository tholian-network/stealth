
import { Element                     } from '../Element.mjs';
import { Widget                      } from '../Widget.mjs';
import { isArray, isObject, isString } from '../../extern/base.mjs';



const TERM = [ 'article', 'creator', 'date', 'description', 'identifier', 'language', 'license', 'publisher', 'source', 'subject', 'title', 'type' ];

const isBeacon = function(beacon) {

	if (
		isObject(beacon) === true
		&& isString(beacon.path) === true
		&& (isString(beacon.query) === true || beacon.query === null)
		&& isString(beacon.select) === true
		&& isString(beacon.term) === true
		&& TERM.includes(beacon.term) === true
	) {
		return true;
	}

	return false;

};

const toMap = function(beacon) {

	beacon = isBeacon(beacon) ? beacon : null;


	if (beacon !== null) {

		if (beacon.query === '') {
			beacon.query = null;
		}


		let element = new Element('tr', [
			'<td><input type="text" data-key="beacon.path" disabled/></td>',
			'<td>' + (beacon.query === null ? '<code data-key="beacon.query"></code>' : '<input type="text" data-key="beacon.query" disabled/>') + '</td>',
			'<td><input type="text" data-key="beacon.select" disabled/></td>',
			'<td><input type="text" data-key="beacon.term" disabled/></td>',
			'<td><button title="Remove Beacon" data-action="beacon.remove"></button></td>'
		]);

		let model = {
			path:   element.query('[data-key="beacon.path"]'),
			query:  element.query('[data-key="beacon.query"]'),
			select: element.query('[data-key="beacon.select"]'),
			term:   element.query('[data-key="beacon.term"]')
		};

		model.path.value(beacon.path);
		model.query.value(beacon.query);
		model.select.value(beacon.select);
		model.term.value(beacon.term);


		let button = element.query('button[data-action="beacon.remove"]');
		if (button !== null) {

			button.on('click', () => {

				let cache = this.model.beacons.find((b) => {
					return (
						b.path.value() === beacon.path
						&& b.query.value() === beacon.query
						&& b.term.value() === beacon.term
					);
				}) || null;

				if (cache !== null) {
					this.model.beacons.remove(cache);
				}

				element.erase();

			});

		}


		return {
			beacon:  beacon,
			element: element,
			model:   model
		};

	}


	return null;

};



const Beacon = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-beacon', [
		'<h3><input title="Domain" type="text" data-key="domain" disabled/></h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-beacon-article>',
		'<table>',
		'<thead>',
		'<tr>',
		[ 'Path', 'Query', 'Select', 'Term', '' ].map((v) => {
			return '<th>' + v + '</th>';
		}).join(''),
		'</tr>',
		'</thead>',
		'<tbody></tbody>',
		'<tfoot class="disabled">',
		'<tr>',
		[
			'<input title="Path" type="text" data-key="beacon.path" pattern="/([A-Za-z0-9*/:._-]+)?" placeholder="/path" disabled/>',
			'<input title="Query" type="text" data-key="beacon.query" pattern="([A-Za-z0-9/&=:._-]+)?" placeholder="key=val&..." disabled/>',
			'<input title="Selector" type="text" data-key="beacon.select" pattern="([a-z0-9#, =[\\]\\x22\\x3e:._-]+)" disabled/>',
			'<select data-key="beacon.term">' + TERM.map((term) => {
				return '<option value="' + term + '">' + term.charAt(0).toUpperCase() + term.substr(1) + '</option>';
			}).join('') + '</select>',
			'<button title="Create Beacon" data-action="beacon.create" disabled></button>'
		].map((v) => {
			return '<td>' + v + '</td>';
		}).join(''),
		'</tr>',
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
			path:   this.element.query('[data-key="beacon.path"]'),
			query:  this.element.query('[data-key="beacon.query"]'),
			select: this.element.query('[data-key="beacon.select"]'),
			term:   this.element.query('[data-key="beacon.term"]')
		}
	};

	this.model = {
		domain:  this.element.query('[data-key="domain"]'),
		beacons: []
	};

	Widget.call(this);


	this.model.domain.on('keyup', () => {
		this.model.domain.validate();
	});

	this.beacon.model.path.on('keyup', () => {
		this.beacon.model.path.validate();
	});

	this.beacon.model.query.on('keyup', () => {
		this.beacon.model.query.validate();
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


		if (this.actions.includes('create') === true) {

			this.model.domain.attr('required', true);
			this.model.domain.state('enabled');

			this.beacon.buttons.create.state('enabled');
			this.beacon.element.state('enabled');
			this.beacon.element.query('button, input', true).forEach((element) => {
				element.state('enabled');
			});

		} else if (this.actions.includes('save') === true) {

			this.model.domain.attr('required', true);
			this.model.domain.state('disabled');

			this.beacon.buttons.create.state('enabled');
			this.beacon.element.state('enabled');
			this.beacon.element.query('button, input', true).forEach((element) => {
				element.state('enabled');
			});

		} else {

			this.model.domain.attr('required', null);
			this.model.domain.state('disabled');

			this.beacon.buttons.create.state('disabled');
			this.beacon.element.state('disabled');
			this.beacon.element.query('button, input', true).forEach((element) => {
				element.state('disabled');
			});

		}


		let footer = this.element.query('browser-card-beacon-footer');

		if (this.actions.includes('remove') === true) {
			this.buttons.remove.render(footer);
		}

		if (this.actions.includes('create') === true) {
			this.buttons.create.render(footer);
		} else if (this.actions.includes('save') === true) {
			this.buttons.save.render(footer);
		}

	});


	if (this.beacon.buttons.create !== null) {

		this.beacon.buttons.create.on('click', () => {

			let beacon = this.value.call(this.beacon);
			let value  = this.value();

			if (beacon !== null && value !== null) {

				let cache = value.beacons.find((b) => b.path === beacon.path && b.query === beacon.query && b.term === beacon.term) || null;
				if (cache !== null) {

					cache.path   = beacon.path;
					cache.query  = beacon.query;
					cache.select = beacon.select;
					cache.term   = beacon.term;

				} else {

					value.beacons.push(beacon);

				}

				this.value(value);

				this.beacon.model.path.value('');
				this.beacon.model.query.value('');
				this.beacon.model.select.value('');
				this.beacon.model.term.value(null);

			}

		});

	}


	if (this.buttons.create !== null) {

		this.buttons.create.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['beacon'].save(value, (result) => {

					if (result === true) {

						browser.settings['beacons'].removeEvery((b) => b.domain === value.domain);
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

					browser.settings['beacons'].removeEvery((b) => b.domain === value.domain);
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

						browser.settings['beacons'].removeEvery((b) => b.domain === value.domain);
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

					value.beacons.map((beacon) => {
						return toMap.call(this, beacon);
					}).forEach((map) => {

						if (map !== null) {
							map.element.render(table);
							this.model.beacons.push(map.model);
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

