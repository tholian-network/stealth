
import { isString } from '../../source/POLYFILLS.mjs';

import { Element } from '../Element.mjs';
import { URL     } from '../../source/parser/URL.mjs';



const TEMPLATE = `
<ul><li data-key="protocol" data-val="stealth"></li><li>stealth:welcome</li></ul>
<input type="text" data-map="URL" placeholder="Enter URL or Search Query" spellcheck="false" value="stealth:welcome">
`;



const update = function(tab) {

	if (tab !== null) {

		this.input.state('');
		this.input.value(tab.ref);

		this.protocol.element.title = tab.ref.protocol;
		this.protocol.value(tab.ref.protocol);


		let chunks = [ this.protocol ];
		let domain = tab.ref.domain || null;
		let host   = tab.ref.host   || null;

		if (domain !== null) {

			let subdomain = tab.ref.subdomain || null;
			if (subdomain !== null) {
				domain = subdomain + '.' + domain;
			}


			let port     = tab.ref.port     || null;
			let protocol = tab.ref.protocol || null;

			if (protocol === 'file') {
				// Do nothing
			} else if (protocol === 'ftps' && port !== 990) {
				domain += ':' + port;
			} else if (protocol === 'ftp' && port !== 21) {
				domain += ':' + port;
			} else if (protocol === 'https' && port !== 443) {
				domain += ':' + port;
			} else if (protocol === 'http' && port !== 80) {
				domain += ':' + port;
			} else if (protocol === 'wss' && port !== 443) {
				domain += ':' + port;
			} else if (protocol === 'ws' && port !== 80) {
				domain += ':' + port;
			} else if (protocol === 'socks' && port !== 1080) {
				domain += ':' + port;
			} else if (protocol === 'stealth') {
				// Do nothing
			}

			chunks.push(Element.from('li', domain, false));

		} else if (host !== null) {

			if (host.includes(':')) {
				host = '[' + host + ']';
			}


			let port     = tab.ref.port     || null;
			let protocol = tab.ref.protocol || null;

			if (protocol === 'file') {
				// Do nothing
			} else if (protocol === 'ftps' && port !== 990) {
				domain += ':' + port;
			} else if (protocol === 'ftp' && port !== 21) {
				domain += ':' + port;
			} else if (protocol === 'https' && port !== 443) {
				domain += ':' + port;
			} else if (protocol === 'http' && port !== 80) {
				domain += ':' + port;
			} else if (protocol === 'wss' && port !== 443) {
				domain += ':' + port;
			} else if (protocol === 'ws' && port !== 80) {
				domain += ':' + port;
			} else if (protocol === 'socks' && port !== 1080) {
				domain += ':' + port;
			} else if (protocol === 'stealth') {
				// Do nothing
			}

			chunks.push(Element.from('li', host, false));

		}

		let path = tab.ref.path || '/';
		if (path !== '/') {
			path.split('/').forEach((ch) => {
				if (ch !== '') {
					chunks.push(Element.from('li', '/' + ch, false));
				}
			});
		}

		let query = tab.ref.query || null;
		if (query !== null) {
			chunks.push(Element.from('li', '?' + query, false));
		}

		this.output.value(chunks);

	} else {

		this.input.state('active');
		this.input.value('');
		this.input.emit('focus');

		this.protocol.element.title = '';
		this.protocol.value('');

		this.output.state('');
		this.output.value('');

	}

};



const Address = function(browser, widgets) {

	this.element  = Element.from('browser-address', TEMPLATE);
	this.protocol = this.element.query('[data-key="protocol"]');
	this.input    = this.element.query('input');
	this.output   = this.element.query('ul');


	this.element.on('contextmenu', (e) => {

		let context = widgets.context || null;
		if (context !== null) {

			let area = this.input.area();
			if (area !== null) {

				widgets.context.read((clipped) => {

					let ref = URL.parse(clipped);
					if (ref.protocol === 'https' || ref.protocol === 'http') {

						context.set([{
							label: 'open',
							value: clipped,
						}, {
							label: 'copy',
							value: browser.tab.url
						}, {
							label:    'paste',
							value:    clipped,
							callback: (browser, value) => {

								if (isString(value)) {

									let ref = URL.parse(value.trim());
									if (ref.protocol === 'https' || ref.protocol === 'http') {
										this.input.state('active');
										this.input.value(ref);
										this.input.element.setSelectionRange(0, ref.url.length);
										this.input.emit('focus');
									}

								}

							}
						}]);

					} else {

						context.set([{
							label: 'copy',
							value: browser.tab.url
						}]);

					}

					context.area({
						x: area.x,
						y: 0
					});

					context.emit('show');

				});

			}

		}

		e.preventDefault();
		e.stopPropagation();

	});

	this.input.on('blur', () => {

		let url = this.input.element.value.trim();
		if (url === '') {

			update.call(this, browser.tab);

		} else if (
			url.includes(' ') === true
			&& url.startsWith('stealth:search') === false
		) {

			url = 'stealth:search?query=' + encodeURIComponent(url);
			this.input.state('');

		} else if (url.endsWith('://')) {

			update.call(this, browser.tab);
			url = '';

		} else if (url === 'stealth:') {

			this.input.state('');
			this.input.value('stealth:welcome');
			url = 'stealth:welcome';

		} else if (url.startsWith('stealth:') || url.includes('://')) {

			this.input.state('');

		} else {

			this.input.state('');
			this.input.value('https://' + url);
			url = 'https://' + url;

		}


		if (url !== '') {

			let tab = browser.open(url);
			if (tab !== null) {
				browser.show(tab);
			}

		}

	});

	this.input.on('click', (e) => {

		let context = widgets.context || null;
		if (context !== null) {

			if (context.element.state() === 'active') {
				context.emit('hide');
			}

		}

		e.stopPropagation();

	});

	this.input.on('focus', () => {

		// Set by output.on('click')
		if (this.input.state() !== 'active') {

			let ref = this.input.value() || null;
			if (ref !== null) {
				this.input.element.setSelectionRange(0, ref.url.length);
				this.input.state('active');
			} else {
				this.input.state('active');
			}

		}

	});

	this.input.on('keyup', (e) => {

		let key = e.key.toLowerCase();
		if (key === 'enter') {
			this.input.emit('blur');
		}

	});

	this.output.on('click', (e) => {

		let target   = e.target;
		let elements = Array.from(this.output.query('li')).slice(1);

		let index = elements.findIndex((e) => e.element === target);
		if (index !== -1) {

			let ref = this.input.value();
			let url = ref.url;

			let values = elements.map((e) => e.value());
			let before = values.slice(0, index).join('');

			if (ref.protocol === 'stealth') {
				before = ref.protocol + ':' + before;
			} else if (ref.protocol !== null) {
				before = ref.protocol + '://' + before;
			}

			let offset = url.indexOf(before) + before.length;

			this.input.state('active');
			this.input.element.setSelectionRange(offset, offset + values[index].length);
			this.input.emit('focus');

		}


		let context = widgets.context || null;
		if (context !== null) {

			if (context.element.state() === 'active') {
				context.emit('hide');
			}

		}

	});


	browser.on('show',    (tab) => update.call(this, tab));
	browser.on('refresh', (tab) => update.call(this, tab));

};


Address.prototype = {

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Address };

