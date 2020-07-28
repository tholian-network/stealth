
import { console     } from '../extern/base.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { Element     } from '../design/Element.mjs';
import { Beacon      } from '../design/card/Beacon.mjs';
import { Host        } from '../design/card/Host.mjs';
import { Mode        } from '../design/card/Mode.mjs';
import { URL         } from '../source/parser/URL.mjs';



let body    = Element.query('body');
let domain  = URL.toDomain(ENVIRONMENT.flags.url);
let browser = window.parent.BROWSER || null;

if (body !== null && browser !== null && domain !== null) {

	let element = body.query('[data-key="domain"]');
	if (element !== null) {
		element.value(domain);
	}

	let host = browser.settings.hosts.find((h) => h.domain === domain) || null;
	if (host !== null) {

		let widget = new Host(browser);

		widget.render(body);
		widget.value(host);

		setTimeout(() => {
			widget.emit('show');
		}, 0);

	} else {

		let widget = new Host(browser, [ 'create', 'refresh' ]);

		widget.render(body);
		widget.value({
			domain: domain
		});

		setTimeout(() => {
			widget.emit('show');
		}, 0);

	}

	let mode = browser.settings.modes.find((m) => m.domain === domain) || null;
	if (mode !== null) {

		let widget = new Mode(browser);

		widget.render(body);
		widget.value(mode);

		setTimeout(() => {
			widget.emit('show');
		}, 0);

	} else {

		let widget = new Mode(browser, [ 'create' ]);

		widget.render(body);
		widget.value({
			domain: domain
		});

		setTimeout(() => {
			widget.emit('show');
		}, 0);

	}

	let beacons = browser.settings.beacons.filter((b) => b.domain === domain) || [];
	if (beacons.length > 0) {

		beacons.forEach((beacon) => {

			let widget = new Beacon(browser);

			widget.render(body);
			widget.value(beacon);

			setTimeout(() => {
				widget.emit('show');
			}, 0);

		});

	} else {

		let widget = new Beacon(browser, [ 'create' ]);

		widget.render(body);
		widget.value({
			domain: domain,
			path:   '/blog/*',
			beacons: [{
				label:  'headline',
				select: [ 'article h3' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}, {
				label:  'content',
				select: [ 'article p', 'article img' ],
				mode:   {
					text:  true,
					image: true,
					audio: false,
					video: false,
					other: false
				}
			}]
		});

		setTimeout(() => {
			widget.emit('show');
		}, 0);

	}


	console.log('Host',    host);
	console.log('Mode',    mode);
	console.log('Beacons', beacons);

}

