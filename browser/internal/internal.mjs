
import { URL } from '../source/parser/URL.mjs';


export const BROWSER = (function(global) {

	let parent = global.parent || null;
	if (parent !== null) {

		let browser = parent.browser || null;
		if (browser !== null) {
			return browser;
		}

	}

	let browser = global.browser || null;
	if (browser !== null) {
		return browser;
	}

	return null;

})(window);


export const REFERENCE = (function(search) {

	let url = null;

	if (search.startsWith('?')) {

		search.substr(1).split('&').map(t => t.split('=')).forEach(chunk => {

			if (chunk[0] === 'url') {
				url = decodeURIComponent(chunk[1]);
			}

		});

	}

	return URL.parse(url);

})(document.location.search);



const _set = function(object, path, value) {

	let num_int = parseInt(value, 10);
	if (Number.isNaN(num_int) === false && (num_int).toString() === value) {
		value = num_int;
	}

	let num_float = parseFloat(value);
	if (Number.isNaN(num_float) === false && (num_float).toString() === value) {
		value = num_float;
	}

	if (value === 'true')   value = true;
	if (value === 'false')  value = false;
	if (value === '(none)') value = null;
	if (value === 'null')   value = null;
	if (value === '')       value = null;


	if (path.includes('.')) {

		let tmp     = path.split('.');
		let pointer = object;

		for (let t = 0, tl = tmp.length; t < tl; t++) {

			let key = tmp[t];
			if (t < tl - 1) {

				if (pointer[key] === undefined) {
					pointer[key] = {};
				}

				pointer = pointer[key];

			} else {
				pointer[key] = value;
			}

		}

	} else {

		object[path] = value;

	}

	return object;

};

const _get_data = (element) => {

	let parent = element.parentNode;
	if (parent.tagName.toLowerCase() === 'td') {
		parent = element.parentNode.parentNode;
	}

	if (parent.tagName.toLowerCase() === 'tr') {

		let data = {};

		Array.from(parent.querySelectorAll('*[data-key]')).map(element => {

			let key = element.getAttribute('data-key');
			let val = element.getAttribute('data-val');
			if (key !== null && val !== null) {

				return {
					key: key,
					val: (val + '').trim()
				};

			} else if (key !== null) {

				let type = element.tagName.toLowerCase();
				if (type === 'input') {
					return {
						key: key,
						val: (element.value).trim()
					};
				} else {
					return {
						key: key,
						val: (element.innerHTML).trim()
					};
				}

			}

			return null;

		}).filter(e => e !== null).forEach(e => {
			_set(data, e.key, e.val);
		});

		if (Object.keys(data).length > 0) {
			return data;
		}

	}

	return null;

};


const _render_host = (host) => `
<tr>
	<td data-key="domain">${host.domain}</td>
	<td data-key="ipv4">${(host.ipv4 !== null ? host.ipv4 : '(none)')}</td>
	<td data-key="ipv6">${(host.ipv6 !== null ? host.ipv6 : '(none)')}</td>
	<td><button data-action="refresh"></button></td>
</tr>
`;

const _render_host_edit = (host) => `
<tr>
	<td data-key="domain">${host.domain}</td>
	<td><input data-key="ipv4" type="text" placeholder="IPv4" value="${(host.ipv4 !== null ? host.ipv4 : '')}"></td>
	<td><input data-key="ipv6" type="text" placeholder="IPv6" value="${(host.ipv6 !== null ? host.ipv6 : '')}"></td>
	<td>
		<button data-action="refresh"></button>
		<button data-action="remove"></button>
	</td>
</tr>
`;

const _render_peer = (peer) => `
<tr>
	<td data-key="domain">${peer.domain}</td>
	<td><button data-key="connection" data-val="${peer.connection}" disabled></button></td>
	<td><button data-key="status" data-val="${peer.status}" disabled></button></td>
	<td>
		<button data-action="refresh"></button>
	</td>
</tr>
`;

