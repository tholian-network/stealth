
import { BROWSER, init, listen, render } from './internal.mjs';



const elements = {
	internet: {
		connection: Array.from(document.querySelectorAll('#internet-connection input')),
		torify:     Array.from(document.querySelectorAll('#internet-torify input'))
	},
	hosts:   document.querySelector('#hosts table tbody'),
	peers:   document.querySelector('#peers table tbody'),
	sites:   document.querySelector('#sites table tbody'),
	footer:  document.querySelector('footer'),
	confirm: document.querySelector('footer #settings-confirm')
};



const _sort_by_domain = (a, b) => {

	let a_domains = a.domain.split('.').reverse();
	let b_domains = b.domain.split('.').reverse();

	let max = Math.max(a_domains.length, b_domains.length);

	for (let d = 0; d < max; d++) {

		let a_domain = a_domains[d] || null;
		let b_domain = b_domains[d] || null;

		if (a_domain === null) {

			if (b_domain === null) {
				return 0;
			} else {
				return -1;
			}

		} else if (b_domain === null) {
			return 1;
		}

		if (a_domain > b_domain) return  1;
		if (b_domain > a_domain) return -1;

	}

	return 0;

};


const _update = function(settings) {

	let choices = {
		connection: [ 'broadband', 'mobile', 'peer' ],
		torify:     [ true, false ]
	};

	choices.connection.forEach((choice, c) => {

		let element = elements.internet.connection[c];
		let value   = settings.internet.connection;

		if (element !== null) {

			if (choice === value) {
				element.setAttribute('checked', 'true');
			} else {
				element.removeAttribute('checked');
			}

		}

	});


	let hosts_html = settings.hosts.sort(_sort_by_domain).map(host => render('host', host, true)).join('');
	if (hosts_html !== '') {
		elements.hosts.innerHTML = hosts_html;
	}

	let peers_html = settings.peers.sort(_sort_by_domain).map(peer => render('peer', peer, true)).join('');
	if (peers_html !== '') {
		elements.peers.innerHTML = peers_html;
	}

	let sites_html = settings.sites.sort(_sort_by_domain).map(site => render('site', site, true)).join('');
	if (sites_html !== '') {
		elements.sites.innerHTML = sites_html;
	}

};



init([
	elements.hosts,
	elements.peers,
	elements.sites,
	elements.footer,
	elements.confirm
], (browser, result) => {

	let client = browser.client;
	if (client !== null) {
		client.services.settings.read(null, () => _update(browser.settings));
	}


	elements.internet.connection.forEach((element, e, others) => {

		element.onchange = () => {

			let active = others.find(e => e.checked === true) || null;
			if (active !== null) {
				browser.settings.internet.connection = active.value;
				elements.footer.className = 'active';
			}

		};

	});

	elements.internet.torify.forEach((element, e, others) => {

		element.onchange = () => {

			let active = others.find(e => e.checked === true) || null;
			if (active !== null) {
				browser.settings.internet.torify = active.value === 'true' ? true : false;
				elements.footer.className = 'active';
			}

		};

	});

	elements.confirm.onclick = () => {

		browser.client.services.settings.save({}, () => {
			elements.footer.className = '';
		});

	};

});

