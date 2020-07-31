
import { console     } from '../extern/base.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { Element     } from '../design/Element.mjs';
import { Beacon      } from '../design/card/Beacon.mjs';
import { Host        } from '../design/card/Host.mjs';
import { Mode        } from '../design/card/Mode.mjs';
import { Peer        } from '../design/card/Peer.mjs';
import { URL         } from '../source/parser/URL.mjs';



const render_widget = (widget) => {

	let body = Element.query('body');

	if (body !== null && widget !== null) {
		widget.render(body);
		widget.emit('show');
	}

};

let browser = window.parent.BROWSER || null;
let domain  = URL.toDomain(ENVIRONMENT.flags.url);

if (browser !== null && domain !== null) {

	let element = Element.query('[data-key="domain"]');
	if (element !== null) {
		element.value(domain);
	}

	let host = browser.settings.hosts.find((h) => h.domain === domain) || null;
	if (host !== null) {

		render_widget(Host.from(host));

	} else {

		render_widget(Host.from({
			domain: domain
		}, [ 'create', 'refresh' ]));

	}

	let mode = browser.settings.modes.find((m) => m.domain === domain) || null;
	if (mode !== null) {

		render_widget(Mode.from(mode));

	} else {

		render_widget(Mode.from({
			domain: domain
		}, [ 'create' ]));

	}

	let beacons = browser.settings.beacons.filter((b) => b.domain === domain) || [];
	if (beacons.length > 0) {

		beacons.forEach((beacon) => {
			render_widget(Beacon.from(beacon));
		});

	} else {

		render_widget(Beacon.from({
			domain: domain
		}, [ 'create' ]));

	}

	let peer = browser.settings.peers.find((p) => p.domain === domain) || null;
	if (peer !== null) {

		render_widget(Peer.from(peer));

	} else {

		render_widget(Peer.from({
			domain:     domain,
			connection: 'offline'
		}, [ 'create', 'refresh' ]));

	}


	console.log('Host',    host);
	console.log('Mode',    mode);
	console.log('Peer',    peer);
	console.log('Beacons', beacons);

}

