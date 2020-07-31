
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';
import { Element     } from '../design/Element.mjs';
import { Interface   } from '../design/card/Interface.mjs';
// import { Internet    } from '../design/card/Internet.mjs';
import { URL         } from '../source/parser/URL.mjs';



const render_widget = (widget) => {

	let body = Element.query('body');
	if (body !== null && widget !== null) {

		widget.render(body);
		widget.emit('show');

	}

};



let browser = window.parent.BROWSER || null;
if (browser !== null) {

	let profile = Element.query('[data-key="profile"]');
	if (profile !== null) {

		browser.client.services['settings'].info(null, (response) => {

			if (response.profile !== null) {
				profile.value(response.profile);
			}

		});

	}


	render_widget(Interface.from(browser.settings['interface']));
	// render_widget(Internet.from(browser.settings['internet']));

}

