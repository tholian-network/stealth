
import fs          from 'fs';
import { Buffer  } from 'buffer';
import { Emitter } from '../Emitter.mjs';
import { URL     } from '../parser/URL.mjs';



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

		ref      = ref instanceof Object        ? ref      : null;
		callback = callback instanceof Function ? callback : null;


		if (ref !== null && callback !== null) {

			let mime = ref.mime || null;
			if (mime === null) {
				mime = URL.parse('https://' + ref.domain + ref.path).mime;
			}

			let path    = (ref.domain + ref.path) || '';
			let profile = this.stealth.settings.profile || null;

			if (path !== '' && profile !== null) {

				if (path.endsWith('/')) {
					path += 'index' + (mime.ext !== null ? ('.' + mime.ext) : '');
				}


				fs.readFile(profile + '/cache/' + path, (err, buffer) => {

					if (!err) {

						callback({
							headers: {
								'Content-Type':   mime.format,
								'Content-Length': Buffer.byteLength(buffer)
							},
							payload: buffer
						});

					} else if (callback !== null) {

						callback({
							headers: {},
							payload: null
						});

					}

				});

			} else if (callback !== null) {

				callback({
					headers: {},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {},
				payload: null
			});

		}

	},

	save: function(ref, callback) {

		ref      = ref instanceof Object        ? ref      : null;
		callback = callback instanceof Function ? callback : null;


		if (ref !== null && callback !== null) {

			let mime = ref.mime || null;
			if (mime === null) {
				mime = URL.parse('https://' + ref.domain + ref.path).mime;
			}

			let path    = (ref.domain + ref.path) || '';
			let payload = _validate_payload(ref.payload || null);
			let profile = this.stealth.settings.profile || null;

			if (path !== '' && payload !== null && profile !== null) {

				if (path.endsWith('/')) {
					path += 'index' + (mime.ext !== null ? ('.' + mime.ext) : '');
				}


				let folder = path.split('/').slice(0, -1).join('/');

				fs.lstat(profile + '/cache/' + folder, (err, stat) => {

					if (err.code === 'ENOENT') {

						try {
							fs.mkdirSync(profile + '/cache/' + folder, {
								recursive: true
							});
							stat = fs.lstatSync(profile + '/cache/' + folder);
						} catch (err) {
						}

					}

					let check = stat || null;
					if (check !== null && check.isDirectory() === true) {

						fs.writeFile(profile + '/cache/' + path, payload, (err) => {

							if (!err) {

								callback({
									headers: {},
									payload: { result: true }
								});

							} else {

								callback({
									headers: {},
									payload: { result: false }
								});

							}

						});

					} else {

						callback({
							headers: {},
							payload: { result: false }
						});

					}

				});

			} else {

				callback({
					headers: {},
					payload: { result: false }
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {},
				payload: { result: false }
			});

		}

	}

});


export { Cache };

