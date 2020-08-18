
import { Element                      } from '../Element.mjs';
import { Widget                       } from '../Widget.mjs';
import { console, isBoolean, isString } from '../../extern/base.mjs';
import { dispatch                     } from '../../design/index.mjs';
import { URL                          } from '../../source/parser/URL.mjs';



const toSrc = function(id, url, refresh) {

	id      = isString(id)       ? id      : null;
	url     = URL.isURL(url)     ? url     : null;
	refresh = isBoolean(refresh) ? refresh : false;


	let src = null;

	if (url !== null) {

		let mime = url.mime || null;
		if (mime !== null) {

			if (mime.type === 'audio' || mime.type === 'video') {

				src = '/browser/internal/media.html?url=' + encodeURIComponent(url.link);

			} else if (url.protocol === 'stealth') {

				src = '/browser/internal/' + url.domain + '.html';

				if (url.query !== null) {
					src += '?' + url.query;
				}

			} else if (url.protocol === 'https' || url.protocol === 'http') {

				if (id !== null) {

					if (refresh === true) {
						src = '/stealth/:' + id + ',refresh,webview:/' + url.link;
					} else {
						src = '/stealth/:' + id + ',webview:/' + url.link;
					}

				}

			} else {
				src = '/browser/internal/fix-request.html?url=' + encodeURIComponent(url.link);
			}

		} else {
			src = '/browser/internal/fix-request.html?url=' + encodeURIComponent(url.link);
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

const update_title = function(tab) {

	if (tab !== null) {

		if (this.window !== null) {

			let title = this.window.document.querySelector('title');
			if (title !== null) {
				window.document.title = 'Stealth Browser #' + tab.id + ' - ' + title.innerText.trim();
			}

		}

	} else {

		window.document.title = 'Stealth Browser';

	}

};

const update = function(tab, refresh) {

	let src = toSrc(tab.id, tab.url, refresh);
	if (src !== null) {

		if (refresh === true) {

			this.url = tab.url;
			this.webview.attr('src', src);

		} else {

			if (this.webview.attr('src') !== src) {

				this.url = tab.url;
				this.webview.attr('src', src);

			}

		}

	}

};



const Webview = function(browser) {

	this.element = new Element('browser-backdrop-webview', [
		'<iframe sandbox="allow-scripts allow-same-origin" src="/browser/internal/blank.html"></iframe>'
	]);

	this.url     = URL.parse('stealth:blank');
	this.webview = this.element.query('iframe');
	this.window  = this.webview.node.contentWindow || null;

	this.webview.on('load', () => {

		let window = this.webview.node.contentWindow || null;
		if (window !== null) {

			window.onerror = (err) => {
				console.error(err);
			};

			if (this.url.protocol === 'stealth') {
				dispatch(window, browser);
			}

		}

		this.window = window;

	});

	this.webview.on('load', () => {
		update_theme.call(this, browser.settings['interface'].theme);
		update_title.call(this, browser.tab);
	});


	browser.on('theme',   (theme)              => update_theme.call(this, theme));
	browser.on('show',    (tab, tabs, refresh) => update.call(this, tab, refresh));
	browser.on('refresh', (tab, tabs, refresh) => update.call(this, tab, refresh));


	Widget.call(this);

};


Webview.prototype = Object.assign({}, Widget.prototype);


export { Webview };

