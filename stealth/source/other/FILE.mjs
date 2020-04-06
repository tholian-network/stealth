
import fs      from 'fs';
import path    from 'path';
import process from 'process';

import { Buffer, isFunction, isObject } from '../BASE.mjs';



const ROOT = (function() {

	let pwd = process.env.PWD || null;
	if (pwd !== null) {
		return pwd;
	}

	let cwd = process.cwd();
	if (cwd.includes('\\')) {
		cwd = cwd.split('\\').join('/');
	}

	if (cwd.endsWith('/')) {
		cwd = cwd.substr(0, cwd.length - 1);
	}

	return cwd;

})();



const FILE = {

	send: function(data, callback) {

		data     = isObject(data)       ? data     : null;
		callback = isFunction(callback) ? callback : null;


		if (data !== null) {

			let url = data.path || null;
			if (url !== null) {

				if (callback !== null) {

					fs.readFile(path.resolve(ROOT + url), (err, buffer) => {

						if (!err) {

							callback({
								headers: {
									'@code':          200,
									'@status':        '200 OK',
									'content-type':   data.mime.format,
									'content-length': Buffer.byteLength(buffer)
								},
								payload: buffer
							});

						} else if (callback !== null) {
							callback(null);
						}

					});

				} else {

					let buffer = null;
					try {
						buffer = fs.readFileSync(path.resolve(ROOT + url));
					} catch (err) {
						buffer = null;
					}

					if (buffer !== null) {

						return {
							headers: {
								'@code':          200,
								'@status':        '200 OK',
								'content-type':   data.mime.format,
								'content-length': Buffer.byteLength(buffer)
							},
							payload: buffer
						};

					} else {

						return null;

					}

				}

			} else {

				if (callback !== null) {
					callback(null);
				} else {
					return null;
				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	}

};


export { FILE };

