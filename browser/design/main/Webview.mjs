
import { Element             } from '../../design/index.mjs';
import { isBoolean, isString } from '../../extern/base.mjs';
import { dispatch            } from '../../internal/index.mjs';
import { URL                 } from '../../source/parser/URL.mjs';



const TEMPLATE = `
<iframe sandbox="allow-scripts allow-same-origin" src="/browser/internal/welcome.html"></iframe>
`;

const get_src = function(id, ref, refresh) {

	id      = isString(id)       ? id      : null;
	ref     = URL.isURL(ref)     ? ref     : null;
	refresh = isBoolean(refresh) ? refresh : false;


	let src = null;

	if (ref !== null) {

		let mime = ref.mime || null;
		if (mime !== null) {

			if (mime.type === 'audio' || mime.type === 'video') {

				src = '/browser/internal/media.html?url=' + encodeURIComponent(ref.url);

			} else if (ref.protocol === 'stealth') {

				src = '/browser/internal/' + ref.domain + '.html';

				if (ref.query !== null) {
					src += '?' + ref.query;
				}

			} else if (ref.protocol === 'https' || ref.protocol === 'http') {

				if (id !== null) {

					if (refresh === true) {
						src = '/stealth/:' + id + ',refresh,webview:/' + ref.url;
					} else {
						src = '/stealth/:' + id + ',webview:/' + ref.url;
					}

				}

			} else {
				src = '/browser/internal/fix-request.html?url=' + encodeURIComponent(ref.url);
			}

		} else {
			src = '/browser/internal/fix-request.html?url=' + encodeURIComponent(ref.url);
		}

	}

	return src;

};

const update_theme = function(theme) {

	if (this.window !== null) {

		let body = this.window.document.querySelector('body');
		if (body !== null) {
			body.setAttribute('data-theme', theme);
		}

	}

};

const update = function(tab, refresh) {

	let ref = tab.ref;
	let id  = tab.id;
	let src = get_src(id, ref, refresh);

	if (src !== null) {

		if (refresh === true) {

			this.ref                 = ref;
			this.webview.element.src = src;

		} else {

			if (this.webview.element.src !== src) {

				this.ref                 = ref;
				this.webview.element.src = src;

			}

		}

	}

};



const Webview = function(browser) {

	this.element = Element.from('browser-webview', TEMPLATE);
	this.ref     = URL.parse('stealth:welcome');
	this.webview = this.element.query('iframe');
	this.window  = this.webview.element.contentWindow || null;


	this.webview.on('load', () => {

		let window = this.webview.element.contentWindow || null;
		if (window !== null) {

			if (this.ref.protocol === 'stealth') {
				dispatch(window, browser);
			}

		}

		this.window = window;

	});

	this.webview.on('load', () => {
		update_theme.call(this, browser.settings['interface'].theme);
	});


	browser.on('theme',   (theme)              => update_theme.call(this, theme));
	browser.on('show',    (tab, tabs, refresh) => update.call(this, tab, refresh));
	browser.on('refresh', (tab, tabs, refresh) => update.call(this, tab, refresh));

};


Webview.prototype = {

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Webview };

