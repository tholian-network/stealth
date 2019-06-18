
import { sort    } from '../settings/peers.mjs';
import { Element } from '../../design/Element.mjs';
import { URL     } from '../../source/parser/URL.mjs';

const global = (typeof window !== 'undefined' ? window : this);
const CACHES = [];
const ELEMENTS = {
	status: {
		cause: Element.query('p[data-key="cause"]'),
		code:  Element.query('code[data-key="code"]'),
		url:   Element.query('code[data-key="url"]')
	},
	peers: {
		output: Element.query('article#peers table tbody')
	}
};

const STATUS = ((search) => {

	let status = {
		code:  null,
		cause: null,
		url:   URL.parse()
	};

	if (search.startsWith('?')) {

		search.substr(1).split('&').map((ch) => ch.split('=')).forEach((ch) => {

			if (ch[0] === 'url') {
				status[ch[0]] = URL.parse(decodeURIComponent(ch.slice(1).join('=')));
			} else {
				status[ch[0]] = ch[1];
			}

		});

	}

	return status;

})(document.location.search);

const listen = (browser, callback) => {

	let output = ELEMENTS.peers.output || null;
	if (output !== null) {

		output.on('click', (e) => {

			let target = e.target;
			let type   = target.tagName.toLowerCase();

			if (type === 'button') {

				let button  = Element.from(target, null, false);
				let action  = button.attr('data-action');
				let dataset = button.parent('tr');

				if (action !== null) {

					button.state('disabled');
					button.state('busy');

					callback(action, {
						'domain': dataset.query('*[data-key="domain"]').value() || null
					}, (result) => {

						button.state('enabled');
						button.state(result === true ? '' : 'error');

					});

				}

			}

		});

	}

};

const render_time = (time) => {

	if (time !== null) {

		let date    = new Date(time);
		let str     = '';
		let year    = '' + date.getFullYear();
		let month   = '' + (date.getMonth() + 1);
		let day     = '' + date.getDay();
		let hours   = '' + date.getHours();
		let minutes = '' + date.getMinutes();

		if (month.length === 1)   month   = '0' + month;
		if (day.length === 1)     day     = '0' + day;
		if (hours.length === 1)   hours   = '0' + hours;
		if (minutes.length === 1) minutes = '0' + minutes;

		str += year + '-' + month + '-' + day;
		str += ' ';
		str += hours + ':' + minutes;

		return str;

	} else {

		return '(not available)';

	}

};

const render = (peer, actions) => `
<tr>
	<td data-key="domain">${peer.domain}</td>
	<td><button data-key="connection" data-val="${peer.connection}" disabled></button></td>
	<td data-key="cache">${render_time(peer.cache.payload.time)}</td>
	<td>${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}</td>
</tr>
`;

const update = () => {

	let element = Element.query('article#peers table tbody');
	if (element !== null) {

		element.value(CACHES.sort(sort).map((peer) => {

			if (peer.cache.payload.time !== null) {
				return render(peer, [ 'request', 'download' ]);
			} else if (peer.connection !== 'peer') {
				return render(peer, [ 'request' ]);
			} else {
				return render(peer, []);
			}

		}));

	}

};



let browser = global.parent.BROWSER || global.BROWSER || null;
if (browser !== null) {

	let service = browser.client.services.peer || null;
	if (service !== null && browser.settings.peers.length > 0) {

		browser.settings.peers.forEach((peer) => {

			service.proxy({
				domain:  peer.domain,
				headers: {
					service: 'cache',
					method:  'info'
				},
				payload: STATUS.url
			}, (info) => {

				if (info === null) {
					info = {
						headers: {
							size: null,
							time: null
						},
						payload: {
							size: null,
							time: null
						}
					};
				}

				CACHES.push({
					domain:     peer.domain,
					connection: peer.connection,
					cache:      info
				});

				update();

			});

		});

	} else {
		Element.query('#peers').erase();
	}


	let url = ELEMENTS.status.url || null;
	if (url !== null) {
		url.value(URL.render(STATUS.url));
	}

	let cause = ELEMENTS.status.cause || null;
	if (cause !== null) {

		if (STATUS.cause !== null) {

			cause.forEach((block) => {

				let value = block.value();
				if (value !== STATUS.cause) {
					block.erase();
				}

			});

		} else {
			cause.forEach((block) => block.erase());
		}

	}

	listen(browser, (action, data, done) => {

		let service = browser.client.services.peer || null;
		if (service !== null) {

			if (action === 'request') {

				// TODO
				// -> peer.request( data.domain, URL )
				// -> then peer.proxy (data.domain, cache.read)
				// -> then cache.save(response)

				console.log('request', data);

			} else if (action === 'download') {

				// TODO
				// -> peer.proxy( data.domain, cache.read )
				// -> then cache.save(response)

				console.log('download', data);

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});

}


