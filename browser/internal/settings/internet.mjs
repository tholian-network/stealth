
import { isArray, isObject, isString } from '../../extern/base.mjs';
import { Element                     } from '../../internal/index.mjs';



const ELEMENTS = {
	connection: Element.query('#internet-connection input'),
	history:    Element.query('#internet-history input'),
	useragent:  Element.query('#internet-useragent input')
};

export const listen = function(settings, callback) {

	Object.keys(ELEMENTS).forEach((type) => {

		ELEMENTS[type].forEach((element, e, others) => {

			element.on('change', () => {

				let active = others.find((o) => o.attr('checked') === true) || null;
				if (active !== null) {

					let cur_val = settings['internet'][type];
					let new_val = active.value();

					if (cur_val !== new_val) {

						element.state('disabled');
						element.state('busy');

						callback('save', {
							'internet': Object.assign({}, settings['internet'], { [type]: new_val })
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


	if (isObject(settings['internet']) === true) {

		if (isString(settings['internet'].connection) === true) {

			update_choices(
				[ 'mobile', 'broadband', 'peer', 'i2p', 'tor' ],
				settings['internet'].connection,
				ELEMENTS.connection
			);

		}

		if (isString(settings['internet'].history) === true) {

			update_choices(
				[ 'stealth', 'day', 'week', 'forever' ],
				settings['internet'].history,
				ELEMENTS.history
			);

		}

		if (isString(settings['internet'].useragent) === true) {

			update_choices(
				[ 'stealth', 'browser-mobile', 'browser-desktop', 'spider-mobile', 'spider-desktop' ],
				settings['internet'].useragent,
				ELEMENTS.useragent
			);

		}

	}

};



export const init = function(browser, settings, actions) {

	actions  = isArray(actions)   ? actions  : [ 'save' ];
	settings = isObject(settings) ? settings : browser.settings;


	if (isObject(settings['internet']) === false) {
		settings['internet'] = {};
	}


	listen(settings, (action, data, done) => {

		if (action === 'save') {

			browser.client.services.settings.save(data, (result) => {

				if (result === true) {

					Object.keys(data['internet']).forEach((key) => {
						settings['internet'][key] = data['internet'][key];
					});

					update(settings, actions);

				}

				done(result);

			});

		} else {
			done(false);
		}

	});

	update(settings, actions);

};

