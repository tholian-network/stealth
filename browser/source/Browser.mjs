
import { Emitter } from './Emitter.mjs';
import { Peer    } from './Peer.mjs';
import { Tab     } from './Tab.mjs';



const Browser = function(data) {

	Emitter.call(this);


	let settings = Object.assign({
		host: 'localhost',
		port: 65432
	}, data);


	// TODO: Local DNS resolver with persistent memory
	// that writes automatically to a hosts-file
	// this.dns  = new Nameservice();

	this.tab  = null;

	this.mode = 'offline';
	this.tabs = [];
	this.peer = new Peer({
		host: settings.host,
		port: settings.port
	});

	this.__configs = [{
		domain:    'old.reddit.com',
		texts:     true,
		images:    true,
		videos:    false,
		downloads: true
	}, {
		domain:    'www.reddit.com',
		texts:     false,
		images:    true,
		videos:    true,
		downloads: false
	}, {
		domain:    'qux.reddit.com',
		texts:     false,
		images:    true,
		videos:    true,
		downloads: false
	}, {
		domain:    'bar.qux.reddit.com',
		texts:     false,
		images:    true,
		videos:    true,
		downloads: false
	}];

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

			let domain = null;

			if (url.startsWith('https://') || url.startsWith('http://')) {
				domain = url.split('/').slice(2)[0];
			}

			if (domain !== null) {

				let configs = this.__configs.filter(cfg => domain.endsWith(cfg.domain));
				if (configs.length > 1) {

					return configs.sort((a, b) => {
						if (a.domain.length > b.domain.length) return -1;
						if (b.domain.length > a.domain.length) return  1;
						return 0;
					})[0];

				} else if (configs.length === 1) {

					return configs[0];

				} else {

					let config = {
						domain:    domain,
						texts:     false,
						images:    false,
						videos:    false,
						downloads: false
					};

					let mode = this.mode;
					if (mode === 'online') {
						config.texts     = true;
						config.images    = true;
						config.videos    = true;
						config.downloads = true;
					} else if (mode === 'stealth') {
						config.texts     = true;
						config.images    = true;
						config.videos    = false;
						config.downloads = false;
					} else if (mode === 'covert') {
						config.texts     = true;
						config.images    = false;
						config.videos    = false;
						config.downloads = false;
					} else if (mode === 'offline') {
						// XXX: Don't load anything
					}

					return config;

				}

			}

		}


		return null;

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

				let welcome = this.create('stealth:welcome');
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

			let tab = this.create(url);
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

		let protocol  = null;
		let domain    = null;
		let path      = null;
		let query     = null;
		let subdomain = null;


		let tmp1 = url.split('?')[0] || '';
		let tmp2 = url.split('?')[1] || '';

		if (url.includes('://')) {

			protocol = tmp1.substr(0, tmp1.indexOf('://'));
			domain   = tmp1.substr(protocol.length + 3).split('/')[0];
			path     = '/' + tmp1.substr(protocol.length + 3).split('/').slice(1).join('/');
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('stealth:')) {

			protocol = 'stealth';
			domain   = tmp1.substr(protocol.length + 1).split('/')[0];
			path     = '/' + tmp1.substr(protocol.length + 1).split('/').slice(1).join('/');
			query    = tmp2 !== '' ? tmp2 : null;

		} else {

			domain   = tmp1.split('/')[0];
			path     = '/' + tmp1.split('/').slice(1).join('/');

		}

		if (domain !== null && domain.includes('.') === true) {

			let check = domain.split('.').slice(0, -2);
			if (check.length > 0) {
				domain    = domain.split('.').slice(-2).join('.');
				subdomain = check.join('.');
			}

		}

		return {
			domain:    domain,
			url:       url,
			protocol:  protocol,
			path:      path,
			query:     query,
			subdomain: subdomain
		};

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

	create: function(url) {

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
				peer: this.peer,
				mode: mode,
				url:  url
			});

			this.tabs.push(tab);
			this.emit('create', [ tab, this.tabs ]);

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

