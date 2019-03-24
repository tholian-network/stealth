
import fs          from 'fs';
import path        from 'path';
import process     from 'process';
import { Buffer  } from 'buffer';

const _ROOT = (function() {

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

	read: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let url = ref.path || null;
			if (url !== null) {

				fs.readFile(path.resolve(_ROOT + url), (err, buffer) => {

					if (!err) {

						callback({
							headers: {
								'content-type':   ref.mime.format,
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

