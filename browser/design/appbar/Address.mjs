
import { Element  } from '../Element.mjs';
import { Widget   } from '../Widget.mjs';
import { isString } from '../../extern/base.mjs';
import { URL      } from '../../source/parser/URL.mjs';



const update = function(tab) {

	if (tab !== null) {

		this.input.state('');
		this.input.value(tab.ref);

		this.protocol.attr('title', tab.ref.protocol);
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

			chunks.push(new Element('li', domain));

		} else if (host !== null) {

			if (host.includes(':')) {
				host = '[' + host + ']';
			}


			let port     = tab.ref.port     || null;
			let protocol = tab.ref.protocol || null;

			if (protocol === 'file') {
				// Do nothing
			} else if (protocol === 'ftps' && port !== 990) {
				host += ':' + port;
			} else if (protocol === 'ftp' && port !== 21) {
				host += ':' + port;
			} else if (protocol === 'https' && port !== 443) {
				host += ':' + port;
			} else if (protocol === 'http' && port !== 80) {
				host += ':' + port;
			} else if (protocol === 'wss' && port !== 443) {
				host += ':' + port;
			} else if (protocol === 'ws' && port !== 80) {
				host += ':' + port;
			} else if (protocol === 'socks' && port !== 1080) {
				host += ':' + port;
			} else if (protocol === 'stealth') {
				// Do nothing
			}

			chunks.push(new Element('li', host));

		}

		let path = tab.ref.path || '/';
		if (path !== '/') {
			path.split('/').forEach((chunk) => {
				if (chunk !== '') {
					chunks.push(new Element('li', '/' + chunk));
				}
			});
		}

		let query = tab.ref.query || null;
		if (query !== null) {
			chunks.push(new Element('li', '?' + query));
		}

		this.output.value(chunks);

	} else {

		this.input.state('active');
		this.input.value('');
		this.input.emit('focus');

		this.protocol.attr('title', '');
		this.protocol.value('');

		this.output.state('');
		this.output.value('');

	}

};



const Address = function(browser) {

	this.element = new Element('browser-address', [
		'<ul><li data-key="protocol" data-val="stealth"></li><li>welcome</li></ul>',
		'<input type="text" data-map="URL" placeholder="Enter URL or Search Query" spellcheck="false" value="stealth:welcome">'
	].join(''));

	this.protocol = this.element.query('[data-key="protocol"]');
	this.input    = this.element.query('input');
	this.output   = this.element.query('ul');


	this.element.on('contextmenu', (e) => {

		let context = Widget.query('browser-context');
		if (context !== null) {

			let area = this.input.area();
			if (area !== null) {

				context.read((clipped) => {

					let ref = URL.parse(clipped);
					if (ref.protocol === 'https' || ref.protocol === 'http') {

						context.value([{
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
										this.input.node.setSelectionRange(0, ref.url.length);
										this.input.emit('focus');
									}

								}

							}
						}]);

					} else {

						context.value([{
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

		let url = this.input.node.value.trim();
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
			browser.navigate(url);
		}

	});

	this.input.on('click', (e) => {

		let context = Widget.query('browser-context');
		if (context !== null) {

			if (context.state() === 'active') {
				context.emit('hide');
			}

		}

		e.stopPropagation();

	});

	this.input.on('focus', () => {

		if (this.input.state() !== 'active') {
			this.input.state('active');
		}

	});

	this.input.on('keyup', (e) => {

		let key = e.key.toLowerCase();
		if (key === 'enter') {
			this.input.emit('blur');
		}

	});

	this.output.on('click', (e) => {

		let items = this.output.query('li').slice(1);
		let index = items.findIndex((item) => item.node === e.target);

		if (index !== -1) {

			let ref = this.input.value();
			let url = ref.url;

			let values = items.map((item) => item.value());
			let before = values.slice(0, index).join('');

			if (ref.protocol === 'stealth') {
				before = ref.protocol + ':' + before;
			} else if (ref.protocol !== null) {
				before = ref.protocol + '://' + before;
			}


			let offset = url.indexOf(before) + before.length;

			this.input.state('active');
			this.input.node.setSelectionRange(offset, offset + values[index].length);
			this.input.emit('focus');

		}


		let context = Widget.query('browser-context');
		if (context !== null) {

			if (context.state() === 'active') {
				context.emit('hide');
			}

		}

	});


	browser.on('show',    (tab) => update.call(this, tab));
	browser.on('refresh', (tab) => update.call(this, tab));


	Widget.call(this);

};


Address.prototype = Object.assign({}, Widget.prototype);


export { Address };

