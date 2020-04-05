
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


		if (data !== null && callback !== null) {

			let url = data.path || null;
			if (url !== null) {

				fs.readFile(path.resolve(ROOT + url), (err, buffer) => {

					if (!err) {

						callback({
							headers: {
								'content-type':   data.mime.format,
								'content-length': Buffer.byteLength(buffer)
							},
							payload: buffer
						});

					} else if (callback !== null) {
						callback(null);
					}

				});

			} else if (callback !== null) {
				callback(null);
			}

		} else if (callback !== null) {
			callback(null);
		}

	}

};


export { FILE };

