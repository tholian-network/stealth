
import { isArray, isFunction, isObject, isString } from '../source/POLYFILLS.mjs';

import { Browser } from '../source/Browser.mjs';
import { IP      } from '../source/parser/IP.mjs';
import { URL     } from '../source/parser/URL.mjs';



export const HOST = (function(global) {

	let host = 'localhost';

	let tmp = global.location.host || '';
	if (tmp.includes(':')) {

		let tmp1 = tmp.split(':')[0];
		if (tmp1 !== 'localhost') {
			host = tmp1;
		}

	} else if (tmp !== '') {
		host = tmp;
	}

	return host;

})(window);

export const PORT = (function(global) {

	let port = 65432;

	let tmp = global.location.host || '';
	if (tmp.includes(':')) {

		let tmp2 = parseInt(tmp.split(':').pop(), 10);
		if (Number.isNaN(tmp2) === false) {
			port = tmp2;
		}

	}

	return port;

})(window);

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

export const PARAMETERS = (function(search) {

	let data = {};

	if (search.startsWith('?')) {

		search.substr(1).split('&').map((t) => t.split('=')).forEach((chunk) => {

			let key = (chunk[0]).trim();
			let val = decodeURIComponent(chunk[1]).trim();

			let num_int = parseInt(val, 10);
			if (Number.isNaN(num_int) === false && (num_int).toString() === val) {
				val = num_int;
			}

			let num_float = parseFloat(val);
			if (Number.isNaN(num_float) === false && (num_float).toString() === val) {
				val = num_float;
			}

			if (val === 'true')      val = true;
			if (val === 'false')     val = false;
			if (val === '(none)')    val = null;
			if (val === 'null')      val = null;
			if (val === 'undefined') val = null;
			if (val === '')          val = null;
			if (val === 'Infinity')  val = null;
			if (val === '-Infinity') val = null;
			if (val === '+Infinity') val = null;
			if (val === 'NaN')       val = null;
			if (val === '-NaN')      val = null;
			if (val === '+NaN')      val = null;


			data[key] = val;

		});

	}

	return data;

})(document.location.search);

export const REFERENCE = (function(search) {

	let url = null;

	if (search.startsWith('?')) {

		search.substr(1).split('&').map((t) => t.split('=')).forEach((chunk) => {

			if (chunk[0] === 'url') {
				url = decodeURIComponent(chunk[1]);
			}

		});

	}

	return URL.parse(url);

})(document.location.search);



const _get = (object, path) => {

	let value = undefined;

	if (path.includes('.')) {

		let tmp     = path.split('.');
		let pointer = object;

		for (let t = 0, tl = tmp.length; t < tl; t++) {

			let key = tmp[t];
			if (t < tl - 1) {

				if (pointer[key] !== undefined) {
					pointer = pointer[key];
				} else {
					break;
				}

			} else {
				value = pointer[key];
			}

		}

	} else {

		value = object[path];

	}

	return value;

};

