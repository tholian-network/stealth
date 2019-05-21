
import { Element } from '../Element.mjs';



const TEMPLATE = `
<button data-key="text" data-val="false" title="Allow/Disallow Text on current Site"></button>
<button data-key="image" data-val="false" title="Allow/Disallow Image on current Site"></button>
<button data-key="audio" data-val="false" title="Allow/Disallow Audio on current Site"></button>
<button data-key="video" data-val="false" title="Allow/Disallow Video on current Site"></button>
<button data-key="other" data-val="false" title="Allow/Disallow Other on current Site"></button>
`;



const get_config = function(tab) {

	if (tab !== null) {

		let protocol = tab.ref.protocol || null;
		if (protocol !== 'file' && protocol !== 'stealth') {

			let config = {
				domain: null,
				mode: {
					text:  false,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			};

			this.buttons.forEach((button) => {

				let key = button.element.getAttribute('data-key') || null;
				if (key !== null) {
					config.mode[key] = button.value() === 'true';
				}

			});

			if (tab.ref.domain !== null) {

				if (tab.ref.subdomain !== null) {
					config.domain = tab.ref.subdomain + '.' + tab.ref.domain;
				} else {
					config.domain = tab.ref.domain;
				}

			}

			return config;

		}

	}


	return null;

};

const update = function(tab) {

	if (tab !== null) {

		let protocol = tab.ref.protocol || null;
		if (protocol === 'stealth') {

			this.buttons.forEach((button) => {
				button.state('disabled');
				button.value('true');
			});

		} else {

			this.buttons.forEach((button) => {
				button.state('enabled');
			});

		}

		Object.keys(tab.config.mode).forEach((key) => {

			let button = this.buttons.find((other) => {
				return other.element.getAttribute('data-key') === key;
			}) || null;

			if (button !== null) {
				button.value(tab.config.mode[key] === true ? 'true' : 'false');
			}

		});

	} else {

		this.buttons.forEach((button) => {
			button.state('disabled');
			button.value('false');
		});

	}

};



const Mode = function(browser) {

	this.element = Element.from('browser-mode', TEMPLATE);
	this.buttons = this.element.query('[data-key]');


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.buttons.forEach((button) => {

		button.on('click', () => {

			let val = button.value();
			if (val === 'true') {
				button.value('false');
			} else if (val === 'false') {
				button.value('true');
			}

			let config = get_config.call(this, browser.tab);
			if (config !== null) {
				browser.set(config);
			}

		});

	});


	browser.on('change',  () => update.call(this, browser.tab));
	// browser.on('refresh') isn't necessary
	browser.on('show',    () => update.call(this, browser.tab));

};


Mode.prototype = {

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Mode };

