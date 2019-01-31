
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
<td><input type="text" value="${host.domain}"></td>
<td><input type="text" placeholder="IPv4" value="${(host.ipv4 !== null ? host.ipv4 : '')}"></td>
<td><input type="text" placeholder="IPv6" value="${(host.ipv6 !== null ? host.ipv6 : '')}"></td>
<td><button class="icon-refresh"></button><button class="icon-remove"></button></td>
`;

const _render_peer = (peer) => `
<td><input type="text" value="${peer.domain}"></td>
<td><button class="icon-${peer.capacity}" disabled></button></td>
<td><button class="icon-${peer.mode}"></button></td>
<td><button class="icon-refresh"></button><button class="icon-remove"></button></td>
`;

const _render_site = (site) => `
<td><input id="sites-list-domain" type="text" placeholder="Domain" value="${site.domain}"></td>
<td class="site-mime">
	<button class="icon-text  ${site.mime.text  === true ? 'active' : ''}" title="Text"></button>
	<button class="icon-image ${site.mime.image === true ? 'active' : ''}" title="Image"></button>
	<button class="icon-video ${site.mime.video === true ? 'active' : ''}" title="Video"></button>
	<button class="icon-other ${site.mime.other === true ? 'active' : ''}" title="Other"></button>
</td>
<td class="site-mode"><button class="icon-${site.mode}" title="${site.mode}" disabled></button></td>
<td><button class="icon-remove"></button></td>
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

	Array.from(elements.sites.querySelectorAll('tr')).forEach(row => {
		row.parentNode.removeChild(row);
	});

	settings.sites.map(site => _render_site(site)).forEach(html => {
		let row = doc.createElement('tr');
		row.innerHTML = html;
		elements.sites.appendChild(row);
	});

};



const SETTINGS = {

	init: function(browser) {

		let client = browser.client;
		if (client !== null) {
			client.services.settings.read(null, _ => _update(browser.settings));
		}


		elements.internet.connection.forEach((element, e, others) => {

			element.onchange = _ => {

				let active = others.find(e => e.checked === true) || null;
				if (active !== null) {
					browser.settings.internet.connection = active.value;
					elements.footer.className = 'active';
				}

			};

		});

		elements.internet.torify.forEach((element, e, others) => {

			element.onchange = _ => {

				let active = others.find(e => e.checked === true) || null;
				if (active !== null) {
					browser.settings.internet.torify = active.value === 'true' ? true : false;
					elements.footer.className = 'active';
				}

			};

		});

		elements.confirm.onclick = _ => {

			browser.client.services.settings.save({}, result => {
				elements.footer.className = '';
			});

		};

	}

};


export { SETTINGS };


if (browser !== null) {
	SETTINGS.init(browser);
} else {
	console.error('No Browser accessible :(');
}

