
import { Element                } from '../design/Element.mjs';
import { check, HOSTS, SETTINGS } from './COMMON.mjs';

const ELEMENTS = {
	direct:  Element.query('#proxy input[value="direct"]'),
	stealth: Element.query('#proxy input[value="stealth"]'),
	i2p:     Element.query('#proxy input[value="i2p"]'),
	tor:     Element.query('#proxy input[value="tor"]')
};



(function(global) {

	check(HOSTS.stealth, (result) => {
		ELEMENTS.stealth.state(result === true ? 'enabled' : 'disabled');
	});

	check(HOSTS.i2p, (result) => {
		ELEMENTS.i2p.state(result === true ? 'enabled' : 'disabled');
	});

	check(HOSTS.tor, (result) => {
		ELEMENTS.tor.state(result === true ? 'enabled' : 'disabled');
	});


	Object.values(ELEMENTS).forEach((element) => {

		element.on('change', () => {

			let value = element.value();
			if (value !== null) {

				chrome.storage.local.set({
					'proxy': value
				});


				let settings = SETTINGS[value] || null;
				if (settings !== null) {
					chrome.proxy.settings.set({
						value: settings,
						scope: 'regular'
					});
				}

			}

		});

	});


	chrome.storage.local.get([
		'proxy',
		'stealth'
	], (obj) => {

		let proxy = obj.proxy || null;
		if (proxy !== null) {

			let settings = SETTINGS[value] || null;
			if (settings !== null) {
				chrome.proxy.settings.set({
					value: settings,
					scope: 'regular'
				});
			}


			Object.values(ELEMENTS).forEach((element) => {

				let value = element.value();
				if (value === proxy) {
					element.attr('checked', 'true');
				} else {
					element.attr('checked', '');
				}

			});

		}

		let stealth = obj.stealth || null;
		if (stealth !== null) {
			HOSTS.stealth.host             = stealth === 'localhost' ? '127.0.0.1' : stealth;
			SETTINGS.stealth.pacScript.url = 'http://' + stealth + ':65432/proxy.pac';
		}

	});

})(typeof window !== 'undefined' ? window : this);

