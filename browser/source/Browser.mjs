
import { Emitter  } from './Emitter.mjs';
import { Client   } from './Client.mjs';
import { Tab      } from './Tab.mjs';
import { URL      } from './parser/URL.mjs';



const Browser = function() {

	Emitter.call(this);


	this.client = new Client(this);
	this.mode   = 'offline';
	this.tab    = null;
	this.tabs   = [];


	this.settings = {
		internet: {
			connection: 'mobile',
			torify:     false,
		},
		filters: [],
		hosts:   [],
		peers:   [],
		sites:   []
	};

};


Browser.MODES = [
	'offline',
	'covert',
	'stealth',
	'online'
];


Browser.prototype = Object.assign({}, Emitter.prototype, {

	back: function() {

		if (this.tab !== null) {

			let index = this.tab.history.indexOf(this.tab.url);
			if (index !== -1) {

				let url = this.tab.history[index - 1] || null;
				if (url !== null) {

					this.tab.url = url;
					this.emit('refresh', [ this.tab, this.tabs ]);

				}

			}

		}

	},

	config: function(url) {

		url = typeof url === 'string' ? url : null;


		if (url !== null) {

			let domain = this.parse(url).domain;
			if (domain !== null) {

				let sites = this.settings.sites.filter(cfg => domain.endsWith(cfg.domain));
				if (sites.length > 1) {

					return sites.sort((a, b) => {
						if (a.domain.length > b.domain.length) return -1;
						if (b.domain.length > a.domain.length) return  1;
						return 0;
					})[0];

				} else if (sites.length === 1) {

					return sites[0];

				} else {

					let config = {
						domain: domain,
						media:  {
							text:  false,
							image: false,
							video: false,
							other: false
						}
					};

					let mode = this.mode;
					if (mode === 'online') {
						config.media.text  = true;
						config.media.image = true;
						config.media.video = true;
						config.media.other = true;
					} else if (mode === 'stealth') {
						config.media.text  = true;
						config.media.image = true;
						config.media.video = false;
						config.media.other = false;
					} else if (mode === 'covert') {
						config.media.text  = true;
						config.media.image = false;
						config.media.video = false;
						config.media.other = false;
					} else if (mode === 'offline') {
						// XXX: Don't load anything
					}

					return config;

				}

			}

		}


		return null;

	},

	connect: function(host, port) {

		let client = this.client;
		if (client !== null) {
			client.connect(host, port, result => {
				if (result === true) {
					client.services.settings.read(null, _ => {});
				}
			});
		}

	},

	kill: function(tab, callback) {

		tab      = tab instanceof Tab           ? Tab      : null;
		callback = callback instanceof Function ? callback : null;


		if (tab !== null) {

			if (this.tabs.includes(tab) === true) {

				this.tabs.splice(this.tabs.indexOf(tab), 1);

				if (typeof tab.kill === 'function') {
					tab.kill();
				}

			}

			this.emit('kill', [ tab, this.tabs ]);


			if (this.tabs.length > 0) {

				this.tab = null;
				this.show(this.tabs[this.tabs.length - 1]);

			} else if (this.tabs.length === 0) {

				this.tab = null;

				let welcome = this.open('stealth:welcome');
				if (welcome !== null) {
					this.show(welcome);
				}

			}


			if (callback !== null) {
				callback(tab);
			}

			return true;

		}

	},

	navigate: function(url) {

		if (this.tab !== null) {

			if (this.tab.url !== url) {

				let index1 = this.tab.history.indexOf(this.tab.url);
				if (index1 < this.tab.history.length - 1) {
					this.tab.history.splice(index1 + 1);
				}

				this.tab.url = url;

				let index2 = this.tab.history.indexOf(url);
				if (index2 !== -1) {
					this.tab.history.splice(index2, 1);
				}

				this.tab.history.push(url);

			}

			this.refresh();

		} else {

			let tab = this.open(url);
			if (tab !== null) {

				let index1 = tab.history.indexOf(tab.url);
				if (index1 < tab.history.length - 1) {
					tab.history.splice(index1 + 1);
				}

				tab.url = url;

				let index2 = tab.history.indexOf(url);
				if (index2 !== -1) {
					tab.history.splice(index2, 1);
				}

				tab.history.push(url);

				this.show(tab);

			}

		}

	},

	next: function() {

		if (this.tab !== null) {

			let index = this.tab.history.indexOf(this.tab.url);
			if (index !== -1) {

				let url = this.tab.history[index + 1] || null;
				if (url !== null) {

					this.tab.url = url;
					this.emit('refresh', [ this.tab, this.tabs ]);

				}

			}

		}

	},

	parse: function(url) {

		url = typeof url === 'string' ? url : '';


		return URL.parse(url);

	},

	pause: function() {

		console.log('pause(): IMPLEMENT ME');

	},

	refresh: function() {

		if (this.tab !== null) {
			this.emit('refresh', [ this.tab, this.tabs ]);
		}

	},

	show: function(tab, callback) {

		tab      = tab instanceof Tab           ? tab      : null;
		callback = callback instanceof Function ? callback : null;


		if (tab !== null) {

			if (this.tabs.includes(tab) === false) {
				this.tabs.push(tab);
			}

			if (this.tab !== null) {
				this.emit('hide', [ this.tab, this.tabs ]);
			}

			if (this.tab !== tab) {

				this.tab = tab;
				this.emit('show', [ tab, this.tabs ]);

				if (callback !== null) {
					callback(tab);
				}

			}

			return true;

		} else if (tab === null) {

			if (this.tab !== null) {
				this.emit('hide', [ this.tab, this.tabs ]);
			}

			if (this.tabs.length > 0) {
				this.tab = this.tabs[this.tabs.length - 1];
				this.emit('show', [ this.tab, this.tabs ]);
			} else {
				this.tab = null;
			}

			if (callback !== null) {
				callback(tab);
			}

			return true;

		}


		return false;

	},

	stop: function() {

		console.log('stop(): IMPLEMENT ME');

	},

	open: function(url) {

		url = typeof url === 'string' ? url : null;


		let mode = this.mode;

		if (url !== null) {

			let cfg = this.config(url);
			if (cfg !== null) {
				mode = cfg.mode;
			}

		}


		let tab = this.tabs.find(t => t.url === url) || null;
		if (tab !== null) {

			return tab;

		} else {

			tab = new Tab({
				mode: mode,
				url:  url
			});

			this.tabs.push(tab);
			this.emit('open', [ tab, this.tabs ]);

		}


		return tab;

	},

	setMode: function(mode) {

		mode = typeof mode === 'string' ? mode : null;


		if (mode !== null) {

			mode = mode.toLowerCase();

			let check = Browser.MODES.includes(mode);
			if (check === true) {

				this.mode = mode;

				return true;

			}

		}


		return false;

	}

});


export { Browser };

