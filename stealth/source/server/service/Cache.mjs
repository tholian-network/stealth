
import fs   from 'fs';
import path from 'path';

import { Buffer, Emitter, isArray, isBoolean, isBuffer, isFunction, isObject, isString } from '../../../extern/base.mjs';
import { DATETIME                                                                      } from '../../../source/parser/DATETIME.mjs';
import { URL                                                                           } from '../../../source/parser/URL.mjs';



const toDatetime = function(payload) {

	let datetime = DATETIME.parse(new Date());

	if (
		isObject(payload) === true
		&& isObject(payload.headers) === true
		&& DATETIME.isDATETIME(payload.headers['last-modified']) === true
	) {

		let last_modified = DATETIME.parse(DATETIME.render(payload.headers['last-modified']));
		if (last_modified !== null) {
			datetime = last_modified;
		}

	}

	return datetime;

};

const toDomain = function(payload) {

	let domain = null;

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host) === true) {
			domain = payload.host;
		}

	}

	return domain;

};

const toMIME = function(payload) {

	let mime   = { ext: 'bin', type: 'other', binary: true, format: 'application/octet-stream' };
	let domain = toDomain(payload);
	let path   = toPath(payload);

	if (domain !== null && path !== null) {
		mime = URL.parse('https://' + domain + path).mime;
	}

	return mime;

};

const toPath = function(payload) {

	let path = null;

	if (isObject(payload) === true) {

		if (isString(payload.path) === true) {

			if (payload.path.endsWith('/') === true) {
				path = payload.path + 'index.html';
			} else {
				path = payload.path;
			}

		}

	}

	return path;

};

const toQuery = function(payload) {

	let query = '';

	if (isObject(payload) === true) {

		if (isString(payload.query) === true) {
			query = payload.query;
		}

	}

	return query;

};

const info = function(url, datetime) {

	datetime = DATETIME.isDATETIME(datetime) ? datetime : null;


	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null && stat.isFile() === true) {

		if (datetime === null) {
			datetime = DATETIME.parse(stat.mtime);
		}

		return {
			size: stat.size || 0,
			date: datetime !== null ? DATETIME.toDate(datetime) : null,
			time: datetime !== null ? DATETIME.toTime(datetime) : null
		};

	}


	return null;

};

const mkdir = function(url) {

	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {

		try {
			fs.mkdirSync(path.resolve(url), {
				recursive: true
			});
			stat = fs.lstatSync(path.resolve(url));
		} catch (err) {
			stat = null;
		}

	}

	if (stat !== null && stat.isDirectory() === true) {
		return true;
	}


	return false;

};

const read = function(url, json) {

	json = isBoolean(json) ? json : false;


	let buffer = null;

	try {
		buffer = fs.readFileSync(path.resolve(url));
	} catch (err) {
		buffer = null;
	}

	if (buffer !== null && json === true) {

		try {
			buffer = JSON.parse(buffer.toString('utf8'));
		} catch (err) {
			buffer = {};
		}

	}

	return buffer;

};

const readdir = function(url) {

	let result = [];

	try {
		result = fs.readdirSync(path.resolve(url));
	} catch (err) {
		result = [];
	}

	return result;

};

const remove = function(url) {

	let result = false;

	if (info(url) !== null) {

		try {
			fs.unlinkSync(path.resolve(url));
			result = true;
		} catch (err) {
			result = false;
		}

	}

	return result;

};

const save = function(url, buffer) {

	mkdir(path.dirname(path.resolve(url)));


	let result = false;

	try {
		fs.writeFileSync(path.resolve(url), buffer);
		result = true;
	} catch (err) {
		result = false;
	}

	return result;

};

const walk = function(root, folder, result) {

	folder = isString(folder) ? folder : '';
	result = isArray(result)  ? result : [];


	readdir(root + '/' + folder).forEach((file_or_folder) => {

		let stat = null;

		try {
			stat = fs.lstatSync(path.resolve(root + folder + '/' + file_or_folder));
		} catch (err) {
			stat = null;
		}

		if (stat !== null) {

			if (stat.isDirectory() === true) {
				walk(root, folder + '/' + file_or_folder, result);
			} else if (stat.isFile() === true) {
				result.push(folder + '/' + file_or_folder);
			}
		}

	});


	return result;

};



const Cache = function(stealth) {

	this.stealth = stealth;

	this.__state = {
		history: {}
	};


	Emitter.call(this);


	setTimeout(() => {

		readdir(this.stealth.settings.profile + '/cache/headers').forEach((raw) => {

			let datetime = DATETIME.parse(raw);
			if (DATETIME.isDATETIME(datetime) === true) {

				let urls = walk(this.stealth.settings.profile + '/cache/headers/' + DATETIME.render(datetime));
				if (urls.length > 0) {

					urls.map((u) => u.substr(1)).forEach((url) => {

						if (isArray(this.__state.history[url]) === true) {

							let latest = this.__state.history[url][this.__state.history[url].length - 1];

							if (DATETIME.compare(latest, datetime) < 0) {
								this.__state.history[url].unshift(datetime);
							} else {
								this.__state.history[url].push(datetime);
							}

						} else {

							this.__state.history[url] = [ datetime ];

						}

					});

				}

			}

		});

	}, 100);

};


