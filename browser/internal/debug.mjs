
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { Element     } from '../design/Element.mjs';
import { Session     } from '../design/card/Session.mjs';
import { Settings    } from '../design/card/Settings.mjs';
import { Tab         } from '../design/card/Tab.mjs';
import { URL         } from '../source/parser/URL.mjs';



let browser = window.parent.BROWSER || null;
if (browser !== null) {

	let site_settings = Settings.from({ domain: '' }, [ 'beacons', 'hosts', 'modes', 'peers', 'policies', 'redirects' ]);
	if (site_settings !== null) {

		let domain = URL.toDomain(ENVIRONMENT.flags.url);
		if (domain !== null) {
			site_settings.value({ domain: domain });
		}

		let section = Element.query('section[data-inspect="site"]');
		if (section !== null) {
			site_settings.render(section);
			site_settings.emit('show');
		}

		if (URL.isURL(ENVIRONMENT.flags.url) === true) {

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

	}


	setTimeout(() => {

		let article = new Element('article', [
			'<h3>Browser</h3>'
		]);

		if (browser.settings.sessions.length > 0) {

			new Element('h4', 'Browser Sessions').render(article);

			browser.settings.sessions.forEach((data) => {

				let card = Session.from(data);
				if (card !== null) {
					card.render(article);
				}

			});

		}

		if (browser.tabs.length > 0) {

			new Element('h4', 'Browser Tabs').render(article);

			browser.tabs.map((tab) => tab.toJSON()).forEach((data) => {

				let card = Tab.from(data);
				if (card !== null) {
					card.render(article);
				}

			});

		}

		let section = Element.query('section[data-inspect="browser"]');
		if (section !== null) {
			article.render(section);
		}

	}, 500);

}

