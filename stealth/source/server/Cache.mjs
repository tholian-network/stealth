
import fs   from 'fs';
import path from 'path';

import { Buffer, Emitter, isBoolean, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { URL                                                                  } from '../parser/URL.mjs';



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

const info = function(url) {

	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null && stat.isFile() === true) {

		return {
			size: stat.size || 0,
			time: (stat.mtime).toISOString()
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

const remove = function(url) {

	let result = false;

	if (info(url) !== null) {

		try {
			fs.unlinkSync(path.resolve(url));
			result = true;
		} catch (err) {
			result = false;
		}

	} else {

		result = true;

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



const Cache = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

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

		if (domain !== null && path !== null) {

			let cache_headers = info(this.stealth.settings.profile + '/cache/headers/' + domain + path);
			let cache_payload = info(this.stealth.settings.profile + '/cache/payload/' + domain + path);

			if (cache_headers !== null && cache_payload !== null) {
				response = {
					headers: cache_headers,
					payload: cache_payload
				};
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

		if (domain !== null && mime !== null && path !== null) {

			let cache_headers = read(this.stealth.settings.profile + '/cache/headers/' + domain + path, true);
			let cache_payload = read(this.stealth.settings.profile + '/cache/payload/' + domain + path, false);

			if (cache_headers !== null && cache_payload !== null) {

				Object.assign(cache_headers, {
					'content-type':   mime.format,
					'content-length': Buffer.byteLength(cache_payload)
				});

				response = {
					headers: cache_headers,
					payload: cache_payload
				};

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

		if (domain !== null && path !== null) {

			let cache_headers = remove(this.stealth.settings.profile + '/cache/headers/' + domain + path);
			let cache_payload = remove(this.stealth.settings.profile + '/cache/payload/' + domain + path);

			if (cache_headers === true && cache_payload === true) {
				result = true;
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

		if (domain !== null && path !== null) {

			if (cache !== null) {

				let cache_headers = save(this.stealth.settings.profile + '/cache/headers/' + domain + path, cache.headers);
				let cache_payload = save(this.stealth.settings.profile + '/cache/payload/' + domain + path, cache.payload);

				if (cache_headers === true && cache_payload === true) {
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

