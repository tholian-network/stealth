
import { Element } from '../Element.mjs';



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

			chunks.push(Element.from('li', domain));

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

			chunks.push(Element.from('li', host));

		}

		let path = tab.ref.path || '/';
		if (path !== '/') {
			path.split('/').forEach((ch) => {
				if (ch !== '') {
					chunks.push(Element.from('li', '/' + ch));
				}
			});
		}

		let query = tab.ref.query || null;
		if (query !== null) {
			chunks.push(Element.from('li', '?' + query));
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



const Address = function(browser) {

	this.element  = Element.from('browser-address', TEMPLATE);
	this.protocol = this.element.query('[data-key="protocol"]');
	this.input    = this.element.query('input');
	this.output   = this.element.query('ul');


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

		let target = e.target;
		let type   = target.tagName.toLowerCase();
		if (type === 'li' && target !== this.protocol.element) {

			let ref    = this.input.value();
			let url    = ref.url;
			let chunks = Array.from(this.output.element.querySelectorAll('li')).slice(1);
			let chunk  = chunks.find((ch) => ch === target);
			let c      = chunks.indexOf(chunk);

			let before = chunks.slice(0, c).map((ch) => ch.innerHTML).join('');
			if (ref.protocol === 'stealth') {
				before = ref.protocol + ':' + before;
			} else if (ref.protocol !== null) {
				before = ref.protocol + '://' + before;
			}

			let offset = url.indexOf(before) + before.length;
			let select = chunk.innerHTML;

			this.input.state('active');
			this.input.element.setSelectionRange(offset, offset + select.length);
			this.input.emit('focus');

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

