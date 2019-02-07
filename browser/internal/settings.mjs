
const browser  = window.browser || parent.browser || null;
const doc      = window.document;
const elements = {
	internet: {
		connection: Array.from(doc.querySelectorAll('#internet-connection input')),
		torify:     Array.from(doc.querySelectorAll('#internet-torify input'))
	},
	hosts:  doc.querySelector('#hosts table tbody'),
	peers:  doc.querySelector('#peers table tbody'),
	sites:  doc.querySelector('#sites table tbody'),
	footer: doc.querySelector('footer'),
	confirm: doc.querySelector('footer #settings-confirm')
};



const _render_host = (host) => `
<tr>
	<td>${host.domain}</td>
	<td><input type="text" placeholder="IPv4" value="${(host.ipv4 !== null ? host.ipv4 : '')}"></td>
	<td><input type="text" placeholder="IPv6" value="${(host.ipv6 !== null ? host.ipv6 : '')}"></td>
	<td><button data-action="refresh"></button><button data-action="remove"></button></td>
</tr>
`;

const _render_peer = (peer) => `
<tr>
	<td>${peer.domain}</td>
	<td><button data-connection="${peer.connection}"></button></td>
	<td><button data-status="${peer.status}"></button></td>
	<td><button data-action="refresh"></button><button data-action="remove"></button></td>
</tr>
`;

const _render_site = (site) => `
<tr>
	<td>${site.domain}</td>
	<td>
		<button data-mode="text"  class="${site.mode.text  === true ? 'active' : ''}" title="Allow/Disallow Text"></button>
		<button data-mode="image" class="${site.mode.image === true ? 'active' : ''}" title="Allow/Disallow Image"></button>
		<button data-mode="audio" class="${site.mode.audio === true ? 'active' : ''}" title="Allow/Disallow Audio"></button>
		<button data-mode="video" class="${site.mode.video === true ? 'active' : ''}" title="Allow/Disallow Video"></button>
		<button data-mode="other" class="${site.mode.other === true ? 'active' : ''}" title="Allow/Disallow Other"></button>
	</td>
	<td><button data-action="remove"></button></td>
</tr>
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

	elements.hosts.innerHTML = '';
	elements.hosts.innerHTML = settings.hosts.map(h => _render_host(h)).join('');

	elements.peers.innerHTML = '';
	elements.peers.innerHTML = settings.peers.map(p => _render_peer(p)).join('');

	elements.sites.innerHTML = '';
	elements.sites.innerHTML = settings.sites.map(s => _render_site(s)).join('');

};



const SETTINGS = {

	init: function(browser) {

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

	}

};


export { SETTINGS };


if (browser !== null) {
	SETTINGS.init(browser);
}

