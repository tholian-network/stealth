
import { Element } from '../../design/Element.mjs';

const ELEMENTS = {
	connection: Element.query('#internet-connection input'),
	history:    Element.query('#internet-history input'),
	useragent:  Element.query('#internet-useragent input')
};

const listen = function(browser, callback) {

	Object.keys(ELEMENTS).forEach((type) => {

		ELEMENTS[type].forEach((element, e, others) => {

			element.on('change', () => {

				others.forEach((other) => {
					console.log(other.element.checked, other.attr('checked'));
				});

				let active = others.find((e) => e.checked === true) || null;
				if (active !== null) {

					let cur_val = browser.settings['internet'][type];
					let new_val = active.value;

					if (cur_val !== new_val) {

						let data = {};
						data['internet'] = {};
						Object.assign(data['internet'], browser.settings['internet']);
						data['internet'][type] = new_val;


						element.state('busy');

						callback('save', data, function(result) {
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

const update = function(settings) {

	let internet = settings.internet || null;
	if (internet !== null) {

		update_choices(
			[ 'mobile', 'broadband', 'peer', 'i2p', 'tor' ],
			settings.internet.connection,
			ELEMENTS.internet.connection
		);

		update_choices(
			[ 'stealth', 'day', 'week', 'forever' ],
			settings.internet.history,
			ELEMENTS.internet.history
		);

		update_choices(
			[ 'stealth', 'browser-mobile', 'browser-desktop', 'spider-mobile', 'spider-desktop' ],
			settings.internet.useragent,
			ELEMENTS.internet.useragent
		);

	}

};



export const init = function(browser) {

	listen(browser, (action, data, done) => {

		let service = browser.client.services.settings || null;
		if (service !== null) {

			if (action === 'save') {

				service.save(data, (result) => {

					if (result === true) {

						Object.keys(data.internet).forEach((key) => {
							browser.settings.internet[key] = data.internet[key];
						});

						update({
							internet: browser.settings.internet
						});

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

};

