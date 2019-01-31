
import { Emitter } from './Emitter.mjs';
import { URL     } from './parser/URL.mjs';


let _id = 0;

const Request = function(data, stealth) {

	let settings = Object.assign({}, data);


	Emitter.call(this);


	this.id      = 'request-' + _id++;
	this.config  = settings.config || null;
	this.ref     = null;
	this.stealth = stealth;
	this.url     = null;


	let ref = settings.ref || null;
	let url = settings.url || null;

	if (ref !== null) {

		this.ref = ref;
		this.url = this.ref.url;

	} else if (url !== null) {

		this.ref = URL.parse(url);
		this.url = this.ref.url;

	}


	// this.emit('error', [ { type: 'url' } ]);
	// this.emit('ready', [ { headers: {}, payload: null } ]);

	this.on('cache', _ => {

		this.stealth.server.services.cache.read(this.ref, response => {

			if (response !== null) {
				this.emit('ready', [{
					headers: response.headers,
					payload: response.payload
				}]);
			} else {
				this.emit('connect');
			}

		});

	});

	this.on('connect', _ => {

		console.log('connect()');

		if (this.ref.host !== null) {

			this.emit('download');

		} else {

			this.stealth.server.services.host.read(this.ref, response => {

				if (response !== null) {

					if (response.ipv6 !== null) {
						this.ref.host = response.ipv6;
					} else if (response.ipv4 !== null) {
						this.ref.host = response.ipv4;
					}

				}

				console.log(this.ref.url, this.ref.host);

				if (this.ref.host !== null) {
					this.emit('download');
				} else {
					this.emit('error', [{
						type: 'connect'
					}]);
				}

			});

		}

	});

	this.on('download', _ => {

		// TODO: download stuff via net.Socket()

	});

	this.on('filter', _ => {

		// TODO: filter stuff via optimizers/<MIME>.mjs#filter()

	});

	this.on('optimize', _ => {

		// TODO: optimize stuff via optimizers/<MIME>.mjs#filter()

	});

};


Request.prototype = Object.assign({}, Emitter.prototype, {

	init: function() {

		console.log(this.url, this.config);

		// this.emit('cache');

	},

	kill: function() {

		// TODO: Stop download(s)

	}

});


export { Request };

