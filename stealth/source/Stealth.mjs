
import { isFunction, isString } from './POLYFILLS.mjs';

import { console  } from './console.mjs';
import { Request  } from './Request.mjs';
import { Server   } from './Server.mjs';
import { Settings } from './Settings.mjs';



const _get_config = function(url) {

	url = typeof url === 'string' ? url : null;


	let config = {
		domain: null,
		mode:   {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	if (url !== null) {

		let ref     = this.parse(url);
		let rdomain = ref.domain || null;
		if (rdomain !== null) {

			let rsubdomain = ref.subdomain || null;
			if (rsubdomain !== null) {
				rdomain = rsubdomain + '.' + rdomain;
			}

		}


		if (rdomain !== null) {

			let modes = this.settings.modes.filter((m) => rdomain.endsWith(m.domain));
			if (modes.length > 1) {

				return modes.sort((a, b) => {
					if (a.domain.length > b.domain.length) return -1;
					if (b.domain.length > a.domain.length) return  1;
					return 0;
				})[0];

			} else if (modes.length === 1) {

				return modes[0];

			}

		}

	}

	return config;

};



const Stealth = function(data) {

	let settings = Object.assign({
		profile: null,
		root:    null
	}, data);

	console.log('Stealth Service Command-Line Arguments:');
	console.log(settings);


	this.peers    = [];
	this.settings = new Settings(this,
		settings.profile,
		settings.debug === true ? null : settings.root + '/profile'
	);
	this.server   = new Server(this);
	this.sessions = [];

};


Stealth.prototype = {

	connect: function(host, callback) {

		host     = isString(host)       ? host     : 'localhost';
		callback = isFunction(callback) ? callback : null;


		if (this.server !== null) {

			if (callback !== null) {
				this.server.connect(host, (result) => callback(result));
			} else {
				return this.server.connect(host);
			}

		} else {

			if (callback !== null) {
				callback(false);
			}

			return false;

		}

	},

	disconnect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.server !== null) {

			if (this.peers.length > 0) {
				this.peers.forEach((peer) => {
					peer.disconnect();
				});
			}

			if (callback !== null) {
				this.server.disconnect((result) => callback(result));
			} else {
				return this.server.disconnect();
			}

		} else {

			if (callback !== null) {
				callback(false);
			}

			return false;

		}

	},

	open: function(url) {

		url = isString(url) ? url : '';


		if (url !== null) {

			let ref     = this.parse(url);
			let request = null;

			for (let s = 0, sl = this.sessions.length; s < sl; s++) {

				let session = this.sessions[s];
				let cached  = session.get(ref.url);
				if (cached !== null) {
					request = cached;
					break;
				}

			}

			if (request === null) {
				request = new Request({
					config: _get_config.call(this, ref.url),
					ref:    ref,
					url:    ref.url
				}, this);
			}

			return request;

		}


		return null;

	}

};


export { Stealth };

