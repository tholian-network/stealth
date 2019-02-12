
import fs          from 'fs';
import { Buffer  } from 'buffer';
import { Emitter } from '../Emitter.mjs';
import { URL     } from '../parser/URL.mjs';



const _mkdir = function(path, callback) {

	callback = typeof callback === 'function' ? callback : null;


	fs.lstat(path, (err, stat) => {

		if (err.code === 'ENOENT') {

			try {
				fs.mkdirSync(path, {
					recursive: true
				});
				stat = fs.lstatSync(path);
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

const _payloadify = function(payload) {

	if (payload instanceof Object) {

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



const Cache = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Cache.prototype = Object.assign({}, Emitter.prototype, {

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

				fs.readFile(profile + '/cache/headers/' + file, (err, raw_headers) => {

					let headers = {};

					if (!err) {

						try {
							headers = JSON.parse(raw_headers.toString('utf8'));
						} catch (err) {
							headers = {};
						}

					}

					fs.readFile(profile + '/cache/payload/' + file, (err, raw_payload) => {

						if (!err) {

							callback({
								headers: Object.assign({
									service: 'cache',
									event:   'read'
								}, headers, {
									'Content-Type':   payload.mime.format,
									'Content-Length': Buffer.byteLength(raw_payload)
								}),
								payload: raw_payload
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

			} else if (callback !== null) {

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

					_mkdir(profile + '/cache/headers/' + folder, () => {
						fs.writeFile(profile + '/cache/headers/' + file, payload.headers, () => {});
					});

					result = true;

				}

				if (payload.payload !== null) {

					result = true;

					_mkdir(profile + '/cache/payload/' + folder, () => {
						fs.writeFile(profile + '/cache/payload/' + file, payload.payload, () => {});
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

