
import { REFERENCE, init, listen, render } from './internal.mjs';



const elements = {
	wizard: document.querySelector('#fix-mode'),
	modes:  document.querySelector('#fix-mode table tbody')
};

const _on_update = function(settings, mode) {
	elements.modes.innerHTML = render('mode', mode, [ 'save' ]);
};



init([
	elements.wizard,
	elements.modes
], (browser, result) => {

	if (result === true) {

		listen(elements.modes, (action, data, done) => {

			let service = browser.client.services.mode || null;
			if (service !== null) {

				if (action === 'save') {
					done(browser.set(data) === true);
				} else {
					done(false);
				}

			} else {
				done(false);
			}

		});


		browser.on('change', (tab) => {

			Object.keys(tab.config.mode).forEach((mode) => {

				let button = elements.modes.querySelector('button[data-key="mode.' + mode + '"]');
				if (button !== null) {
					button.setAttribute('data-val', '' + tab.config.mode[mode]);
				}

			});

		});


		if (REFERENCE.domain !== null) {

			browser.client.services.mode.read({
				domain:    REFERENCE.domain,
				subdomain: REFERENCE.subdomain,
				host:      REFERENCE.host
			}, (mode) => {

				if (mode === null) {

					if (browser.tab !== null) {

						mode = browser.tab.config;

						if (REFERENCE.subdomain !== null) {
							mode.domain = REFERENCE.subdomain + '.' + REFERENCE.domain;
						} else {
							mode.domain = REFERENCE.domain;
						}

					} else {

						if (REFERENCE.subdomain !== null) {
							mode        = browser.get(REFERENCE.subdomain + '.' + REFERENCE.domain);
							mode.domain = REFERENCE.subdomain + '.' + REFERENCE.domain;
						} else {
							mode        = browser.get(REFERENCE.domain);
							mode.domain = REFERENCE.domain;
						}

					}

				}

				_on_update(browser.settings, mode);

			});

		}

	} else {

		let element = elements.wizard || null;
		if (element !== null) {
			element.parentNode.removeChild(element);
		}

	}

});

