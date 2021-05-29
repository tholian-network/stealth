
import fs   from 'fs';
import path from 'path';

import { Emitter, isBoolean, isBuffer, isString } from '../extern/base.mjs';



export const isFilesystem = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Filesystem]';
};

const scan_recursive = (url, results) => {

	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			let nodes = [];

			try {
				nodes = fs.readdirSync(path.resolve(url));
			} catch (err) {
				nodes = [];
			}

			if (nodes.length > 0) {

				nodes.forEach((node) => {

					if (node.startsWith('.') === false) {
						scan_recursive(url + '/' + node, results);
					}

				});

			}

		} else if (stat.isFile() === true) {

			if (results.includes(url) === false) {
				results.push(url);
			}

		}

	}

};



const Filesystem = function(settings) {

	this._settings = Object.freeze(Object.assign({
	}, settings));


	Emitter.call(this);

};


Filesystem.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Filesystem',

	exists: function(url, type) {

		url  = isString(url)  ? url  : null;
		type = isString(type) ? type : null;


		if (url !== null) {

			let stat = null;

			try {
				stat = fs.lstatSync(path.resolve(url));
			} catch (err) {
				stat = null;
			}

			if (stat !== null) {

				if (type !== null) {

					if (type === 'file' && stat.isFile()) {
						return true;
					} else if (type === 'folder' && stat.isDirectory()) {
						return true;
					}

				} else {

					if (stat.isFile()) {
						return true;
					} else if (stat.isDirectory()) {
						return true;
					}

				}

			}

		}


		return false;

	},

	read: function(url, enc) {

		url = isString(url) ? url : null;
		enc = isString(enc) ? enc : 'utf8';


		if (url !== null) {

			let buffer = null;

			try {
				buffer = fs.readFileSync(path.resolve(url), enc);
			} catch (err) {
				buffer = null;
			}

			if (buffer !== null) {
				return buffer;
			}

		}


		return null;

	},

	scan: function(url, recursive) {

		url       = isString(url)        ? url       : null;
		recursive = isBoolean(recursive) ? recursive : false;


		let results = [];

		if (url !== null) {


			if (recursive === true) {

				scan_recursive(url, results);

			} else {

				let nodes = [];

				try {

					let stat = fs.lstatSync(path.resolve(url));
					if (stat.isDirectory() === true) {
						nodes = fs.readdirSync(path.resolve(url));
					}

				} catch (err) {
					nodes = [];
				}

				if (nodes.length > 0) {

					nodes.forEach((node) => {

						if (node.startsWith('.') === false) {

							let stat = null;

							try {
								stat = fs.lstatSync(path.resolve(url + '/' + node));
							} catch (err) {
								stat = null;
							}

							if (stat !== null && stat.isFile()) {
								results.push(url + '/' + node);
							}

						}

					});

				}

			}

		}

		return results;

	},

	write: function(url, buf, enc) {

		url = isString(url) ? url : null;
		buf = isBuffer(buf) ? buf : null;
		enc = isString(enc) ? enc : 'utf8';


		if (url !== null) {

			if (this.exists(path.dirname(url), 'folder') === true) {

				let result = false;

				try {
					fs.writeFileSync(path.resolve(url), buf, enc);
					result = true;
				} catch (err) {
					result = false;
				}

				return result;

			}

		}


		return false;

	}

});


export { Filesystem };

