
import fs          from 'fs';
import path        from 'path';
import { Buffer  } from 'buffer';

import { isBuffer, isFunction, isObject } from '../POLYFILLS.mjs';

import { Emitter } from '../Emitter.mjs';
import { URL     } from '../parser/URL.mjs';



const info = function(url, callback) {

	callback = isFunction(callback) ? callback : null;


	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}


	if (stat !== null && callback !== null) {

		callback({
			size: stat.size || 0,
			time: (stat.mtime).toISOString()
		});

	} else if (stat !== null) {

		return {
			size: stat.size || 0,
			time: (stat.mtime).toISOString()
		};

	} else if (callback !== null) {
		callback(null);
	} else {
		return null;
	}

};

const mkdir = function(url, callback) {

	callback = isFunction(callback) ? callback : null;


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


	if (stat !== null && callback !== null) {
		callback(stat.isDirectory());
	} else if (stat !== null) {
		return stat.isDirectory();
	} else if (callback !== null) {
		callback(false);
	} else {
		return false;
	}

};

const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload)) {

		payload = Object.assign({}, raw);

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;
		payload.path      = typeof payload.path === 'string'      ? payload.path      : '/';
		payload.mime      = URL.parse('https://' + payload.domain + payload.path).mime;

		if (payload.path.endsWith('/')) {
			payload.path += 'index' + (payload.mime.ext !== null ? ('.' + payload.mime.ext) : '');
		}

		if (isBuffer(payload.headers)) {
			// Do nothing
		} else if (isObject(payload.headers)) {
			payload.headers = Buffer.from(JSON.stringify(payload.headers, null, '\t'), 'utf8');
		} else {
			payload.headers = null;
		}

		if (isBuffer(payload.payload)) {
			// Do nothing
		} else if (isObject(payload.payload)) {
			payload.payload = Buffer.from(JSON.stringify(payload.payload, null, '\t'), 'utf8');
		} else {
			payload.payload = null;
		}

		return payload;

	}


	return null;

};



const Cache = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Cache.prototype = Object.assign({}, Emitter.prototype, {

	info: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let file    = null;
			let profile = this.stealth.settings.profile || null;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					file = payload.subdomain + '.' + payload.domain;
				} else {
					file = payload.domain;
				}

			} else if (payload.host !== null) {
				file = payload.host;
			}

			if (payload.path !== null) {
				file += payload.path;
			}


			if (profile !== null && file !== null) {


				let headers = info(profile + '/cache/headers/' + file);
				let payload = info(profile + '/cache/payload/' + file);

				if (headers !== null && payload !== null) {

					callback({
						headers: {
							service: 'cache',
							event:   'info'
						},
						payload: {
							headers: headers,
							payload: payload
						}
					});

				} else {

					callback({
						headers: {
							service: 'cache',
							event:   'info'
						},
						payload: null
					});

				}

			} else {

				callback({
					headers: {
						service: 'cache',
						event:   'info'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'info'
				},
				payload: null
			});

		}

	},

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let file    = null;
			let profile = this.stealth.settings.profile || null;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					file = payload.subdomain + '.' + payload.domain;
				} else {
					file = payload.domain;
				}

			} else if (payload.host !== null) {
				file = payload.host;
			}

			if (payload.path !== null) {
				file += payload.path;
			}


			if (profile !== null && file !== null) {

				fs.readFile(path.resolve(profile + '/cache/headers/' + file), (err, raw_headers) => {

					let headers = {};

					if (!err) {

						try {
							headers = JSON.parse(raw_headers.toString('utf8'));
						} catch (err) {
							headers = {};
						}

					}


					fs.readFile(path.resolve(profile + '/cache/payload/' + file), (err, raw_payload) => {

						if (!err) {

							Object.assign(headers, {
								'content-type':   payload.mime.format,
								'content-length': Buffer.byteLength(raw_payload)
							});

							callback({
								headers: {
									service: 'cache',
									event:   'read'
								},
								payload: {
									headers: headers,
									payload: raw_payload
								}
							});

						} else if (callback !== null) {

							callback({
								headers: {
									service: 'cache',
									event:   'read'
								},
								payload: null
							});

						}

					});

				});

			} else {

				callback({
					headers: {
						service: 'cache',
						event:   'read'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'read'
				},
				payload: null
			});

		}

	},

	remove: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let file    = null;
			let profile = this.stealth.settings.profile || null;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					file = payload.subdomain + '.' + payload.domain;
				} else {
					file = payload.domain;
				}

			} else if (payload.host !== null) {
				file = payload.host;
			}

			if (payload.path !== null) {
				file += payload.path;
			}


			fs.stat(path.resolve(profile + '/cache/headers/' + file), (err, stat) => {

				if (!err) {

					if (stat.isFile() === true) {
						fs.unlink(path.resolve(profile + '/cache/headers/' + file), () => {});
					}

				}

			});

			fs.stat(path.resolve(profile + '/cache/payload/' + file), (err, stat) => {

				if (!err && stat.isFile()) {

					fs.unlink(path.resolve(profile + '/cache/payload/' + file), (err) => {

						callback({
							headers: {
								service: 'cache',
								event:   'remove'
							},
							payload: (err === null)
						});

					});

				} else {

					callback({
						headers: {
							service: 'cache',
							event:   'remove'
						},
						payload: false
					});

				}

			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'remove'
				},
				payload: false
			});

		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let file    = null;
			let profile = this.stealth.settings.profile || null;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					file = payload.subdomain + '.' + payload.domain;
				} else {
					file = payload.domain;
				}

			} else if (payload.host !== null) {
				file = payload.host;
			}

			if (payload.path !== null) {
				file += payload.path;
			}


			if (file !== null && profile !== null) {

				let folder = file.split('/').slice(0, -1).join('/');
				let result = false;

				if (payload.headers !== null) {

					mkdir(profile + '/cache/headers/' + folder, () => {
						fs.writeFile(path.resolve(profile + '/cache/headers/' + file), payload.headers, () => {});
					});

					result = true;

				}

				if (payload.payload !== null) {

					result = true;

					mkdir(profile + '/cache/payload/' + folder, () => {
						fs.writeFile(path.resolve(profile + '/cache/payload/' + file), payload.payload, () => {});
					});

				}

				callback({
					headers: {
						service: 'cache',
						event:   'save'
					},
					payload: result
				});

			} else {

				callback({
					headers: {
						service: 'cache',
						event:   'save'
					},
					payload: false
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Cache };

