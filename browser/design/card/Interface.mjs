
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';



const Interface = function(browser, actions) {

	let uid = Date.now();

	this.actions = isArray(actions) ? actions : [ 'save' ];
	this.element = new Element('browser-card-interface', [
		'<h3>Interface</h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-interface-article>',
		'<h4>Theme</h4>',
		'<p>Stealth can adapt the User Interface in a couple of different ways.</p>',
		'<p>If the chosen Theme is enforced, it will lead to overriding all Site Designs.</p>',
		'<ul>',
		'<li>',
		'<input id="browser-card-interface-theme-' + uid + '-1" name="theme" type="radio" value="dark">',
		'<label for="browser-card-interface-theme-' + uid + '-1">Use dark theme.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-theme-' + uid + '-2" name="theme" type="radio" value="light">',
		'<label for="browser-card-interface-theme-' + uid + '-2">Use light theme.</label>',
		'</li>',
		'</ul>',
		'<ul>',
		'<li>',
		'<input id="browser-card-interface-enforce-' + uid + '-1" name="enforce" type="radio" value="false">',
		'<label for="browser-card-interface-enforce-' + uid + '-1">Use Site Design provided by each URL.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-enforce-' + uid + '-2" name="enforce" type="radio" value="true">',
		'<label for="browser-card-interface-enforce-' + uid + '-2">Override Site Design with chosen Theme.</label>',
		'</li>',
		'</ul>',
		'<h4>Open Tab</h4>',
		'<p>Stealth can adapt the <q>Open Tab</q> behaviour, and the Internal Page that is displayed then.</p>',
		'<ul>',
		'<li>',
		'<input id="browser-card-interface-opentab-' + uid + '-1" name="opentab" type="radio" value="stealth:blank">',
		'<label for="browser-card-interface-opentab-' + uid + '-1">Use <a href="stealth:blank">stealth:blank</a>.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-opentab-' + uid + '-2" name="opentab" type="radio" value="stealth:welcome">',
		'<label for="browser-card-interface-opentab-' + uid + '-2">Use <a href="stealth:welcome">stealth:welcome</a>.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-opentab-' + uid + '-3" name="opentab" type="radio" value="stealth:history">',
		'<label for="browser-card-interface-opentab-' + uid + '-3">Use <a href="stealth:history">stealth:history</a>.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-opentab-' + uid + '-4" name="opentab" type="radio" value="stealth:media">',
		'<label for="browser-card-interface-opentab-' + uid + '-4">Use <a href="stealth:media">stealth:media</a>.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-opentab-' + uid + '-5" name="opentab" type="radio" value="stealth:schedule">',
		'<label for="browser-card-interface-opentab-' + uid + '-5">Use <a href="stealth:schedule">stealth:schedule</a>.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-opentab-' + uid + '-6" name="opentab" type="radio" value="stealth:search">',
		'<label for="browser-card-interface-opentab-' + uid + '-6">Use <a href="stealth:search">stealth:search</a>.</label>',
		'</li>',
		'</ul>',
		'<h4>Assistive Technologies</h4>',
		'<p>Stealth has experimental support for an Assistant that uses Sounds to represent User Interface states and interactions.</p>',
		'<ul>',
		'<li>',
		'<input id="browser-card-interface-assistant-' + uid + '-1" name="assistant" type="radio" value="true">',
		'<label for="browser-card-interface-assistant-' + uid + '-1">Enable sound signals.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-interface-assistant-' + uid + '-2" name="assistant" type="radio" value="false">',
		'<label for="browser-card-interface-assistant-' + uid + '-2">Disable sound signals.</label>',
		'</li>',
		'</ul>',
		'</browser-card-interface-article>',
		'<browser-card-interface-footer>',
		'<button title="Save" data-action="save"></button>',
		'</browser-card-interface-footer>'
	]);

	this.buttons = {
		save:   this.element.query('button[data-action="save"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		theme:     this.element.query('input[name="theme"]'),
		enforce:   this.element.query('input[name="enforce"]'),
		opentab:   this.element.query('input[name="opentab"]'),
		assistant: this.element.query('input[name="assistant"]')
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

	this.element.on('update', () => {

		this.buttons.save.erase();


		if (this.actions.includes('save') === true) {

			Object.values(this.model.theme).forEach((input) => {
				input.state('enabled');
			});

			Object.values(this.model.enforce).forEach((input) => {
				input.state('enabled');
			});

			Object.values(this.model.opentab).forEach((input) => {
				input.state('enabled');
			});

			Object.values(this.model.assistant).forEach((input) => {
				input.state('enabled');
			});

		} else {

			Object.values(this.model.theme).forEach((input) => {
				input.state('disabled');
			});

			Object.values(this.model.enforce).forEach((input) => {
				input.state('disabled');
			});

			Object.values(this.model.opentab).forEach((input) => {
				input.state('disabled');
			});

			Object.values(this.model.assistant).forEach((input) => {
				input.state('disabled');
			});

		}


		let footer = this.element.query('browser-card-interface-footer');

		if (this.actions.includes('save') === true) {
			this.buttons.save.render(footer);
		}

	});


	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			let value = this.value();

			browser.client.services['settings'].save({
				'interface': value
			}, (result) => {

				if (result === true) {
					browser.settings['interface'] = value;
					browser.emit('theme', [ value['theme'] ]);
				}

			});

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


Interface.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Interface(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Interface.prototype = Object.assign({}, Widget.prototype);


export { Interface };

