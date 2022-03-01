
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { Element     } from '../design/Element.mjs';
import { Settings    } from '../design/card/Settings.mjs';
import { Browser     } from '../internal/debug/Browser.mjs';
import { URL         } from '../source/parser/URL.mjs';



let browser = window.parent.BROWSER || null;
if (browser !== null) {

	let browser_settings = Browser.from(browser.settings, [ 'tabs', 'sessions' ]);
	let site_settings    = Settings.from({ domain: '' }, [ 'beacons', 'blockers', 'echos', 'hosts', 'modes', 'peers', 'policies', 'redirects', 'tasks' ]);

	if (URL.isURL(ENVIRONMENT.flags.url) === true) {

		let domain = URL.toDomain(ENVIRONMENT.flags.url);
		if (domain !== null) {
			site_settings.value({ domain: domain });
		}

		let footer = site_settings.query('browser-card-settings-footer');
		if (footer !== null) {

			let button = new Element('button');

			button.attr('title',       'Open URL in new Tab');
			button.attr('data-action', 'open');

			button.on('click', () => {

				let tab = browser.open(ENVIRONMENT.flags.url.link);
				if (tab !== null) {
					browser.show(tab);
				}

			});

			button.render(footer);

		}

	}

	let body = Element.query('body');
	if (body !== null) {

		site_settings.render(body);
		site_settings.emit('show');

		browser_settings.render(body);
		browser_settings.emit('show');

	}

}

