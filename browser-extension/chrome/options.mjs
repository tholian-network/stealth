
import { Element                } from '../design/Element.mjs';
import { check, HOSTS, SETTINGS } from './COMMON.mjs';

const ELEMENTS = {
	proxy:   Element.query('#proxy input'),
	stealth: Element.query('#stealth input'),
	bypass:  {
		input:  {
			domain: Element.query('#bypass table tfoot *[data-key="domain"]')
		},
		label:  Element.query('#bypass-filter label'),
		search: Element.query('#bypass-filter input'),
		output: Element.query('#bypass table tbody')
	}
};

const update = function(obj) {

	let proxy = obj.proxy || null;
	if (proxy !== null) {

		ELEMENTS.proxy.forEach((element) => {

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
		ELEMENTS.stealth.value(stealth);
		HOSTS.stealth.host             = stealth === 'localhost' ? '127.0.0.1' : stealth;
		SETTINGS.stealth.pacScript.url = 'http://' + stealth + ':65432/proxy.pac';
	}

};

const listen = function() {

	ELEMENTS.proxy.forEach((element) => {

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

	ELEMENTS.stealth.on('change', () => {

		let value = ELEMENTS.stealth.value();

		check({
			host: value,
			port: 65432
		}, (result) => {

			if (result === true) {
				chrome.storage.local.set({
					'stealth': value
				});
			} else {
				ELEMENTS.stealth.value('');
			}

		});

	});

	// TODO: ELEMENTS.bypass.input, label, search, output

};

const refresh = function() {

	chrome.storage.local.get([
		'proxy',
		'stealth'
	], (obj) => {

		update(obj);


		check(HOSTS.stealth, (result) => {
			ELEMENTS.proxy[1].state(result === true ? 'enabled' : 'disabled');
		});

		check(HOSTS.i2p, (result) => {
			ELEMENTS.proxy[2].state(result === true ? 'enabled' : 'disabled');
		});

		check(HOSTS.tor, (result) => {
			ELEMENTS.proxy[3].state(result === true ? 'enabled' : 'disabled');
		});

	});

};



(function(global) {

	listen();
	refresh();


	chrome.storage.local.onChanged.addListener((obj) => {

		let data = {};

		let proxy = obj.proxy || null;
		if (proxy !== null) {
			data.proxy = proxy.newValue;
		}

		let stealth = obj.stealth || null;
		if (stealth !== null) {
			data.stealth = stealth.newValue;
		}

		if (Object.keys(data).length > 0) {
			update(data);
		}

	});

})(typeof window !== 'undefined' ? window : this);