const _render_peer_edit = (peer) => `
<tr>
	<td data-key="domain">${peer.domain}</td>
	<td><button data-key="connection" data-val="${peer.connection}" disabled></button></td>
	<td><button data-key="status" data-val="${peer.status}" disabled></button></td>
	<td>
		<button data-action="refresh"></button>
		<button data-action="remove"></button>
	</td>
</tr>
`;

const _render_site = (site) => `
<tr>
	<td data-key="domain">${site.domain}</td>
	<td>
		<button data-key="mode.text"  data-val="${site.mode.text  === true ? 'true' : 'false'}" disabled></button>
		<button data-key="mode.image" data-val="${site.mode.image === true ? 'true' : 'false'}" disabled></button>
		<button data-key="mode.audio" data-val="${site.mode.audio === true ? 'true' : 'false'}" disabled></button>
		<button data-key="mode.video" data-val="${site.mode.video === true ? 'true' : 'false'}" disabled></button>
		<button data-key="mode.other" data-val="${site.mode.other === true ? 'true' : 'false'}" disabled></button>
	</td>
	<td>
		<button data-action="refresh"></button>
		<button data-action="remove"></button>
	</td>
</tr>
`;

const _render_site_edit = (site) => `
<tr>
	<td data-key="domain">${site.domain}</td>
	<td>
		<button data-key="mode.text"  data-val="${site.mode.text  === true ? 'true' : 'false'}" title="Allow/Disallow Text"></button>
		<button data-key="mode.image" data-val="${site.mode.image === true ? 'true' : 'false'}" title="Allow/Disallow Image"></button>
		<button data-key="mode.audio" data-val="${site.mode.audio === true ? 'true' : 'false'}" title="Allow/Disallow Audio"></button>
		<button data-key="mode.video" data-val="${site.mode.video === true ? 'true' : 'false'}" title="Allow/Disallow Video"></button>
		<button data-key="mode.other" data-val="${site.mode.other === true ? 'true' : 'false'}" title="Allow/Disallow Other"></button>
	</td>
	<td>
		<button data-action="remove"></button>
	</td>
</tr>
`;



export const render = function(type, data, edit) {

	type = typeof type === 'string' ? type : null;
	data = typeof data === 'object' ? data : null;
	edit = edit === true;


	if (type !== null) {

		if (type === 'host') {
			return (edit === true ? _render_host_edit(data) : _render_host(data));
		} else if (type === 'peer') {
			return (edit === true ? _render_peer_edit(data) : _render_peer(data));
		} else if (type === 'site') {
			return (edit === true ? _render_site_edit(data) : _render_site(data));
		}

	}

	return null;

};

export const listen = function(element, callback) {

	element  = element !== undefined          ? element  : null;
	callback = typeof callback === 'function' ? callback : null;


	if (element !== null && callback !== null) {

		element.addEventListener('click', (e) => {

			let element  = e.target;
			let tagname  = element.tagName.toLowerCase();
			let action   = element.getAttribute('data-action') || null;
			let disabled = element.getAttribute('disabled') !== null;

			if (action !== null) {

				let data = _get_data(element);
				if (data !== null) {

					element.className = 'busy';

					callback(action, data, function(result) {

						if (result === true) {
							element.className = '';
						} else {
							element.className = 'error';
						}

					});

				}

			} else if (tagname === 'button' && disabled === false) {

				let val = element.getAttribute('data-val');
				if (val === 'true' || val === 'false') {
					element.setAttribute('data-val', val === 'true' ? 'false' : 'true');
				}

			}

		});

	}

};

export const init = function(elements, callback) {

	elements = Array.isArray(elements)        ? elements : [];
	callback = typeof callback === 'function' ? callback : null;


	let result = true;

	if (elements.length > 0) {

		elements.forEach(element => {

			if (element === null) {
				result = false;
			}

		});

	}

	if (callback !== null) {
		callback(BROWSER, result);
	} else {
		return result;
	}

};