const _set = (object, path, value) => {

	let num_int = parseInt(value, 10);
	if (Number.isNaN(num_int) === false && (num_int).toString() === value) {
		value = num_int;
	}

	let num_float = parseFloat(value);
	if (Number.isNaN(num_float) === false && (num_float).toString() === value) {
		value = num_float;
	}

	if (value === 'true')      value = true;
	if (value === 'false')     value = false;
	if (value === '(none)')    value = null;
	if (value === 'null')      value = null;
	if (value === 'undefined') value = null;
	if (value === '')          value = null;
	if (value === 'Infinity')  value = null;
	if (value === '-Infinity') value = null;
	if (value === '+Infinity') value = null;
	if (value === 'NaN')       value = null;
	if (value === '-NaN')      value = null;
	if (value === '+NaN')      value = null;


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

const _extract_data = (element) => {

	let parent = element.parentNode;
	if (parent.tagName.toLowerCase() === 'td') {
		parent = element.parentNode.parentNode;
	}

	if (parent.tagName.toLowerCase() === 'tr' || parent.tagName.toLowerCase() === 'div') {

		let data = {};

		Array.from(parent.querySelectorAll('*[data-key]')).map((element) => {

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

					let map = element.getAttribute('data-map');
					let val = (element.value).trim();
					if (map === 'IP') {
						return {
							key: key,
							val: IP.parse(val)
						};
					} else if (map === 'URL') {
						return {
							key: key,
							val: URL.parse(val)
						};
					} else {
						return {
							key: key,
							val: val
						};
					}

				} else if (type === 'textarea') {

					let map = element.getAttribute('data-map');
					let val = (element.value).trim();

					if (map === 'IP') {

						let raw = val.split('\n').map((v) => v.trim()).filter((v) => v !== '');

						return {
							key: key,
							val: raw.map((v) => IP.parse(v)).filter((ip) => ip.type !== null)
						};

					} else if (map === 'URL') {

						let raw = val.split('\n').map((v) => v.trim()).filter((v) => v !== '');

						return {
							key: key,
							val: raw.map((v) => URL.parse(v)).filter((ref) => (ref.domain !== null || ref.host !== null))
						};

					} else {
						return {
							key: key,
							val: val
						};
					}

				} else {
					return {
						key: key,
						val: (element.innerHTML).trim()
					};
				}

			}

			return null;

		}).filter((e) => e !== null).forEach((e) => {
			_set(data, e.key, e.val);
		});

		if (Object.keys(data).length > 0) {
			return data;
		}

	}

	return null;

};

const _insert_data = (element, data) => {

	Array.from(element.querySelectorAll('*[data-key]')).map((element) => {

		let key = element.getAttribute('data-key');
		let val = element.getAttribute('data-val');

		if (key !== null && val !== null) {

			return {
				element: element,
				key:     key,
				val:     val
			};

		} else if (key !== null) {

			return {
				element: element,
				key:     key,
				val:     null
			};

		} else {
			return null;
		}

	}).filter((e) => e !== null).forEach((e) => {

		let value = _get(data, e.key);
		if (value !== undefined) {

			if (e.key !== null && e.val !== null) {
				e.element.setAttribute('data-val', '' + value);
			} else if (e.key !== null) {

				let type = e.element.tagName.toLowerCase();
				if (type === 'input') {
					e.element.value = '' + (value !== null ? value : '');
				} else {
					e.element.innerHTML = '' + (value !== null ? value : '');
				}

			}

		}

	});

};

const _reset_data = (element) => {

	let parent = element;
	if (parent.tagName.toLowerCase() === 'td') {
		parent = element.parentNode;
	} else if (parent.tagName.toLowerCase() === 'tfoot') {
		parent = parent.querySelector('tr');
	}

	if (parent.tagName.toLowerCase() === 'tr') {

		Array.from(parent.querySelectorAll('*[data-key]')).forEach((element) => {

			let type = element.tagName.toLowerCase();
			if (type === 'button') {

				let val = element.getAttribute('data-val');
				if (val === 'true' || val === 'false') {
					element.setAttribute('data-val', 'false');
				} else if (val !== null) {
					element.setAttribute('data-val', 'unknown');
				}

			} else if (type === 'input') {
				element.value = '';
			} else {
				element.innerHTML = '';
			}

		});

		return true;

	}

	return false;

};



const _render_filter = (filter, actions) => `
<tr>
	<td data-key="domain">${filter.domain}</td>
	<td data-key="filter.prefix">${filter.filter.prefix !== null ? filter.filter.prefix : '(none)'}</td>
	<td data-key="filter.midfix">${filter.filter.midfix !== null ? filter.filter.midfix : '(none)'}</td>
	<td data-key="filter.suffix">${filter.filter.suffix !== null ? filter.filter.suffix : '(none)'}</td>
	<td>
		${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}
	</td>
</tr>
`;

const _render_host = (host, actions) => `
<tr>
	<td data-key="domain">${host.domain}</td>
	${actions.includes('save') === true ? '<td><textarea data-key="hosts" data-map="IP" placeholder="One IPv4/IPv6 per line">' + (host.hosts.map((h) => h.ip).join('\n')) + '</textarea></td>' : '<td data-key="hosts">' + (host.hosts.map((h) => h.ip).join('\n')) + '</td>' }
	<td>
		${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}
	</td>
</tr>
`;

