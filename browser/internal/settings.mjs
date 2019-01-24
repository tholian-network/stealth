
const browser  = window.browser || parent.browser || null;
const doc      = window.document;
const elements = {
	internet: {
		connection: doc.querySelectorAll('#internet-connection input'),
		torify:     doc.querySelectorAll('#internet-torify input')
	},
	hosts: doc.querySelector('#hosts table tbody'),
	peers: doc.querySelector('#peers table tbody'),
	sites: doc.querySelector('#sites table tbody'),
};



const _render_host = (host) => `
<td><input type="text" value="${host.domain}"></td>
<td><input type="text" placeholder="IPv4" value="${host.ipv4}"></td>
<td><input type="text" placeholder="IPv6" value="${host.ipv6}"></td>
<td><button class="icon-refresh"></button><button class="icon-remove"></button></td>
`;

const _render_peer = (peer) => `
<td><input type="text" value="${peer.name}"></td>
<td><button class="icon-${peer.capacity}" disabled></button></td>
<td><button class="icon-${peer.mode}"></button></td>
<td><button class="icon-refresh"></button><button class="icon-remove"></button></td>
`;


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

	Array.from(elements.hosts.querySelectorAll('tr')).forEach(row => {
		row.parentNode.removeChild(row);
	});

	settings.hosts.map(host => _render_host(host)).forEach(html => {
		let row = doc.createElement('tr');
		row.innerHTML = html;
		elements.hosts.appendChild(row);
	});

	Array.from(elements.peers.querySelectorAll('tr')).forEach(row => {
		row.parentNode.removeChild(row);
	});

	settings.peers.map(peer => _render_peer(peer)).forEach(html => {
		let row = doc.createElement('tr');
		row.innerHTML = html;
		elements.peers.appendChild(row);
	});

};



const SETTINGS = {

	init: function(browser) {

		let client = browser.client;
		if (client !== null) {
			client.services.settings.read(null, _ => _update(browser.settings));
		}


		// TODO: Initialize event listeners

	}

};


export { SETTINGS };


if (browser !== null) {
	SETTINGS.init(browser);
} else {
	console.error('No Browser accessible :(');
}

