
import { Assistant          } from '../Assistant.mjs';
import { Element            } from '../Element.mjs';
import { Widget             } from '../Widget.mjs';
import { isObject, isString } from '../../extern/base.mjs';
import { URL                } from '../../source/parser/URL.mjs';



const ASSISTANT = new Assistant({
	name:   'Address',
	widget: 'appbar/Address',
	events: {
		'blur':     null,
		'focus':    'Enter Site URL.',
		'navigate': 'Navigating to new Site.'
	}
});

const update = function(tab) {

	if (tab !== null) {

		this.input.state('');
		this.input.value(tab.url);

		if (tab.url.protocol === 'stealth') {
			this.protocol.attr('title', tab.url.protocol + ':' + tab.url.domain);
		} else {
			this.protocol.attr('title', tab.url.protocol);
		}

		this.protocol.value(tab.url.protocol);
		this.protocol.erase();


		let chunks = [ this.protocol ];
		let domain = URL.toDomain(tab.url);
		let host   = URL.toHost(tab.url);

		if (domain !== null) {

			let port     = tab.url.port     || null;
			let protocol = tab.url.protocol || null;

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

			let port     = tab.url.port     || null;
			let protocol = tab.url.protocol || null;

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

		if (tab.url.path !== '/') {
			tab.url.path.split('/').forEach((chunk) => {
				if (chunk !== '') {
					chunks.push(new Element('li', '/' + chunk));
				}
			});
		}

		if (tab.url.query !== null) {
			chunks.push(new Element('li', '?' + tab.url.query));
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

	this.element = new Element('browser-appbar-address', [
		'<ul><li data-key="protocol" data-val="stealth"></li></ul>',
		'<input data-key="url" type="text" data-map="URL" placeholder="Enter URL or Keywords" spellcheck="false" value="stealth:blank"/>'
	].join(''));

	this.protocol = this.element.query('[data-key="protocol"]');
	this.input    = this.element.query('[data-key="url"]');
	this.output   = this.element.query('ul');

	this.output.value([
		this.protocol,
		new Element('li', 'blank')
	]);

	this.element.on('contextmenu', (e) => {

		let context = Widget.query('browser-menu-context');
		if (context !== null) {

			let area = this.input.area();
			if (area !== null) {

				context.read((clipped) => {

					let url = URL.parse(clipped);
					if (url.protocol === 'https' || url.protocol === 'http') {

						context.value([{
							label: 'open',
							value: clipped,
						}, {
							label: 'copy',
							value: browser.tab.url.link
						}, {
							label:    'paste',
							value:    clipped,
							callback: (browser, value) => {

								if (isString(value) === true) {

									let url = URL.parse(value.trim());
									if (url.protocol === 'https' || url.protocol === 'http') {

										this.input.state('active');
										this.input.value(url);
										this.input.node.setSelectionRange(0, url.link.length);
										this.input.emit('focus');

									}

								}

							}
						}]);

					} else {

						context.value([{
							label: 'copy',
							value: browser.tab.url.link
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

	this.element.on('key', (key) => {

		if (
			key.name === 'f5'
			|| (key.mods.includes('ctrl') === true && key.name === 'e')
		) {
			this.input.node.setSelectionRange(0, this.input.node.value.length);
			this.input.emit('focus');
		}

	});

	this.input.on('blur', () => {

		let link = this.input.node.value.trim();

		if (link === '') {

			update.call(this, browser.tab);

		} else if (
			link.includes(' ') === true
			&& link.startsWith('stealth:search') === false
		) {

			link = 'stealth:search?keywords=' + encodeURIComponent(link);
			this.input.state('');

		} else if (link.endsWith('://') === true) {

			update.call(this, browser.tab);
			link = '';

		} else if (link === 'stealth:') {

			this.input.state('');
			this.input.value('stealth:blank');
			link = 'stealth:blank';

		} else if (link.startsWith('stealth:') === true || link.includes('://') === true) {

			this.input.state('');

		} else {

			this.input.state('');
			this.input.value('https://' + link);
			link = 'https://' + link;

		}

		if (link !== '') {

			if (browser.tab !== null) {

				if (browser.tab.url.link === link) {
					ASSISTANT.emit('blur');
				} else {
					ASSISTANT.emit('navigate');
				}

			} else {
				ASSISTANT.emit('navigate');
			}

			browser.navigate(link);

		} else {
			ASSISTANT.emit('blur');
		}

	});

	this.input.on('click', (e) => {

		let context = Widget.query('browser-menu-context');
		if (context !== null) {

			if (context.state() === 'active') {
				context.emit('hide');
			}

		}

		e.preventDefault();
		e.stopPropagation();

	});

	this.input.on('focus', () => {

		if (this.input.state() !== 'active') {
			ASSISTANT.emit('focus');
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

			let url    = this.input.value();
			let values = items.map((item) => item.value());
			let before = values.slice(0, index).join('');

			if (url.protocol === 'stealth') {
				before = url.protocol + ':' + before;
			} else if (url.protocol !== null) {
				before = url.protocol + '://' + before;
			}

			let offset = url.link.indexOf(before) + before.length;

			this.input.emit('focus');
			this.input.node.setSelectionRange(offset, offset + values[index].length);

		}


		let context = Widget.query('browser-menu-context');
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


Address.prototype = Object.assign({}, Widget.prototype, {

	value: function(value_or_url) {

		let value = null;

		if (value_or_url === undefined) {
			value = null;
		} else if (value_or_url === null) {
			value = null;
		} else if (isObject(value_or_url) === true) {
			value = value_or_url;
		}

		if (value !== null) {

			if (URL.isURL(value) === true) {

				this.input.emit('focus');
				this.input.value(value.link);
				this.input.emit('blur');

				return true;

			} else {
				return false;
			}

		} else {

			let tmp = URL.parse(this.input.value());
			if (URL.isURL(tmp) === true) {
				return tmp;
			} else {
				return null;
			}

		}

	}

});


export { Address };

