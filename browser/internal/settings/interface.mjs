
import { isArray, isObject, isString } from '../../extern/base.mjs';
import { Element                     } from '../../internal/index.mjs';



const ELEMENTS = {
	theme: Element.query('#interface-theme input')
};

export const listen = function(settings, callback) {

	Object.keys(ELEMENTS).forEach((type) => {

		if (ELEMENTS[type] !== null) {

			ELEMENTS[type].forEach((element, e, others) => {

				element.on('change', () => {

					let active = others.find((o) => o.attr('checked') === true) || null;
					if (active !== null) {

						let cur_val = settings['interface'][type];
						let new_val = active.value();

						if (cur_val !== new_val) {

							element.state('disabled');
							element.state('busy');

							callback('save', {
								'interface': Object.assign({}, settings['interface'], { [type]: new_val })
							}, (result) => {
								element.state('enabled');
								element.state(result === true ? '' : 'error');
							});

						}

					}

				});

			});

		}

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



export const init = function(browser, settings, actions) {

	actions  = isArray(actions)   ? actions  : [ 'save' ];
	settings = isObject(settings) ? settings : browser.settings;


	if (isObject(settings['interface']) === false) {
		settings['interface'] = {};
	}


	listen(settings, (action, data, done) => {

		if (action === 'save') {

			browser.client.services.settings.save(data, (result) => {

				if (result === true) {

					Object.keys(data['interface']).forEach((key) => {
						settings['interface'][key] = data['interface'][key];
					});

					update(settings, actions);

					browser.emit('theme', [ settings['interface'].theme ]);

				}

				done(result);

			});

		} else {
			done(false);
		}

	});

	update(settings, actions);

};

