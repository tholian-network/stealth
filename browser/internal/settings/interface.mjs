
import { isObject, isString } from '../../extern/base.mjs';
import { Element            } from '../../internal/index.mjs';



const ELEMENTS = {
	theme: Element.query('#interface-theme input')
};

export const listen = function(browser, callback) {

	Object.keys(ELEMENTS).forEach((type) => {

		ELEMENTS[type].forEach((element, e, others) => {

			element.on('change', () => {

				let active = others.find((o) => o.attr('checked') === true) || null;
				if (active !== null) {

					let cur_val = browser.settings['interface'][type];
					let new_val = active.value();

					if (cur_val !== new_val) {

						element.state('disabled');
						element.state('busy');

						callback('save', {
							'interface': Object.assign({}, browser.settings['interface'], { [type]: new_val })
						}, (result) => {
							element.state('enabled');
							element.state(result === true ? '' : 'error');
						});

					}

				}

			});

		});

	});

};

const update_choices = function(choices, value, elements) {

	choices.forEach((choice, c) => {
		elements[c].attr('checked', choice === value ? 'true' : '');
	});

};

export const update = function(settings) {

	settings = isObject(settings) ? settings : {};


	if (isObject(settings['interface']) === true) {

		if (isString(settings['interface'].theme) === true) {

			update_choices(
				[ 'dark', 'light' ],
				settings['interface'].theme,
				ELEMENTS.theme
			);

		}

	}


};



export const init = function(browser) {

	listen(browser, (action, data, done) => {

		let service = browser.client.services.settings || null;
		if (service !== null) {

			if (action === 'save') {

				service.save(data, (result) => {

					if (result === true) {

						Object.keys(data['interface']).forEach((key) => {
							browser.settings['interface'][key] = data['interface'][key];
						});

						update({
							'interface': browser.settings['interface']
						});

						browser.emit('theme', [ browser.settings['interface'].theme ]);

					}

					done(result);

				});

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});

	update(browser.settings);

};

