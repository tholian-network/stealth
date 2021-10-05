
import { console, isObject, isString } from '../extern/base.mjs';



let TIMEOUT = Date.now();

const Assistant = function(settings) {

	settings = isObject(settings) ? settings : {};


	this.settings = Object.freeze(Object.assign({
		name:   null,
		widget: null,
		events: {}
	}, settings));


	this.__state = {
		sounds: {},
		texts:  {}
	};


	if (
		isString(this.settings.widget) === true
		&& isObject(this.settings.events) === true
	) {

		for (let name in this.settings.events) {

			let text  = this.settings.events[name];
			let audio = new Audio('/browser/design/' + this.settings.widget + '.' + name + '.wav');

			this.__state.sounds[name] = audio;
			this.__state.texts[name]  = text;

		}

	}

};

Assistant.prototype = {

	emit: function(event) {

		event = isString(event) ? event : null;


		if (event !== null) {

			let sound = this.__state.sounds[event] || null;
			let text  = this.__state.texts[event]  || null;

			let allowed = false;
			let browser = window.parent.BROWSER || null;
			if (browser !== null) {

				if (browser.settings['interface']['assistant'] === true) {
					allowed = true;
				}

			}

			if (allowed === true) {

				if (sound !== null) {

					if (Date.now() > TIMEOUT + 100) {

						try {
							sound.play().catch(() => {});
						} catch (err) {
							// Do Nothing
						}

						TIMEOUT = Date.now();

					}

				}

				if (text !== null) {
					console.log('Assistant: ' + text);
				}

			}


			return true;

		}

		return false;

	}

};


export { Assistant };

