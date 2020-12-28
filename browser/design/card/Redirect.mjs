
import { Element                     } from '../Element.mjs';
import { Widget                      } from '../Widget.mjs';
import { isArray, isObject, isString } from '../../extern/base.mjs';
import { URL                         } from '../../source/parser/URL.mjs';



const isRedirect = function(redirect) {

	if (
		isObject(redirect) === true
		&& isString(redirect.path) === true
		&& (isString(redirect.query) === true || redirect.query === null)
		&& isString(redirect.location) === true
	) {

		let url = URL.parse(redirect.location);
		if (url.protocol === 'https' || url.protocol === 'http') {
			return true;
		}

	}


	return false;

};

const toMap = function(redirect) {

	redirect = isRedirect(redirect) ? redirect : null;


	if (redirect !== null) {

		if (redirect.query === '') {
			redirect.query = null;
		}

		let element = new Element('tr', [
			'<td><input type="text" data-key="redirect.path" disabled/></td>',
			'<td>' + (redirect.query === null ? '<code data-key="redirect.query"></code>' : '<input type="text" data-key="redirect.query" disabled/>') + '</td>',
			'<td><input type="text" data-key="redirect.location" disabled/></td>',
			'<td><button title="Remove Redirect" data-action="redirect.remove"></button></td>'
		]);

		let model = {
			path:     element.query('[data-key="redirect.path"]'),
			query:    element.query('[data-key="redirect.query"]'),
			location: element.query('[data-key="redirect.location"]')
		};

		model.path.value(redirect.path);
		model.query.value(redirect.query);
		model.location.value(redirect.location);


		let button = element.query('button[data-action="redirect.remove"]');
		if (button !== null) {

			button.on('click', () => {

				let cache = this.model.redirects.find((r) => r.path.value() === redirect.path && r.query.value() === redirect.query) || null;
				if (cache !== null) {
					this.model.redirects.remove(cache);
				}

				element.erase();

			});

		}


		return {
			redirect: redirect,
			element:  element,
			model:    model
		};

	}


	return null;

};



const Redirect = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-redirect', [
		'<h3><input title="Domain" type="text" data-key="domain" disabled/></h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-redirect-article>',
		'<table>',
		'<thead>',
		'\t<tr>',
		'\t\t<th>Path</th>',
		'\t\t<th>Query</th>',
		'\t\t<th>Location</th>',
		'\t\t<th></th>',
		'\t</tr>',
		'</thead>',
		'<tbody></tbody>',
		'<tfoot class="disabled">',
		'\t<tr>',
		'\t\t<td><input title="Path" type="text" data-key="redirect.path" pattern="/([A-Za-z0-9/:._-]+)?" placeholder="/path" disabled/></td>',
		'\t\t<td><input title="Query" type="text" data-key="redirect.query" pattern="([A-Za-z0-9/&=:._-]+)?" placeholder="key=val&..." disabled/></td>',
		'\t\t<td><input title="Target Location" type="text" data-key="redirect.location" placeholder="https://example.com/location.html" disabled/></td>',
		'\t\t<td><button title="Create Redirect" data-action="redirect.create" disabled></button></td>',
		'\t</tr>',
		'</tfoot>',
		'</table>',
		'</browser-card-redirect-article>',
		'<browser-card-redirect-footer>',
		'<button title="Create Redirect" data-action="create"></button>',
		'<button title="Remove Redirect" data-action="remove"></button>',
		'<button title="Save Redirect" data-action="save"></button>',
		'</browser-card-redirect-footer>'
	]);

	this.buttons = {
		create:  this.element.query('button[data-action="create"]'),
		remove:  this.element.query('button[data-action="remove"]'),
		save:    this.element.query('button[data-action="save"]'),
		toggle:  this.element.query('button[data-action="toggle"]')
	};

	this.redirect = {
		buttons: {
			create: this.element.query('button[data-action="redirect.create"]')
		},
		element: this.element.query('table tfoot'),
		model: {
			path:     this.element.query('[data-key="redirect.path"]'),
			query:    this.element.query('[data-key="redirect.query"]'),
			location: this.element.query('[data-key="redirect.location"]')
		}
	};

	this.model = {
		domain:    this.element.query('[data-key="domain"]'),
		redirects: []
	};

	Widget.call(this);


	this.model.domain.on('keyup', () => {
		this.model.domain.validate();
	});

	this.redirect.model.path.on('keyup', () => {
		this.redirect.model.path.validate();
	});

	this.redirect.model.query.on('keyup', () => {
		this.redirect.model.query.validate();
	});

	this.redirect.model.location.on('keyup', () => {
		this.redirect.model.location.validate();
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

			this.redirect.buttons.create.state('enabled');
			this.redirect.element.state('enabled');
			this.redirect.element.query('button, input', true).forEach((element) => {
				element.state('enabled');
			});

		} else if (this.actions.includes('save') === true) {

			this.model.domain.attr('required', true);
			this.model.domain.state('disabled');

			this.redirect.buttons.create.state('enabled');
			this.redirect.element.state('enabled');
			this.redirect.element.query('button, input', true).forEach((element) => {
				element.state('enabled');
			});

		} else {

			this.model.domain.attr('required', null);
			this.model.domain.state('disabled');

			this.redirect.buttons.create.state('disabled');
			this.redirect.element.state('disabled');
			this.redirect.element.query('button, input', true).forEach((element) => {
				element.state('disabled');
			});

		}


		let footer = this.element.query('browser-card-redirect-footer');

		if (this.actions.includes('remove') === true) {
			this.buttons.remove.render(footer);
		}

		if (this.actions.includes('create') === true) {
			this.buttons.create.render(footer);
		} else if (this.actions.includes('save') === true) {
			this.buttons.save.render(footer);
		}

	});


	if (this.redirect.buttons.create !== null) {

		this.redirect.buttons.create.on('click', () => {

			let redirect = this.value.call(this.redirect);
			let value    = this.value();

			if (redirect !== null && value !== null) {

				let cache = value.redirects.find((r) => r.path === redirect.path && r.query === redirect.query) || null;
				if (cache !== null) {

					cache.path     = redirect.path;
					cache.query    = redirect.query;
					cache.location = redirect.query;

				} else {

					value.redirects.push(redirect);

				}

				this.value(value);

				this.redirect.model.path.value('');
				this.redirect.model.query.value('');
				this.redirect.model.location.value('');

			}

		});

	}


	if (this.buttons.create !== null) {

		this.buttons.create.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['redirect'].save(value, (result) => {

					if (result === true) {

						browser.settings['redirects'].removeEvery((r) => r.domain === value.domain);
						browser.settings['redirects'].push(value);


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

			browser.client.services['redirect'].remove(value, (result) => {

				if (result === true) {

					browser.settings['redirects'].removeEvery((r) => r.domain === value.domain);
					this.element.erase();

				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['redirect'].save(value, (result) => {

					if (result === true) {

						browser.settings['redirects'].removeEvery((r) => r.domain === value.domain);
						browser.settings['redirects'].push(value);

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


Redirect.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Redirect(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Redirect.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (isArray(value.redirects) === true) {

				value.redirects = value.redirects.filter((r) => isRedirect(r));


				let table = this.element.query('table tbody');
				if (table !== null) {

					table.query('tr', true).forEach((row) => row.erase());
					this.model.redirects = [];

					value.redirects.map((redirect) => {
						return toMap.call(this, redirect);
					}).forEach((map) => {

						if (map !== null) {
							map.element.render(table);
							this.model.redirects.push(map.model);
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


export { Redirect };

