
import { isBoolean, isFunction } from '../../source/BASE.mjs';
import { dispatch              } from '../control.mjs';
import { Element               } from '../Element.mjs';



const TEMPLATE = `
<iframe sandbox="allow-scripts allow-same-origin" src="/browser/internal/welcome.html"></iframe>
`;

const get_url = function(tab, refresh) {

	refresh = isBoolean(refresh) ? refresh : false;


	let url = null;

	if (tab !== null) {

		let mime = tab.ref.mime || null;
		if (mime !== null) {

			if (mime.type === 'audio' || mime.type === 'video') {

				url = '/browser/internal/media.html?url=' + encodeURIComponent(tab.ref.url);

			} else if (tab.ref.protocol === 'stealth') {

				url = '/browser/internal/' + tab.ref.domain + '.html';

				if (tab.ref.query !== null) {
					url += '?' + tab.ref.query;
				}

			} else if (tab.ref.protocol === 'https' || tab.ref.protocol === 'http') {

				if (refresh === true) {
					url = '/stealth/:' + tab.id + ',refresh,webview:/' + tab.ref.url;
				} else {
					url = '/stealth/:' + tab.id + ',webview:/' + tab.ref.url;
				}

			} else {
				url = '/browser/internal/fix-request.html?url=' + encodeURIComponent(tab.ref.url);
			}

		} else {
			url = '/browser/internal/fix-request.html?url=' + encodeURIComponent(tab.ref.url);
		}

	}

	return url;

};



const update = function(tab, refresh) {

	let url = get_url(tab, refresh);
	if (url !== null) {

		if (refresh === true) {

			this.webview.element.src = url;

		} else {

			if (this.webview.element.src !== url) {
				this.webview.element.src = url;
			}

		}

	}

};



const Webview = function(browser) {

	this.element = Element.from('browser-webview', TEMPLATE);
	this.webview = this.element.query('iframe');
	this.window  = this.webview.element.contentWindow || null;


	this.webview.on('load', () => {

		let window = this.webview.element.contentWindow || null;
		if (window !== null) {
			dispatch(window, browser);
			this.window = window;
		}

		// TODO: Modify links (a[href])

	});


	browser.on('execute', (code, done) => {

		if (isFunction(code)) {

			code.call(null,
				browser,
				this.window
			);

			if (isFunction(done)) {
				done(true);
			}

		} else {

			if (isFunction(done)) {
				done(false);
			}

		}

	});


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

