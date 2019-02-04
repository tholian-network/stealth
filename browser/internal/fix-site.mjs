
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
<td>${site.domain}</td>
<td class="site-mime">
	<button class="icon-text  ${site.mime.text  === true ? 'active' : ''}" data-type="text"  title="Text"></button>
	<button class="icon-image ${site.mime.image === true ? 'active' : ''}" data-type="image" title="Image"></button>
	<button class="icon-video ${site.mime.video === true ? 'active' : ''}" data-type="video" title="Video"></button>
	<button class="icon-other ${site.mime.other === true ? 'active' : ''}" data-type="other" title="Other"></button>
</td>
<td class="site-mode"><button class="icon-${site.mode}" title="${site.mode}" disabled></button></td>
<td><button class="icon-confirm" data-method="save"></button></td>
`;

let _SITE = null;

const _update = function(site) {

	let cache = browser.settings.sites.find(s => s.domain === site.domain) || null;
	if (cache !== null) {
		cache.mode       = site.mode;
		cache.mime.text  = site.mime.text;
		cache.mime.image = site.mime.image;
		cache.mime.video = site.mime.video;
		cache.mime.other = site.mime.other;
	} else if (cache === null) {
		browser.settings.sites.push(site);
	}

	_SITE = site;

	let old_row = elements.sites.querySelector('tr');
	if (old_row !== null) {
		old_row.parentNode.removeChild(old_row);
	}

	let new_row = doc.createElement('tr');
	new_row.innerHTML = _render_site(site);
	elements.sites.appendChild(new_row);

};

const _update_mode = function(site) {

	let mode = 'offline';
	let mime = site.mime;

	if (mime.other === true) {
		mode = 'online';
	} else if (mime.image === true || mime.video === true) {
		mode = 'stealth';
	} else if (mime.text === true) {
		mode = 'covert';
	}

	site.mode = mode;

};



const WIZARD = {

	init: function(browser) {

		if (elements.sites !== null) {

			elements.sites.addEventListener('click', e => {

				let element = e.target;
				let state   = element.className;
				let tagname = element.tagName.toLowerCase();
				if (tagname === 'button') {

					let row = element.parentNode.parentNode;

					if (state.includes('confirm')) {

						let method  = element.getAttribute('data-method') || null;
						let service = browser.client.services.site;
						if (service !== null && typeof service[method] === 'function') {

							element.className += ' busy';

							service[method](_SITE, response => {

								element.className = state;

								if (typeof response === 'boolean') {
									// Do nothing
								} else if (response !== null) {
									_update(response);
								}

							});

						} else {
							element.setAttribute('disabled', true);
						}

					} else if (
						state.includes('text')
						|| state.includes('image')
						|| state.includes('video')
						|| state.includes('other')
					) {

						let type = element.getAttribute('data-type') || null;
						if (type !== null && _SITE !== null) {

							_SITE.mime[type] = !_SITE.mime[type];
							_update_mode(_SITE);

							if (_SITE.mime[type] === true) {
								element.className = 'icon-' + type + ' active';
							} else {
								element.className = 'icon-' + type;
							}

							let mode = row.querySelector('.site-mode button');
							if (mode !== null) {
								mode.className = 'icon-' + _SITE.mode;
								mode.title     = _SITE.mode;
							}

						}

					}

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

					site = browser.config(REFERENCE.url);

					if (REFERENCE.subdomain !== null) {
						site.domain = REFERENCE.subdomain + '.' + REFERENCE.domain;
					} else {
						site.domain = REFERENCE.domain;
					}

					_update(site);

				}

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

