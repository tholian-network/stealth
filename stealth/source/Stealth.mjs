
import { Server } from './Server.mjs';
import { URL    } from './URL.mjs';



const Stealth = function(data) {

	let settings = Object.assign({
		host:    'localhost',
		port:    65432,
		profile: '/tmp/stealth',
		root:    null
	}, data);

	this.settings = settings;
	this.server   = new Server(this);

};


Stealth.prototype = {

	connect: function() {

		let host = this.settings.host;
		let port = this.settings.port;

		if (host !== null && port !== null) {
			this.server.connect(host, port);
		}

	},

	parse: function(url) {

		url = typeof url === 'string' ? url : '';


		return URL.parse(url);

	}

};


export { Stealth };

