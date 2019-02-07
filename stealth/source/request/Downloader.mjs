
import http  from 'http';
import https from 'https';


import { Emitter } from '../Emitter.mjs';

const _net      = { http: http, https: https };
const _REQUESTS = [];



const _Request = function(ref) {

	Emitter.call(this);


	this.ref = ref;

	this.__socket = null;


	this.init();


};


_Request.prototype = Object.assign({}, Emitter.prototype, {

	init: function() {

		if (this.__socket === null) {

			let ref = this.ref;


			let path  = ref.path;
			let query = ref.query;
			if (query !== null) {
				path += '?' + query;
			}

			let host = null;
			if (ref.domain !== null) {

				if (ref.subdomain !== null) {
					host = ref.subdomain + '.' + ref.domain;
				} else {
					host = ref.domain;
				}

			} else if (ref.host !== null) {
				host = ref.host;
			}


			let net = _net[ref.protocol || null ] || null;
			if (net !== null) {

				console.log(ref);

				this.__socket = net.request({
					hostname: ref.host,
					port:   ref.port,
					path:   path,
					method: 'GET',
					headers: {
						host: host
					}
				}, response => {

					let buffer = Buffer.alloc(0);

					response.on('data', chunk => {

						let tmp = Buffer.alloc(buffer.length + chunk.length);

						buffer.copy(tmp, 0);
						chunk.copy(tmp, buffer.length);

						buffer = tmp;

					});

					// response.complete === true or false

					response.on('error', e => console.log('WTF', e));
					response.on('timeout', e => console.log('timeout', e));

					response.on('close', () => console.log('CLOSE THIS SHIT', buffer.toString('utf8')));
					response.on('end', () => console.log('END THIS SHIT'));

				});

				this.__socket.on('error', e => console.log(e));

				this.__socket.end();

			}

		}

	}

});



const Downloader = {

	check: function(ref, config, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		config   = config instanceof Object       ? config   : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			let protocol = ref.protocol;
			let type     = ref.mime.type;

			if (protocol === 'https' || protocol === 'http') {
				callback(config.mode[type] === true);
			} else {
				callback(false);
			}

		} else if (callback !== null) {
			callback(false);
		}

	},

	download: function(ref, config, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		config   = config instanceof Object       ? config   : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			let protocol = ref.protocol;
			let type     = ref.mime.type;

			let allowed = config.mode[type] === true;
			if (allowed === true) {
				callback(new _Request(ref));
			} else {
				callback(null);
			}

		} else if (callback !== null) {
			callback(null);
		}

	}

};


export { Downloader };

