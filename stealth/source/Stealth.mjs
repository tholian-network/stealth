
import { Server   } from './Server.mjs';
import { Settings } from './Settings.mjs';
import { URL      } from './URL.mjs';



const Stealth = function(data) {

	let settings = Object.assign({
		profile: null,
		root:    null
	}, data);

	this.settings = new Settings(this, settings.profile);
	this.server   = new Server(this, settings.root);

};


Stealth.prototype = {

	connect: function(host, port) {

		if (this.server !== null) {
			this.server.connect(host, port);
		}

	},

	parse: function(url) {

		url = typeof url === 'string' ? url : '';


		return URL.parse(url);

	}

};


export { Stealth };

