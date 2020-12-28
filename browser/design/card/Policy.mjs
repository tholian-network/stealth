
import { Element                     } from '../Element.mjs';
import { Widget                      } from '../Widget.mjs';
import { isArray, isObject, isString } from '../../extern/base.mjs';



const isPolicy = function(policy) {

	if (
		isObject(policy) === true
		&& isString(policy.path) === true
		&& (isString(policy.query) === true || policy.query === null)
	) {
		return true;
	}

	return false;

};

const toMap = function(policy) {

	policy = isPolicy(policy) ? policy : null;


	if (policy !== null) {

		if (policy.query === '') {
			policy.query = null;
		}


		let element = new Element('tr', [
			'<td><input type="text" data-key="policy.path" disabled/></td>',
			'<td>' + (policy.query === null ? '<code data-key="policy.query"></code>' : '<input type="text" data-key="policy.query" disabled/>') + '</td>',
			'<td><button title="Remove Policy" data-action="policy.remove"></button></td>'
		]);

		let model = {
			path:   element.query('[data-key="policy.path"]'),
			query:  element.query('[data-key="policy.query"]')
		};

		model.path.value(policy.path);
		model.query.value(policy.query);


		let button = element.query('button[data-action="policy.remove"]');
		if (button !== null) {

			button.on('click', () => {

				let cache = this.model.policies.find((p) => {
					return (
						p.path.value() === policy.path
						&& p.query.value() === policy.query
					);
				}) || null;

				if (cache !== null) {
					this.model.policies.remove(cache);
				}

				element.erase();

			});

		}


		return {
			policy:  policy,
			element: element,
			model:   model
		};

	}


	return null;

};



const Policy = function(browser, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('browser-card-policy', [
		'<h3><input title="Domain" type="text" data-key="domain" disabled/></h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-policy-article>',
		'<table>',
		'<thead>',
		'<tr>',
		[ 'Path', 'Query', '' ].map((v) => {
			return '<th>' + v + '</th>';
		}).join(''),
		'</tr>',
		'</thead>',
		'<tbody></tbody>',
		'<tfoot class="disabled">',
		'<tr>',
		[
			'<input title="Path" type="text" data-key="policy.path" pattern="/([A-Za-z0-9*/:._-]+)?" placeholder="/path" disabled/>',
			'<input title="Query" type="text" data-key="policy.query" pattern="([A-Za-z0-9/&=:._-]+)?" placeholder="key=val&..." disabled/>',
			'<button title="Create Policy" data-action="policy.create" disabled></button>'
		].map((v) => {
			return '<td>' + v + '</td>';
		}).join(''),
		'</tr>',
		'</tfoot>',
		'</table>',
		'</browser-card-policy-article>',
		'<browser-card-policy-footer>',
		'<button title="Create Policy" data-action="create"></button>',
		'<button title="Remove Policy" data-action="remove"></button>',
		'<button title="Save Policy" data-action="save"></button>',
		'</browser-card-policy-footer>'
	]);

	this.buttons = {
		create: this.element.query('button[data-action="create"]'),
		remove: this.element.query('button[data-action="remove"]'),
		save:   this.element.query('button[data-action="save"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.policy = {
		buttons: {
			create: this.element.query('button[data-action="policy.create"]')
		},
		element: this.element.query('table tfoot'),
		model: {
			path:  this.element.query('[data-key="policy.path"]'),
			query: this.element.query('[data-key="policy.query"]')
		}
	};

	this.model = {
		domain:   this.element.query('[data-key="domain"]'),
		policies: []
	};

	Widget.call(this);


	this.model.domain.on('keyup', () => {
		this.model.domain.validate();
	});

	this.policy.model.path.on('keyup', () => {
		this.policy.model.path.validate();
	});

	this.policy.model.query.on('keyup', () => {
		this.policy.model.query.validate();
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

			this.policy.buttons.create.state('enabled');
			this.policy.element.state('enabled');
			this.policy.element.query('button, input', true).forEach((element) => {
				element.state('enabled');
			});

		} else if (this.actions.includes('save') === true) {

			this.model.domain.attr('required', true);
			this.model.domain.state('disabled');

			this.policy.buttons.create.state('enabled');
			this.policy.element.state('enabled');
			this.policy.element.query('button, input', true).forEach((element) => {
				element.state('enabled');
			});

		} else {

			this.model.domain.attr('required', null);
			this.model.domain.state('disabled');

			this.policy.buttons.create.state('disabled');
			this.policy.element.state('disabled');
			this.policy.element.query('button, input', true).forEach((element) => {
				element.state('disabled');
			});

		}


		let footer = this.element.query('browser-card-policy-footer');

		if (this.actions.includes('remove') === true) {
			this.buttons.remove.render(footer);
		}

		if (this.actions.includes('create') === true) {
			this.buttons.create.render(footer);
		} else if (this.actions.includes('save') === true) {
			this.buttons.save.render(footer);
		}

	});


	if (this.policy.buttons.create !== null) {

		this.policy.buttons.create.on('click', () => {

			let policy = this.value.call(this.policy);
			let value  = this.value();

			if (policy !== null && value !== null) {

				let cache = value.policies.find((p) => p.path === policy.path) || null;
				if (cache !== null) {

					cache.path  = policy.path;
					cache.query = policy.query;

				} else {

					value.policies.push(policy);

				}

				this.value(value);

				this.policy.model.path.value('');
				this.policy.model.query.value('');

			}

		});

	}


	if (this.buttons.create !== null) {

		this.buttons.create.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['policy'].save(value, (result) => {

					if (result === true) {

						browser.settings['policies'].removeEvery((p) => p.domain === value.domain);
						browser.settings['policies'].push(value);

						if (this.actions.includes('create') === true) {
							this.actions.remove('create');
						}

						if (this.actions.removes('save') === false) {
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

			browser.client.services['policy'].remove(value, (result) => {

				if (result === true) {

					browser.settings['policies'].removeEvery((p) => p.domain === value.domain);
					this.element.erase();

				}

			});

		});

	}

	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			if (this.validate() === true) {

				let value = this.value();

				browser.client.services['policy'].save(value, (result) => {

					if (result === true) {

						browser.settings['policies'].removeEvery((p) => p.domain === value.domain);
						browser.settings['policies'].push(value);

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

Policy.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Policy(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};

Policy.prototype = Object.assign({}, Widget.prototype, {

	value: function(value) {

		value = isObject(value) ? value : null;


		if (value !== null) {

			if (isArray(value.policies) === true) {

				value.policies = value.policies.filter((p) => isPolicy(p));


				let table = this.element.query('table tbody');
				if (table !== null) {

					table.query('tr', true).forEach((row) => row.erase());
					this.model.policies = [];

					value.policies.map((policy) => {
						return toMap.call(this, policy);
					}).forEach((map) => {

						if (map !== null) {
							map.element.render(table);
							this.model.policies.push(map.model);
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


export { Policy };

