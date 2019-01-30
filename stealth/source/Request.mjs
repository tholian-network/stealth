
import { MODES   } from './Stealth.mjs';
import { Emitter } from './Emitter.mjs';
import { URL     } from './parser/URL.mjs';



const Request = function(stealth, url) {

	Emitter.call(this);


	this.mode    = null;
	this.ref     = URL.parse(url);
	this.stealth = stealth;

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

		this.stealth.server.services.host.read(this.ref, response => {

			if (response !== null) {

				if (response.ipv6 !== null) {
					this.ref.host = response.ipv6;
				} else if (response.ipv4 !== null) {
					this.ref.host = response.ipv4;
				}

			}


			if (this.ref.host !== null) {
				this.emit('download');
			} else {
				this.emit('error', [{
					type: 'connect'
				}]);
			}

		});

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

	init: function(mode) {

		mode = typeof mode === 'string' ? mode : 'offline';


		if (this.mode === null) {

			this.mode = mode;

			return true;

		}


		return false;

	},

	setMode: function(mode) {
	}

});


export { Request };

