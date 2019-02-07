
const browser  = window.browser || parent.browser || null;
const doc      = window.document;
const elements = {
	wizard:  doc.querySelector('#fix-site'),
	sites:   doc.querySelector('#fix-site table tbody'),
	footer:  doc.querySelector('footer'),
	refresh: doc.querySelector('footer #footer-refresh')
};
const REFERENCE = (function(query) {

	let url = null;

	if (query.startsWith('?')) {

		query.substr(1).split('&').map(t => t.split('=')).forEach(chunk => {

			if (chunk[0] === 'url') {
				url = decodeURIComponent(chunk[1]);
			}

		});

	}

	return browser.parse(url);

})(doc.location.search);



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
	<td><button data-action="confirm"></button></td>
</tr>
`;

let _SITE = null;

const _update = function(site) {

	elements.sites.innerHTML = '';
	elements.sites.innerHTML = _render_site(site);
	_SITE = site;

};

const _update_config = function(config) {

	Object.keys(config.mode).forEach(type => {

		let button = elements.sites.querySelector('button[data-mode="' + type + '"]');
		if (button !== null) {
			button.className = config.mode[type] === true ? 'active' : '';
		}

		if (_SITE !== null) {
			_SITE.mode[type] = config.mode[type] === true;
		}

	});

};



const WIZARD = {

	init: function(browser) {

		if (elements.sites !== null) {

			elements.sites.addEventListener('click', e => {

				let element = e.target;
				let action  = element.getAttribute('data-action') || null;
				let mode    = element.getAttribute('data-mode')   || null;

				if (action === 'confirm') {

					let site = _SITE;
					if (site !== null) {

						element.className = 'busy';

						let result = browser.set(_SITE);
						if (result === true) {
							element.className = '';
						}

					}

				} else if (mode !== null) {

					if (_SITE !== null) {
						_SITE.mode[mode] = !_SITE.mode[mode];
					}

					element.className = _SITE.mode[mode] === true ? 'active' : '';

				}

			});

		}


		if (elements.footer !== null && elements.refresh !== null) {
			elements.refresh.onclick = () => browser.refresh();
			elements.footer.className = 'active';
		}


		if (REFERENCE.domain !== null) {

			browser.client.services.site.read({
				domain:    REFERENCE.domain,
				subdomain: REFERENCE.subdomain,
				host:      REFERENCE.host
			}, site => {

				if (site !== null) {

					_update(site);

				} else {

					let config = browser.tab.config;

					if (REFERENCE.subdomain !== null) {
						config.domain = REFERENCE.subdomain + '.' + REFERENCE.domain;
					} else {
						config.domain = REFERENCE.domain;
					}

					_update(config);

				}

			});

			browser.on('change', (tab) => {
				_update_config(tab.config);
			});

		} else {

			let element = elements.wizard || null;
			if (element !== null) {
				element.parentNode.removeChild(element);
			}

		}

	}

};


export { WIZARD };


if (browser !== null) {
	WIZARD.init(browser);
} else {

	let element = elements.wizard || null;
	if (element !== null) {
		element.parentNode.removeChild(element);
	}

}

