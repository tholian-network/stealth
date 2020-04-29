
import { console, Emitter, isArray, isBoolean, isObject, isString } from '../extern/base.mjs';
import { Client                                                   } from './Client.mjs';
import { isTab, Tab                                               } from './Tab.mjs';
import { URL                                                      } from './parser/URL.mjs';



export const isBrowser = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Browser]';
};

export const isConfig = function(config) {

	if (isObject(config) === true) {

		if (
			(isString(config.domain) === true || config.domain === null)
			&& isObject(config.mode) === true
		) {

			if (
				isBoolean(config.mode.text) === true
				&& isBoolean(config.mode.image) === true
				&& isBoolean(config.mode.audio) === true
				&& isBoolean(config.mode.video) === true
				&& isBoolean(config.mode.other) === true
			) {
				return true;
			}

		}

	}


	return false;

};

const on_mode_change = function(config) {

	let changed   = false;
	let identical = this.tabs.filter((t) => t.config.domain === config.domain);
	let similar   = this.tabs.filter((t) => URL.isDomain(config.domain, t.ref));

	if (similar.length > 0) {

		similar.forEach((tab) => {

			if (identical.includes(tab) === false) {

				if (tab.config.domain.length < config.domain.length) {

					tab.set(config);

					if (tab === this.tab) {
						changed = true;
					}

				}

			}

		});

	}

	if (identical.length > 0) {

		identical.forEach((tab) => {

			if (tab.config !== config) {

				tab.set(config);

				if (tab === this.tab) {
					changed = true;
				}
			}

		});

	}

	if (changed === true) {
		this.emit('change', [ this.tab ]);
	}

};



const Browser = function(settings) {

	this._settings = Object.freeze(Object.assign({
		debug: false,
		host:  'localhost'
	}, settings));

	this.client   = new Client({
		host: this._settings.host
	}, this);
	this.settings = {
		internet: { connection: 'mobile' },
		hosts:    [],
		modes:    [],
		peers:    [],
		sessions: []
	};
	this.tab      = null;
	this.tabs     = [];

	this.__state = {
		connected: false
	};


	Emitter.call(this);


	this.client.services.settings.on('read', (response) => {

		if (isObject(response.internet) === true) {
			this.settings.internet = response.internet;
		}

		if (isArray(response.hosts) === true) {
			this.settings.hosts = response.hosts;
		}

		if (isArray(response.modes) === true) {

			this.settings.modes = response.modes;

			this.settings.modes.forEach((config) => {
				on_mode_change.call(this, config);
			});

		}

		if (isArray(response.peers) === true) {
			this.settings.peers = response.peers;
		}

		if (isArray(response.sessions) === true) {
			this.settings.sessions = response.sessions;
		}

	});

	this.on('connect', () => {

		this.client.services.settings.read(null, () => {

			if (this._settings.debug === true) {
				console.info('Browser: Settings loaded from "' + this._settings.host + '".');
			}

		});

	});

};


Browser.isBrowser = isBrowser;
Browser.isConfig  = isConfig;


