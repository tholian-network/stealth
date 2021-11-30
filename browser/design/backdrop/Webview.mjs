
import { Element                      } from '../Element.mjs';
import { Widget                       } from '../Widget.mjs';
import { console, isBoolean, isString } from '../../extern/base.mjs';
import { dispatch                     } from '../../design/index.mjs';
import { ENVIRONMENT                  } from '../../source/ENVIRONMENT.mjs';
import { DATETIME                     } from '../../source/parser/DATETIME.mjs';
import { URL                          } from '../../source/parser/URL.mjs';



const toSRC = function(url) {

	url = URL.isURL(url) ? url : null;


	let src = null;

	if (url !== null) {

		let mime = url.mime || null;
		if (mime !== null) {

			if (mime.type === 'image' || mime.type === 'audio' || mime.type === 'video') {

				src = '/browser/internal/media.html?url=' + encodeURIComponent(url.link);

			} else if (url.protocol === 'stealth') {

				src = '/browser/internal/' + url.domain + '.html';

				if (url.query !== null) {
					src += '?' + url.query;
				}

			} else if (url.protocol === 'https' || url.protocol === 'http') {
				src = '/stealth/' + url.link;
			} else {
				src = '/browser/internal/fix-connection.html?url=' + encodeURIComponent(url.link);
			}

		} else {
			src = '/browser/internal/fix-connection.html?url=' + encodeURIComponent(url.link);
		}

	}

	return src;

};

const toURL = function(src) {

	src = isString(src) ? src : null;


	let url = null;

	if (src !== null) {

		if (src.startsWith('/browser/internal/fix-connection.html?url=') === true) {

			let tmp = (src.split('?url=').pop() || '').split('&').shift() || null;
			if (tmp !== null) {
				url = URL.parse('stealth:fix-connection?url=' + decodeURIComponent(tmp));
			}

		} else if (src.startsWith('/browser/internal/fix-host.html?url=') === true) {

			let tmp = (src.split('?url=').pop() || '').split('&').shift() || null;
			if (tmp !== null) {
				url = URL.parse('stealth:fix-host?url=' + decodeURIComponent(tmp));
			}

		} else if (src.startsWith('/browser/internal/fix-mode.html?url=') === true) {

			let tmp = (src.split('?url=').pop() || '').split('&').shift() || null;
			if (tmp !== null) {
				url = URL.parse('stealth:fix-mode?url=' + decodeURIComponent(tmp));
			}

		} else if (src.startsWith('/browser/internal/media.html?url=') === true) {

			let tmp = (src.split('?url=').pop() || '').split('&').shift() || null;
			if (tmp !== null) {
				url = URL.parse('stealth:media?url=' + decodeURIComponent(tmp));
			}

		} else if (src.startsWith('/stealth/') === true) {

			url = URL.parse(src.split('/').slice(3).join('/'));

		}

	}

	return url;

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
				window.document.title = 'Tholian Stealth #' + tab.id + ' - ' + title.innerText.trim();
			}

		}

	} else {

		window.document.title = 'Tholian Stealth';

	}

};

const update = function(tab, refresh) {

	refresh = isBoolean(refresh) ? refresh : false;


	let src = toSRC(tab.url);
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
		'<iframe sandbox="allow-downloads allow-scripts allow-same-origin" src="/browser/internal/blank.html"></iframe>'
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

			dispatch(window, browser);

		}

		this.window = window;


		let url = toURL(this.window.location.pathname + this.window.location.search);
		if (url !== null) {

			if (
				url.link !== this.url.link
				&& url.protocol === 'stealth'
				&& this.url.protocol !== 'stealth'
			) {

				// XXX: In case of a Page Redirect, update Tab's Settings
				// without triggering an event (to avoid potential cycles)

				let datetime = DATETIME.parse(new Date());

				browser.tab.url  = url;
				browser.tab.mode = {
					domain: url.domain,
					mode: {
						text:  true,
						image: true,
						audio: true,
						video: true,
						other: true
					}
				};
				browser.tab.history.push({
					date: DATETIME.toDate(datetime),
					link: url.link,
					mode: browser.tab.mode,
					time: DATETIME.toTime(datetime)
				});


				let address = Widget.query('browser-appbar-address');
				if (address !== null) {
					address.value(url);
				}

				let mode = Widget.query('browser-appbar-mode');
				if (mode !== null) {
					mode.value(browser.tab.mode);
				}

			}

		}

	});

	this.webview.on('load', () => {
		update_theme.call(this, browser.settings['interface'].theme);
		update_title.call(this, browser.tab);
	});

	browser.on('change', (tab) => {

		if (tab === browser.tab && tab.history.length >= 2) {

			let redirect = URL.parse(tab.history[tab.history.length - 1].link);
			let origin   = URL.parse(tab.history[tab.history.length - 2].link);

			if (
				redirect.protocol === 'stealth'
				&& redirect.domain === 'fix-mode'
				&& origin.protocol !== 'stealth'
				&& origin.domain !== 'fix-mode'
				&& (
					redirect.query === 'url=' + origin.link
					|| redirect.query === 'url=' + encodeURIComponent(origin.link)
				)
			) {
				browser.back();
			}

		}

	});

	browser.on('theme',   (theme) => update_theme.call(this, theme));
	browser.on('show',    (tab)   => update.call(this, tab, false));
	browser.on('refresh', (tab)   => update.call(this, tab, true));


	Widget.call(this);

};


Webview.prototype = Object.assign({}, Widget.prototype, {

	toBaseURL: function() {

		let url = this.url;
		if (url.protocol === 'stealth') {

			let link = null;

			if (ENVIRONMENT.secure === true) {
				link = 'https://' + ENVIRONMENT.hostname + ':65432/browser/internal/' + url.domain + '.html';
			} else {
				link = 'http://' + ENVIRONMENT.hostname + ':65432/browser/internal/' + url.domain + '.html';
			}

			return URL.parse(link);

		} else if (url.protocol === 'https' || url.protocol === 'http') {

			return URL.parse(url.link);

		} else {

			let link = null;

			if (ENVIRONMENT.secure === true) {
				link = 'https://' + ENVIRONMENT.hostname + ':65432/browser/internal/fix-connection.html';
			} else {
				link = 'http://' + ENVIRONMENT.hostname + ':65432/browser/internal/fix-connection.html';
			}

			return URL.parse(link);

		}

	}

});


export { Webview };

