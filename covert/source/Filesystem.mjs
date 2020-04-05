
import fs      from 'fs';
import process from 'process';

import { isString } from '../../stealth/source/BASE.mjs';
import { Emitter  } from '../../stealth/source/Emitter.mjs';



export const Filesystem = function(settings) {

	this.settings = Object.assign({
		root: process.cwd()
	}, settings);

	this.__state = {
		watch: []
	};


	Emitter.call(this);

};


Filesystem.prototype = Object.assign({}, Emitter.prototype, {

	connect: function() {

		if (this.__state.watch.length > 0) {

			this.__state.watch.forEach((file) => {

				fs.watchFile(file.path, (curr) => {

					if (curr.mtime > file.mtime) {

						file.mtime = curr.mtime;


						let buffer = this.read(file.path, 'utf8');
						if (buffer !== file.buffer) {

							if (buffer !== file.buffer) {

								file.buffer = buffer;

								this.emit('change', [ file.path ]);

							}

						}

					}

				});

			});

		}

	},

	disconnect: function() {

		if (this.__state.watch.length > 0) {

			this.__state.watch.forEach((file) => {
				fs.unwatchFile(file.path);
			});

		}

	},

	exists: function(path, type) {

		path = isString(path) ? path : null;
		type = isString(type) ? type : null;


		if (path !== null) {

			let stat = null;

			try {
				stat = fs.lstatSync(path);
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

	read: function(path, enc) {

		path = isString(path) ? path : null;
		enc  = isString(enc)  ? enc  : 'utf8';


		if (path !== null) {

			let buffer = null;

			try {
				buffer = fs.readFileSync(path, enc);
			} catch (err) {
				buffer = null;
			}

			if (buffer !== null) {
				return buffer;
			}

		}


		return null;

	},

	watch: function(path) {

		path = isString(path) ? path : null;


		if (path !== null) {

			let buffer = this.read(path, 'utf8');
			if (buffer !== null) {

				let stat = null;

				try {
					stat = fs.lstatSync(path);
				} catch (err) {
					stat = null;
				}

				if (stat !== null) {

					this.__state.watch.push({
						buffer: buffer,
						path:   path,
						mtime:  stat.mtime
					});

					return true;

				}

			}

		}


		return false;

	}

});

