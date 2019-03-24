
import fs          from 'fs';
import path        from 'path';
import { Buffer  } from 'buffer';

import { Emitter } from '../Emitter.mjs';
import { URL     } from '../parser/URL.mjs';



const _info = function(url, callback) {

	callback = typeof callback === 'function' ? callback : null;


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

const _mkdir = function(url, callback) {

	callback = typeof callback === 'function' ? callback : null;


	fs.lstat(path.resolve(url), (err, stat) => {

		if (err !== null && err.code === 'ENOENT') {

			try {
				fs.mkdirSync(path.resolve(url), {
					recursive: true
				});
				stat = fs.lstatSync(path.resolve(url));
			} catch (err) {
				stat = null;
			}

		}

		if (stat !== null) {

			if (callback !== null) {
				callback(stat.isDirectory());
			}

		}

	});

};

const _payloadify = function(raw) {

	let payload = raw;
	if (payload instanceof Object) {

		payload = Object.assign({}, raw);

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;

		payload.path = typeof payload.path === 'string' ? payload.path : '/';
		payload.mime = URL.parse('https://' + payload.domain + payload.path).mime;

		if (payload.path.endsWith('/')) {
			payload.path += 'index' + (payload.mime.ext !== null ? ('.' + payload.mime.ext) : '');
		}

		if (payload.headers instanceof Buffer) {
			// Do nothing
		} else if (payload.headers instanceof Object) {
			payload.headers = Buffer.from(JSON.stringify(payload.headers, null, '\t'), 'utf8');
		} else {
			payload.headers = null;
		}

		if (payload.payload instanceof Buffer) {
			// Do nothing
		} else if (payload.payload instanceof Object) {
			payload.payload = Buffer.from(JSON.stringify(payload.payload, null, '\t'), 'utf8');
		} else {
			payload.payload = null;
		}

		return payload;

	}


	return null;

};



const Stash = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Stash.prototype = Object.assign({}, Emitter.prototype, {

	info: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


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


				let headers = _info(profile + '/stash/headers/' + file);
				let payload = _info(profile + '/stash/payload/' + file);

				if (headers !== null && payload !== null) {

					callback({
						headers: {
							service: 'stash',
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
							service: 'stash',
							event:   'info'
						},
						payload: null
					});

				}

			} else {

				callback({
					headers: {
						service: 'stash',
						event:   'info'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'stash',
					event:   'info'
				},
				payload: null
			});

		}

	},

	read: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


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

				fs.readFile(path.resolve(profile + '/stash/headers/' + file), (err, raw_headers) => {

					let headers = {};

					if (!err) {

						try {
							headers = JSON.parse(raw_headers.toString('utf8'));
						} catch (err) {
							headers = {};
						}

					}

					fs.readFile(path.resolve(profile + '/stash/payload/' + file), (err, raw_payload) => {

						if (!err) {

							Object.assign(headers, {
								'content-type':   payload.mime.format,
								'content-length': Buffer.byteLength(raw_payload)
							});

							callback({
								headers: {
									service: 'stash',
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
									service: 'stash',
									event:   'read'
								},
								payload: null
							});

						}

					});

				});

			} else if (callback !== null) {

				callback({
					headers: {
						service: 'stash',
						event:   'read'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'stash',
					event:   'read'
				},
				payload: null
			});

		}

	},

	remove: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


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


			fs.stat(path.resolve(profile + '/stash/headers/' + file), (err, stat) => {

				if (!err) {

					if (stat.isFile() === true) {
						fs.unlink(path.resolve(profile + '/stash/headers/' + file), () => {});
					}

				}

			});

			fs.stat(path.resolve(profile + '/stash/payload/' + file), (err, stat) => {

				if (!err && stat.isFile()) {

					fs.unlink(path.resolve(profile + '/stash/payload/' + file), (err) => {

						callback({
							headers: {
								service: 'stash',
								event:   'remove'
							},
							payload: (err === null)
						});

					});

				} else {

					callback({
						headers: {
							service: 'stash',
							event:   'remove'
						},
						payload: false
					});

				}

			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'stash',
					event:   'remove'
				},
				payload: false
			});

		}

	},

	save: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


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

					_mkdir(profile + '/stash/headers/' + folder, () => {
						fs.writeFile(path.resolve(profile + '/stash/headers/' + file), payload.headers, () => {});
					});

					result = true;

				}

				if (payload.payload !== null) {

					result = true;

					_mkdir(profile + '/stash/payload/' + folder, () => {
						fs.writeFile(path.resolve(profile + '/stash/payload/' + file), payload.payload, () => {});
					});

				}

				callback({
					headers: {
						service: 'stash',
						event:   'save'
					},
					payload: result
				});

			} else {

				callback({
					headers: {
						service: 'stash',
						event:   'save'
					},
					payload: false
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'stash',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Stash };