const _render_mode = (mode, actions) => `
<tr>
	<td data-key="domain">${mode.domain}</td>
	<td>
		<button data-key="mode.text"  data-val="${mode.mode.text  === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
		<button data-key="mode.image" data-val="${mode.mode.image === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
		<button data-key="mode.audio" data-val="${mode.mode.audio === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
		<button data-key="mode.video" data-val="${mode.mode.video === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
		<button data-key="mode.other" data-val="${mode.mode.other === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
	</td>
	<td>
		${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}
	</td>
</tr>
`;

const _render_peer = (peer, actions) => `
<tr>
	<td data-key="domain">${peer.domain}</td>
	<td><button data-key="connection" data-val="${peer.connection}" disabled></button></td>
	<td><button data-key="status" data-val="${peer.status}" disabled></button></td>
	<td>
		${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}
	</td>
</tr>
`;



export const extract = function(element, callback) {

	element  = element !== undefined ? element  : null;
	callback = isFunction(callback)  ? callback : null;


	if (element !== null && callback !== null) {
		callback(_extract_data(element));
	} else if (element !== null) {
		return _extract_data(element);
	} else if (callback !== null) {
		callback(null);
	} else {
		return null;
	}

};

export const init = function(elements, callback) {

	elements = isArray(elements)    ? elements : [];
	callback = isFunction(callback) ? callback : null;


	let result = true;

	if (elements.length > 0) {

		elements.forEach((element) => {

			if (element === null) {
				result = false;
			}

		});

	}

	if (callback !== null) {


		let browser = BROWSER || null;
		if (browser !== null) {

			callback(browser, result);

		} else {

			browser = new Browser();
			browser.connect(HOST, PORT, (result) => {
				callback(browser, result);
			});

		}

	} else {
		return result;
	}

};

export const insert = function(element, data, callback) {

	element  = element !== undefined ? element  : null;
	data     = isObject(data)        ? data     : null;
	callback = isFunction(callback)  ? callback : null;


	if (element !== null && data !== null && callback !== null) {

		_insert_data(element, data);
		callback(true);

	} else if (element !== null && data !== null) {

		_insert_data(element, data);
		return true;

	} else if (callback !== null) {
		callback(false);
	} else {
		return false;
	}

};

export const listen = function(element, callback) {

	element  = element !== undefined ? element  : null;
	callback = isFunction(callback)  ? callback : null;


	if (element !== null && callback !== null) {

		element.addEventListener('click', (e) => {

			let element  = e.target;
			let tagname  = element.tagName.toLowerCase();
			let action   = element.getAttribute('data-action') || null;
			let disabled = element.getAttribute('disabled') !== null;

			if (action !== null) {

				let data = _extract_data(element);
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

		return true;

	} else if (element !== null) {
		return false;
	} else {
		return false;
	}

};

export const render = function(type, data, actions, callback) {

	type     = isString(type)       ? type     : null;
	data     = isObject(data)       ? data     : null;
	actions  = isArray(actions)     ? actions  : [];
	callback = isFunction(callback) ? callback : null;


	if (type !== null && data !== null && callback !== null) {

		if (type === 'filter') {
			callback(_render_filter(data, actions));
		} else if (type === 'host') {
			callback(_render_host(data, actions));
		} else if (type === 'mode') {
			callback(_render_mode(data, actions));
		} else if (type === 'peer') {
			callback(_render_peer(data, actions));
		} else {
			callback(null);
		}

	} else if (type !== null && data !== null) {

		if (type === 'filter') {
			return _render_filter(data, actions);
		} else if (type === 'host') {
			return _render_host(data, actions);
		} else if (type === 'mode') {
			return _render_mode(data, actions);
		} else if (type === 'peer') {
			return _render_peer(data, actions);
		} else {
			return null;
		}

	} else if (callback !== null) {
		callback(null);
	} else {
		return null;
	}

};

export const reset = function(element, callback) {

	element  = element !== undefined ? element  : null;
	callback = isFunction(callback)  ? callback : null;


	if (element !== null && callback !== null) {

		_reset_data(element);
		callback(true);

	} else if (element !== null) {

		_reset_data(element);
		return true;

	} else if (callback !== null) {
		callback(false);
	} else {
		return false;
	}

};