Cache.toCache = function(payload) {

	if (isObject(payload) === true) {

		let domain = null;

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host) === true) {
			domain = payload.host;
		}


		let cache_headers = null;

		if (isBuffer(payload.headers) === true) {
			cache_headers = payload.headers;
		} else if (isObject(payload.headers) === true) {

			if (payload.headers.type === 'Buffer') {
				cache_headers = Buffer.from(payload.headers.data);
			} else {
				cache_headers = Buffer.from(JSON.stringify(payload.headers, null, '\t'), 'utf8');
			}

		}

		let cache_payload = null;

		if (isBuffer(payload.payload) === true) {
			cache_payload = payload.payload;
		} else if (isObject(payload.payload) === true) {

			if (payload.payload.type === 'Buffer') {
				cache_payload = Buffer.from(payload.payload.data);
			} else {
				cache_payload = Buffer.from(JSON.stringify(payload.payload, null, '\t'), 'utf8');
			}

		}


		if (domain !== null && cache_headers !== null && cache_payload !== null) {

			return {
				headers: cache_headers,
				payload: cache_payload
			};

		}

	}


	return null;

};


Cache.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Cache Service',
			'data': data
		};

	},

	info: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let response = null;

		let domain = toDomain(payload);
		let path   = toPath(payload);
		let query  = toQuery(payload);

		if (domain !== null && path !== null) {

			let datetime = null;
			let history  = this.__state.history[domain + path + (query !== '' ? ('?' + query) : '')] || null;

			if (history !== null) {
				datetime = history[0];
			}

			if (datetime !== null) {

				let cache_headers = info(this.stealth.settings.profile + '/cache/headers/' + DATETIME.render(datetime) + '/' + domain + path + (query !== '' ? ('?' + query) : ''), datetime);
				let cache_payload = info(this.stealth.settings.profile + '/cache/payload/' + DATETIME.render(datetime) + '/' + domain + path + (query !== '' ? ('?' + query) : ''), datetime);

				if (cache_headers !== null && cache_payload !== null) {
					response = {
						headers: cache_headers,
						payload: cache_payload
					};
				}

			}


		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'info'
				},
				payload: response
			});

		}

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let response = null;

		let domain = toDomain(payload);
		let mime   = toMIME(payload);
		let path   = toPath(payload);
		let query  = toQuery(payload);

		if (domain !== null && mime !== null && path !== null) {

			let datetime = null;
			let history  = this.__state.history[domain + path + (query !== '' ? ('?' + query) : '')] || null;

			if (history !== null) {
				datetime = history[0];
			}

			if (datetime !== null) {

				let cache_headers = read(this.stealth.settings.profile + '/cache/headers/' + DATETIME.render(datetime) + '/' + domain + path + (query !== '' ? ('?' + query) : ''), true);
				let cache_payload = read(this.stealth.settings.profile + '/cache/payload/' + DATETIME.render(datetime) + '/' + domain + path + (query !== '' ? ('?' + query) : ''), false);

				if (cache_headers !== null && cache_payload !== null) {

					Object.assign(cache_headers, {
						'content-type':   mime.format,
						'content-length': Buffer.byteLength(cache_payload),
						'last-modified':  datetime
					});

					response = {
						headers: cache_headers,
						payload: cache_payload
					};

				}

			}

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'read'
				},
				payload: response
			});

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let result = false;

		let domain = toDomain(payload);
		let path   = toPath(payload);
		let query  = toQuery(payload);

		if (domain !== null && path !== null) {

			let history = this.__state.history[domain + path + (query !== '' ? ('?' + query) : '')] || null;
			if (history !== null) {

				history.forEach((datetime) => {

					let result_headers = remove(this.stealth.settings.profile + '/cache/headers/' + DATETIME.render(datetime) + '/' + domain + path + (query !== '' ? ('?' + query) : ''));
					let result_payload = remove(this.stealth.settings.profile + '/cache/payload/' + DATETIME.render(datetime) + '/' + domain + path + (query !== '' ? ('?' + query) : ''));

					if (result_headers === true && result_payload === true) {
						result = true;
					}

				});

				delete this.__state.history[domain + path + (query !== '' ? ('?' + query) : '')];

			}

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'remove'
				},
				payload: result
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let result = false;
		let cache  = Cache.toCache(payload);

		let domain = toDomain(payload);
		let path   = toPath(payload);
		let query  = toQuery(payload);

		if (domain !== null && path !== null) {

			if (cache !== null) {

				let datetime       = toDatetime(payload);
				let result_headers = save(this.stealth.settings.profile + '/cache/headers/' + DATETIME.render(datetime) + '/' + domain + path + (query !== '' ? ('?' + query) : ''), cache.headers);
				let result_payload = save(this.stealth.settings.profile + '/cache/payload/' + DATETIME.render(datetime) + '/' + domain + path + (query !== '' ? ('?' + query) : ''), cache.payload);

				if (result_headers === true && result_payload === true) {

					let history = this.__state.history[domain + path + (query !== '' ? ('?' + query) : '')] || null;
					if (history !== null) {
						history.unshift(datetime);
					} else {
						this.__state.history[domain + path + (query !== '' ? ('?' + query) : '')] = [ datetime ];
					}

					result = true;

				}

			}

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'save'
				},
				payload: result
			});

		}

	}

});


export { Cache };

