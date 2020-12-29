
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';



const Internet = function(browser, actions) {

	let uid = Date.now();


	this.actions = isArray(actions) ? actions : [ 'save' ];
	this.element = new Element('browser-card-internet', [
		'<h3>Internet</h3>',
		'<button title="Toggle visibility of this card" data-action="toggle"></button>',
		'<browser-card-internet-article>',
		'<h4>Internet Connection</h4>',
		'<p>Stealth can connect to a Site through direct internet access and peer-to-peer via other machines that have internet access.</p>',
		'<p>If this machine has no internet connection, select the peer-to-peer option. Remember to add the machine with internet access as a trusted Peer.</p>',
		'<ul>',
		'<li>',
		'<input id="browser-card-internet-connection-' + uid + '-1" name="connection" type="radio" value="mobile">',
		'<label for="browser-card-internet-connection-' + uid + '-1">This machine has mobile internet access.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-connection-' + uid + '-2" name="connection" type="radio" value="broadband">',
		'<label for="browser-card-internet-connection-' + uid + '-2">This machine has broadband internet access.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-connection-' + uid + '-3" name="connection" type="radio" value="peer">',
		'<label for="browser-card-internet-connection-' + uid + '-3">This machine has peer-to-peer internet access.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-connection-' + uid + '-4" name="connection" type="radio" value="tor">',
		'<label for="browser-card-internet-connection-' + uid + '-4">This machine has proxied internet access via <abbr title="The Onion Router">TOR</abbr>.</label>',
		'</li>',
		'</ul>',
		'<h4>Internet History</h4>',
		'<p>Stealth can remember the Internet History. It is remembered locally and kept until below condition is matched.</p>',
		'<p>The Internet History can be managed in detail via <a href="stealth:history">stealth:history</a></p>',
		'<ul>',
		'<li>',
		'<input id="browser-card-internet-history-' + uid + '-1" name="history" type="radio" value="stealth">',
		'<label for="browser-card-internet-history-' + uid + '-1">Fly undetected and leave no trace.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-history-' + uid + '-2" name="history" type="radio" value="day">',
		'<label for="browser-card-internet-history-' + uid + '-2">Remember history for the last day (24 hours).</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-history-' + uid + '-3" name="history" type="radio" value="week">',
		'<label for="browser-card-internet-history-' + uid + '-3">Remember history for the last week (7 days).</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-history-' + uid + '-4" name="history" type="radio" value="month">',
		'<label for="browser-card-internet-history-' + uid + '-4">Remember history for the last month (31 days).</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-history-' + uid + '-5" name="history" type="radio" value="forever">',
		'<label for="browser-card-internet-history-' + uid + '-5">Remember history forever.</label>',
		'</li>',
		'</ul>',
		'<h4>Internet User-Agent</h4>',
		'<p>Stealth can emulate the User-Agent identifier of other Web Browsers to keep Sites working while still staying undetected. The User-Agent is regenerated when a Tab is opened and is kept only for this specific Tab until it is closed.</p>',
		'<ul>',
		'<li>',
		'<input id="browser-card-internet-useragent-' + uid + '-1" name="useragent" type="radio" value="stealth">',
		'<label for="browser-card-internet-useragent-' + uid + '-1">Fly undetected and leave no trace.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-useragent-' + uid + '-2" name="useragent" type="radio" value="browser-mobile">',
		'<label for="browser-card-internet-useragent-' + uid + '-2">Identify as random Mobile Browser.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-useragent-' + uid + '-3" name="useragent" type="radio" value="browser-desktop">',
		'<label for="browser-card-internet-useragent-' + uid + '-3">Identify as random Desktop Browser.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-useragent-' + uid + '-4" name="useragent" type="radio" value="spider-mobile">',
		'<label for="browser-card-internet-useragent-' + uid + '-4">Identify as random Mobile <abbr title="Spiders are the web scrapers behind search engines">Spider</abbr>.</label>',
		'</li>',
		'<li>',
		'<input id="browser-card-internet-useragent-' + uid + '-5" name="useragent" type="radio" value="spider-desktop">',
		'<label for="browser-card-internet-useragent-' + uid + '-5">Identify as random Desktop <abbr title="Spiders are the web scrapers behind search engines">Spider</abbr>.</label>',
		'</li>',
		'</ul>',
		'</browser-card-internet-article>',
		'<browser-card-internet-footer>',
		'<button title="Save" data-action="save"></button>',
		'</browser-card-internet-footer>'
	]);

	this.buttons = {
		save:   this.element.query('button[data-action="save"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		connection: this.element.query('input[name="connection"]'),
		history:    this.element.query('input[name="history"]'),
		useragent:  this.element.query('input[name="useragent"]')
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

			Object.values(this.model.connection).forEach((input) => {
				input.state('enabled');
			});

			Object.values(this.model.history).forEach((input) => {
				input.state('enabled');
			});

			Object.values(this.model.useragent).forEach((input) => {
				input.state('enabled');
			});

		} else {

			Object.values(this.model.connection).forEach((input) => {
				input.state('disabled');
			});

			Object.values(this.model.history).forEach((input) => {
				input.state('disabled');
			});

			Object.values(this.model.useragent).forEach((input) => {
				input.state('disabled');
			});

		}


		let footer = this.element.query('browser-card-internet-footer');

		if (this.actions.includes('save') === true) {
			this.buttons.save.render(footer);
		}

	});


	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			let value = this.value();

			browser.client.services['settings'].save({
				'internet': value
			}, (result) => {

				if (result === true) {
					browser.settings['internet'] = value;
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


Internet.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Internet(window.parent.BROWSER || null, actions);
		widget.value(value);

	}

	return widget;

};


Internet.prototype = Object.assign({}, Widget.prototype);


export { Internet };

