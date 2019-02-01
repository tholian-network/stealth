
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

const _validate_headers = function(headers) {

	if (headers instanceof Buffer) {
		return headers;
	} else if (headers instanceof Object) {
		return Buffer.from(JSON.stringify(headers, null, '\t'), 'utf8');
	}

	return null;

};

const _validate_payload = function(payload) {

	if (payload instanceof Buffer) {
		return payload;
	}

	return null;

};



const Cache = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Cache.prototype = Object.assign({}, Emitter.prototype, {

	read: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let domain    = ref.domain || null;
			let subdomain = ref.subdomain || null;
			if (subdomain !== null) {
				domain = subdomain + '.' + domain;
			}


			let profile = this.stealth.settings.profile || null;

			if (domain !== null && profile !== null) {

				let mime = ref.mime || null;
				if (mime === null) {
					mime = URL.parse('https://' + domain + ref.path).mime;
				}

				let path = (domain + ref.path) || '';
				if (path.endsWith('/')) {
					path += 'index' + (mime.ext !== null ? ('.' + mime.ext) : '');
				}


				fs.readFile(profile + '/cache/persistent/headers/' + path, (err, raw_headers) => {

					let headers = {};

					if (!err) {

						try {
							headers = JSON.parse(raw_headers.toString('utf8'));
						} catch (err) {
							headers = {};
						}

					}

					fs.readFile(profile + '/cache/persistent/payload/' + path, (err, payload) => {

						if (!err) {

							callback({
								headers: Object.assign({
									service: 'cache',
									event:   'read'
								}, headers, {
									'Content-Type':   mime.format,
									'Content-Length': Buffer.byteLength(payload)
								}),
								payload: payload
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

	save: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let domain    = ref.domain || null;
			let subdomain = ref.subdomain || null;
			if (subdomain !== null) {
				domain = subdomain + '.' + domain;
			}


			let headers = _validate_headers(ref.headers || {});
			let payload = _validate_payload(ref.payload || null);
			let profile = this.stealth.settings.profile || null;

			if (domain !== null && headers !== null && payload !== null && profile !== null) {

				let mime = ref.mime || null;
				if (mime === null) {
					mime = URL.parse('https://' + domain + ref.path).mime;
				}

				let path = (domain + ref.path) || '';
				if (path.endsWith('/')) {
					path += 'index' + (mime.ext !== null ? ('.' + mime.ext) : '');
				}


				let folder = path.split('/').slice(0, -1).join('/');

				_mkdir(profile + '/cache/persistent/headers/' + folder, () => {

					_mkdir(profile + '/cache/persistent/payload/' + folder, () => {

						fs.writeFile(profile + '/cache/persistent/headers/' + path, headers, (err_headers) => {

							fs.writeFile(profile + '/cache/persistent/payload/' + path, payload, (err_payload) => {

								if (!err_headers && !err_payload) {

									callback({
										headers: {
											service: 'cache',
											event:   'save'
										},
										payload: {
											result: true
										}
									});

								} else {

									callback({
										headers: {
											service: 'cache',
											event:   'save'
										},
										payload: {
											result: false
										}
									});

								}

							});

						});

					});

				});

			} else {

				callback({
					headers: {
						service: 'cache',
						event:   'save'
					},
					payload: {
						result: false
					}
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'cache',
					event:   'save'
				},
				payload: {
					result: false
				}
			});

		}

	}

});


export { Cache };

