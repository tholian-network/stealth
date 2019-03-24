
import { PARAMETERS, REFERENCE, init, insert } from './internal.mjs';



const elements = {
	wizard: document.querySelector('#fix-request'),
	causes: Array.from(document.querySelectorAll('#fix-request *[data-key="cause"]')),
	peers:  document.querySelector('#fix-request-peers tbody')
};

const _append_peer = (peer, info, actions) => {

	let dummy = document.createElement('table');
	dummy.innerHTML = _render_peer(peer, info, actions);

	let frag = dummy.querySelector('tr');
	if (frag !== null) {
		frag.parentNode.removeChild(frag);
		elements.peers.appendChild(frag);
	}

};

const _render_time = function(time) {

	time = typeof time === 'string' ? time : null;


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


const _render_peer = (peer, info, actions) => `
<tr>
	<td data-key="domain">${peer.domain}</td>
	<td><button data-key="connection" data-val="${peer.connection}" disabled></button></td>
	<td>${info !== null ? _render_time(info.headers.time) : '(not available)'}</td>
	<td>
		${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}
	</td>
</tr>
`;

const _sort_by_name = (a, b) => {

	let a_domain = a.domain;
	let b_domain = b.domain;
	if (a_domain > b_domain) return  1;
	if (b_domain > a_domain) return -1;


	return 0;

};



init([
	elements.wizard,
	elements.peers
], (browser, result) => {

	if (result === true) {

		if (REFERENCE.domain !== null) {

			if (Object.keys(PARAMETERS).length > 0) {

				insert(elements.wizard, {
					url:  PARAMETERS.url  || null,
					code: PARAMETERS.code || null
				});

			}


			let cause = PARAMETERS.cause || '';
			if (cause !== '') {

				elements.causes.forEach((element) => {

					let val = element.getAttribute('data-val');
					if (val === cause) {
						element.className = 'active';
					} else {
						element.className = '';
					}

				});

			}


			browser.client.services.settings.read({
				peers: true
			}, (settings) => {

				settings.peers.sort(_sort_by_name).forEach((peer, p) => {

					setTimeout(() => {

						browser.client.services.peer.proxy({
							domain: peer.domain,
							headers: {
								service: 'cache',
								method:  'info'
							},
							payload: REFERENCE
						}, (info) => {

							if (info !== null) {
								_append_peer(peer, info, [ 'download' ]);
							} else {
								_append_peer(peer, null, []);
							}

						});

					}, p * 100);

				});

			});

		}

	}

});