Browser.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Browser',

	back: function() {

		if (this.tab !== null) {

			let result = this.tab.back();
			if (result === true) {

				this.tab.set(this.get(this.tab.url));

				this.emit('refresh', [ this.tab, this.tabs, false ]);

				return true;

			}

		}


		return false;

	},

	close: function(tab) {

		tab = isTab(tab) ? tab : null;


		if (tab !== null) {

			if (this.tabs.includes(tab) === true) {

				this.tabs.splice(this.tabs.indexOf(tab), 1);

				tab.destroy();

			}

			this.emit('close', [ tab, this.tabs ]);

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


			return true;

		}


		return false;

	},

	connect: function() {

		if (this.__state.connected === false) {

			this.client.once('connect', () => {

				this.__state.connected = true;
				this.emit('connect');

			});

			this.client.once('disconnect', () => {

				this.__state.connected = false;
				this.emit('disconnect');

			});

			let result = this.client.connect();
			if (result === true) {
				return true;
			}

		}


		return false;

	},

	destroy: function() {

		if (this.__state.connected === true) {
			return this.disconnect();
		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			this.client.disconnect();

			return true;

		}


		return false;

	},

	download: function(url) {

		url = URL.isURL(URL.parse(url)) ? url : null;


		if (url !== null) {

			if (this.__state.connected === true) {

				this.client.services.session.download(URL.parse(url), (response) => {
					this.emit('download', [ response ]);
				});

				return true;

			}

		}


		return false;

	},

	get: function(url) {

		url = isString(url) ? url : null;


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

			let domain = null;

			let ref = URL.parse(url);
			if (ref.domain !== null) {

				if (ref.subdomain !== null) {
					domain = ref.subdomain + '.' + ref.domain;
				} else {
					domain = ref.domain;
				}

			} else if (ref.host !== null) {
				domain = ref.host;
			}

			if (ref.protocol === 'stealth') {

				config.mode.text  = true;
				config.mode.image = true;
				config.mode.audio = true;
				config.mode.video = true;
				config.mode.other = true;

			} else if (domain !== null) {

				let modes = this.settings.modes.filter((m) => URL.isDomain(m.domain, domain));
				if (modes.length > 1) {

					return modes.sort((a, b) => {
						if (a.domain.length > b.domain.length) return -1;
						if (b.domain.length > a.domain.length) return  1;
						return 0;
					})[0];

				} else if (modes.length === 1) {

					return modes[0];

				} else {

					config.domain = domain;

				}

			}

		}

		return config;

	},

	is: function(state) {

		state = isString(state) ? state : null;


		if (state === 'connected') {

			if (this.__state.connected === true) {
				return true;
			}

		}


		return false;

	},

	navigate: function(url) {

		url = isString(url) ? url : null;


		if (url !== null) {

			if (this.tab !== null) {

				let result = this.tab.navigate(url);
				if (result === true) {

					this.tab.set(this.get(url));
					this.refresh();

					return true;

				} else {

					let tab = this.open(url);
					if (tab !== null) {

						tab.set(this.get(url));

						if (this.tab !== tab) {
							this.show(tab);
						}

						return true;

					}

				}

			} else if (url.startsWith('./') === false && url.startsWith('../') === false) {

				let tab = this.open(url);
				if (tab !== null) {

					tab.set(this.get(url));

					if (this.tab !== tab) {
						this.show(tab);
					}

					return true;

				}

			}

		}


		return false;

	},

	next: function() {

		if (this.tab !== null) {

			let result = this.tab.next();
			if (result === true) {

				this.tab.set(this.get(this.tab.url));

				this.emit('refresh', [ this.tab, this.tabs, false ]);

				return true;

			}

		}


		return false;

	},

	open: function(url) {

		url = isString(url) ? url : null;


		if (url !== null) {

			let ref = URL.parse(url);
			let tab = this.tabs.find((t) => t.url === ref.url) || null;
			if (tab === null) {

				tab = new Tab({
					config: this.get(ref.url),
					ref:    ref,
					url:    ref.url
				});

				this.tabs.push(tab);
				this.emit('open', [ tab, this.tabs ]);

			}

			return tab;

		}


		return null;

	},

	pause: function() {

		if (this.tab !== null) {

			let result = this.tab.pause();
			if (result === true) {

				this.emit('pause', [ this.tab, this.tabs, true ]);

				return true;

			}

		}


		return false;

	},

	refresh: function() {

		if (this.tab !== null) {

			this.emit('refresh', [ this.tab, this.tabs, true ]);

			return true;

		}


		return false;

	},

	set: function(config) {

		config = isConfig(config) ? config : null;


		if (config !== null) {

			if (config.domain !== null) {

				let tmp1 = this.get(config.domain);
				let tmp2 = {
					domain: config.domain,
					mode:   {
						text:  config.mode.text,
						image: config.mode.image,
						audio: config.mode.audio,
						video: config.mode.video,
						other: config.mode.other
					}
				};

				if (tmp1.domain === tmp2.domain) {

					let diff = false;

					Object.keys(tmp1.mode).forEach((type) => {
						if (tmp1.mode[type] !== tmp2.mode[type]) {
							tmp1.mode[type] = tmp2.mode[type];
							diff = true;
						}
					});

					if (diff === true) {
						config = tmp1;
					}

				} else if (tmp2.domain.length > tmp1.domain.length) {

					config = tmp2;

				} else {

					config = null;

				}

				if (config !== null) {

					if (this.settings.modes.includes(config) === false) {
						this.settings.modes.push(config);
						this.client.services.mode.save(config, () => {});
					}

					on_mode_change.call(this, config);

				}

				return true;

			}

		}


		return false;

	},

	show: function(tab) {

		tab = isTab(tab) ? tab : null;


		if (tab !== null) {

			if (this.tabs.includes(tab) === false) {
				this.tabs.push(tab);
			}

			if (this.tab !== null) {
				this.emit('hide', [ this.tab, this.tabs ]);
			}

			if (this.tab !== tab) {
				this.tab = tab;
				this.emit('show', [ this.tab, this.tabs ]);
			}

			return tab;

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

			return this.tab;

		}


		return null;

	}

});


export { Browser };

