
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

	connect: function(host, port) {

		if (this.server !== null) {
			this.server.connect(host, port);
		}

	},

	open: function(url) {

		url = typeof url === 'string' ? url : null;


		if (url !== null) {
			return new Request(this, url);
		}


		return null;

	},

	parse: function(url) {

		url = typeof url === 'string' ? url : '';


		return URL.parse(url);

	}

};


export { Stealth };

