
import { Request   } from './Request.mjs';
import { Server    } from './Server.mjs';
import { Settings  } from './Settings.mjs';
import { URL       } from './parser/URL.mjs';



const Stealth = function(data) {

	let settings = Object.assign({
		profile: null,
		root:    null
	}, data);


	console.log('Stealth Settings are:');
	Object.keys(settings).forEach(key => {
		console.log(' > "' + key + '": "' + settings[key] + '"');
	});


	this.mode     = 'offline';
	this.settings = new Settings(this, settings.profile);
	this.server   = new Server(this, settings.root);

};


export const MODES = Stealth.MODES = [
	'offline',
	'covert',
	'stealth',
	'online'
];


Stealth.prototype = {

	config: function(url) {

		url = typeof url === 'string' ? url : null;


		let mode   = this.mode;
		let config = {
			domain: null,
			mode:   mode,
			mime:   {
				text:  false,
				image: false,
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


		if (mode === 'online') {
			config.mime.text  = true;
			config.mime.image = true;
			config.mime.video = true;
			config.mime.other = true;
		} else if (mode === 'stealth') {
			config.mime.text  = true;
			config.mime.image = true;
			config.mime.video = true;
			config.mime.other = false;
		} else if (mode === 'covert') {
			config.mime.text  = true;
			config.mime.image = false;
			config.mime.video = false;
			config.mime.other = false;
		} else if (mode === 'offline') {
			config.mime.text  = false;
			config.mime.image = false;
			config.mime.video = false;
			config.mime.other = false;
		}


		return config;

	},

	connect: function(host, port) {

		if (this.server !== null) {
			this.server.connect(host, port);
		}

	},

	open: function(url) {

		url = typeof url === 'string' ? url : null;


		if (url !== null) {

			let ref     = this.parse(url);
			let request = new Request({
				config: this.config(ref.url),
				ref:    ref,
				url:    ref.url
			}, this);

			return request;

		}


		return null;

	},

	parse: function(url) {

		url = typeof url === 'string' ? url : '';


		return URL.parse(url);

	},

	setMode: function(mode) {

		mode = typeof mode === 'string' ? mode : null;


		if (mode !== null) {

			mode = mode.toLowerCase();

			if (MODES.includes(mode)) {

				this.mode = mode;

				return true;

			}

		}


		return false;

	}

};


export { Stealth };

