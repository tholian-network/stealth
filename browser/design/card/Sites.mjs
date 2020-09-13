
import { Element                     } from '../Element.mjs';
import { Widget                      } from '../Widget.mjs';
import { isArray, isObject, isString } from '../../extern/base.mjs';



const update = function(browser) {

	// TODO: The value() method should do this when {results} is set!
	// TODO: Refresh this.results based on browser.settings{} and domain value


	let element = this.element.query('[data-key="results"]');
	if (element !== null) {

		element.value(this.allowed.sort().map((type) => {

			let visible = this.results[type].length;
			let overall = browser.settings[type].length;

			return visible + ' of ' + overall + ' ' + (type.charAt(0).toUpperCase() + type.substr(1)) + (visible > 1 ? 's' : '');

		}).join(', '));

	}

	let total = Object.values(this.results).reduce((a, b) => a + b, 0);
	if (total > 1) {
		this.buttons.remove.state('enabled');
	} else {
		this.buttons.remove.state('disabled');
	}

};



const Sites = function(browser, allowed, actions) {

	this.actions = isArray(actions) ? actions : [ 'refresh', 'remove' ];
	this.allowed = isArray(allowed) ? allowed : [ 'beacons', 'hosts', 'modes', 'peers', 'redirects', 'sessions' ];
	this.element = new Element('browser-card-sites', [
		'<h3>Sites</h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-sites-header>',
		'<h4>Sites Search</h4>',
		'<p>As Stealth caches almost everything, sometimes things can get a little unexpected. Search here for Sites via their Domain in the local Stealth Profile:</p>',
		'<input title="Domain" type="text" data-key="domain" pattern="([A-Za-z0-9._\\-*]+).([A-Za-z*]+)" placeholder="domain.tld" disabled/>',
		'<p data-key="results">0 of 0 Beacons, 0 of 0 Hosts, 0 of 0 Modes, 0 of 0 Peers, 0 of 0 Redirects, 0 of 0 Sessions</p>',
		'</browser-card-sites-header>',
		'<browser-card-sites-article>',

		'</browser-card-sites-article>',
		'<browser-card-sites-footer>',
		'<button title="Refresh all results" data-action="refresh"></button>',
		'<button title="Remove all results" data-action="remove"></button>',
		'</browser-card-sites-footer>'
	]);

	this.buttons = {
		refresh: this.element.query('button[data-action="refresh"]'),
		remove:  this.element.query('button[data-action="remove"]'),
		toggle:  this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		domain: this.element.query('[data-key="domain"]')
	};

	this.results = {
		beacons:   [],
		hosts:     [],
		modes:     [],
		peers:     [],
		redirects: [],
		sessions:  []
	};

	Widget.call(this);

	window._SITES = this;


	this.model.domain.on('keyup', () => {
		this.model.domain.validate();
	});

	this.model.domain.on('change', () => {

		this.model.domain.validate();

		if (this.model.domain.state() === 'enabled') {
			update.call(this, browser);
		}

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

		this.buttons.refresh.erase();
		this.buttons.remove.erase();


		this.model.domain.state('enabled');


		let footer = this.element.query('browser-card-sites-footer');

		if (this.actions.includes('refresh')) {
			this.buttons.refresh.render(footer);
		}

		if (this.actions.includes('remove')) {
			this.buttons.remove.render(footer);
		}

		update.call(this, browser);

	});

	if (this.buttons.refresh !== null) {

		this.buttons.refresh.on('click', () => {

			console.log('SEARCH NAO!');

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

	setTimeout(() => {
		this.element.emit('update');
	}, 0);

};


Sites.from = function(value, results, actions) {

	value   = isObject(value)  ? value   : null;
	results = isArray(results) ? results : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Sites(window.parent.BROWSER || null, results, actions);
		widget.value(value);

	}

	return widget;

};


Sites.prototype = Object.assign({}, Widget.prototype);


export { Sites };

