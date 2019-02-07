
import { console   } from './console.mjs';
import { Request   } from './Request.mjs';
import { Server    } from './Server.mjs';
import { Settings  } from './Settings.mjs';
import { URL       } from './parser/URL.mjs';



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

			let sites = this.settings.sites.filter(cfg => rdomain.endsWith(cfg.domain));
			if (sites.length > 1) {

				return sites.sort((a, b) => {
					if (a.domain.length > b.domain.length) return -1;
					if (b.domain.length > a.domain.length) return  1;
					return 0;
				})[0];

			} else if (sites.length === 1) {

				return sites[0];

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


	this.settings = new Settings(this,
		settings.profile,
		settings.debug === true ? null : settings.root + '/profile'
	);
	this.server   = new Server(this, settings.root);
	this.sessions = [];

};


Stealth.prototype = {

	connect: function(host, port) {

		if (this.server !== null) {
			this.server.connect(host, port);
		}

	},

	open: function(url) {

		url = typeof url === 'string' ? url : null;


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

	},

	parse: function(url) {

		url = typeof url === 'string' ? url : '';


		return URL.parse(url);

	}

};


export { Stealth };

