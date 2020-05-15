
import { sort            } from '../settings/peers.mjs';
import { Element, access } from '../../internal/index.mjs';
import { ENVIRONMENT     } from '../../source/ENVIRONMENT.mjs';
import { URL             } from '../../source/parser/URL.mjs';



const CACHES   = [];
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



let browser = access('browser');
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
				payload: ENVIRONMENT.flags.url
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
		url.value(URL.render(ENVIRONMENT.flags.url));
	}

	let cause = ELEMENTS.status.cause || null;
	if (cause !== null) {

		if (ENVIRONMENT.flags.cause !== null) {

			cause.forEach((block) => {

				let value = block.value();
				if (value !== ENVIRONMENT.flags.cause) {
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

				service.proxy({
					domain:  data.domain,
					headers: {
						service: 'session',
						method:  'request'
					},
					payload: ENVIRONMENT.flags.url
				}, (response) => {

					if (response !== null) {

						let service = browser.client.services.cache || null;
						if (service !== null) {

							service.save({
								domain:    ENVIRONMENT.flags.url.domain    || null,
								host:      ENVIRONMENT.flags.url.host      || null,
								subdomain: ENVIRONMENT.flags.url.subdomain || null,
								path:      ENVIRONMENT.flags.url.path      || null,
								headers:   response.headers || null,
								payload:   response.payload || null
							}, (result) => {
								done(result);
							});

						} else {
							done(false);
						}

					} else {
						done(false);
					}

				});

			} else if (action === 'download') {

				service.proxy({
					domain:  data.domain,
					headers: {
						service: 'cache',
						method:  'read'
					},
					payload: ENVIRONMENT.flags.url
				}, (response) => {

					if (response !== null) {

						let service = browser.client.services.cache || null;
						if (service !== null) {

							service.save({
								domain:    ENVIRONMENT.flags.url.domain    || null,
								host:      ENVIRONMENT.flags.url.host      || null,
								subdomain: ENVIRONMENT.flags.url.subdomain || null,
								path:      ENVIRONMENT.flags.url.path      || null,
								headers:   response.headers || null,
								payload:   response.payload || null
							}, (result) => {
								done(result);
							});

						} else {
							done(false);
						}

					} else {
						done(false);
					}

				});

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});

}

