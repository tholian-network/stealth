
import fs   from 'fs';
import path from 'path';

import { Buffer, Emitter, isBoolean, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { URL                                                                  } from '../parser/URL.mjs';



const toDomain = function(payload) {

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

	if (isString(payload.path) === true) {

		if (payload.path.endsWith('/')) {
			path = payload.path + 'index.html';
		} else {
			path = payload.path;
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



const Stash = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Stash.toStash = function(payload) {

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

		let stash_headers = null;

		if (isBuffer(payload.headers) === true) {
			stash_headers = payload.headers;
		} else if (isObject(payload.headers) === true) {

			if (payload.headers.type === 'Buffer') {
				stash_headers = Buffer.from(payload.headers.data);
			} else {
				stash_headers = Buffer.from(JSON.stringify(payload.headers, null, '\t'), 'utf8');
			}

		}

		let stash_payload = null;

		if (isBuffer(payload.payload) === true) {
			stash_payload = payload.payload;
		} else if (isObject(payload.payload) === true) {

			if (payload.payload.type === 'Buffer') {
				stash_payload = Buffer.from(payload.payload.data);
			} else {
				stash_payload = Buffer.from(JSON.stringify(payload.payload, null, '\t'), 'utf8');
			}

		}


		if (domain !== null && stash_headers !== null && stash_payload !== null) {

			return {
				headers: stash_headers,
				payload: stash_payload
			};

		}

	}


	return null;

};


Stash.prototype = Object.assign({}, Emitter.prototype, {

	info: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let response = null;

		let domain = toDomain(payload);
		let path   = toPath(payload);

		if (domain !== null && path !== null) {

			let stash_headers = info(this.stealth.settings.profile + '/stash/headers/' + domain + path);
			let stash_payload = info(this.stealth.settings.profile + '/stash/payload/' + domain + path);

			if (stash_headers !== null && stash_payload !== null) {
				response = {
					headers: stash_headers,
					payload: stash_payload
				};
			}

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'stash',
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

			let stash_headers = read(this.stealth.settings.profile + '/stash/headers/' + domain + path, true);
			let stash_payload = read(this.stealth.settings.profile + '/stash/payload/' + domain + path, false);

			if (stash_headers !== null && stash_payload !== null) {

				Object.assign(stash_headers, {
					'content-type':   mime.format,
					'content-length': Buffer.byteLength(stash_payload)
				});

				response = {
					headers: stash_headers,
					payload: stash_payload
				};

			}

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'stash',
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

			let stash_headers = remove(this.stealth.settings.profile + '/stash/headers/' + domain + path);
			let stash_payload = remove(this.stealth.settings.profile + '/stash/payload/' + domain + path);

			if (stash_headers === true && stash_payload === true) {
				result = true;
			}

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'stash',
					event:   'remove'
				},
				payload: result
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let result = false;
		let stash  = Stash.toStash(payload);

		let domain = toDomain(payload);
		let path   = toPath(payload);

		if (domain !== null && path !== null) {

			if (stash !== null) {

				let stash_headers = save(this.stealth.settings.profile + '/stash/headers/' + domain + path, stash.headers);
				let stash_payload = save(this.stealth.settings.profile + '/stash/payload/' + domain + path, stash.payload);

				if (stash_headers === true && stash_payload === true) {
					result = true;
				}

			}

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'stash',
					event:   'save'
				},
				payload: result
			});

		}

	}

});


export { Stash };

