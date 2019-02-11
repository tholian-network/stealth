
import fs          from 'fs';
import { Buffer  } from 'buffer';
import { Emitter } from '../Emitter.mjs';



const File = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


File.prototype = Object.assign({}, Emitter.prototype, {

	read: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let path = ref.path || null;
			let root = this.stealth.server.__root || null;

			if (path !== null && root !== null) {

				fs.readFile(root + path, (err, buffer) => {

					if (!err) {

						callback({
							headers: {
								'Content-Type':   ref.mime.format,
								'Content-Length': Buffer.byteLength(buffer)
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

});


export { File };

