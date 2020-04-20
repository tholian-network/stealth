
import fs   from 'fs';
import path from 'path';

import { Buffer, isFunction, isObject } from '../../extern/base.mjs';
import { root                         } from '../ENVIRONMENT.mjs';



const FILE = {

	send: function(data, callback) {

		data     = isObject(data)       ? data     : null;
		callback = isFunction(callback) ? callback : null;


		if (data !== null) {

			let url = data.path || null;
			if (url !== null) {

				if (callback !== null) {

					fs.readFile(path.resolve(root + url), (err, buffer) => {

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
						buffer = fs.readFileSync(path.resolve(root + url));
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

