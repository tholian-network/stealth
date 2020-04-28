
import { console, Emitter, isArray, isBoolean, isObject, isString } from '../extern/base.mjs';
import { Client                                                   } from './Client.mjs';
import { isTab, Tab                                               } from './Tab.mjs';
import { URL                                                      } from './parser/URL.mjs';



const isConfig = function(config) {

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

			this.settings.modes.forEach((mode) => {

				let tab = this.tabs.find((t) => t.ref.domain === mode.domain) || null;
				if (tab !== null) {

					tab.config = mode;

					if (this.tab === tab) {
						this.emit('change', [ this.tab ]);
					}

				}

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


Browser.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Browser',

	back: function() {

		if (this.tab !== null) {

			let result = this.tab.back();
			if (result === true) {

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

			let ref    = URL.parse(url);
			let domain = ref.domain || null;
			if (domain !== null) {

				let subdomain = ref.subdomain || null;
				if (subdomain !== null) {
					domain = subdomain + '.' + domain;
				}

			}

			let rprotocol = ref.protocol || null;
			if (rprotocol === 'stealth') {

				config.mode.text  = true;
				config.mode.image = true;
				config.mode.audio = true;
				config.mode.video = true;
				config.mode.other = true;

			} else if (domain !== null) {

				let modes = this.settings.modes.filter((m) => domain.endsWith(m.domain));
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

					this.refresh();

					return true;

				}

			} else if (url.startsWith('./') === false && url.startsWith('../') === false) {

				let tab = this.open(url);
				if (tab !== null) {

					let result = tab.navigate(url);
					if (result === true) {
						return this.show(tab);
					}

				}

			}

		}


		return false;

	},

	next: function() {

		if (this.tab !== null) {

			let result = this.tab.next();
			if (result === true) {

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

			let domain = config.domain || null;
			if (domain !== null) {

				let tmp1 = this.get(domain);
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

				if (tmp1.domain === null) {

					config = tmp2;
					this.settings.modes.push(config);
					this.client.services.mode.save(config, () => {});

				} else if (tmp1.domain === tmp2.domain) {

					config = tmp1;

					let diff = false;

					Object.keys(tmp1.mode).forEach((type) => {
						if (tmp1.mode[type] !== tmp2.mode[type]) {
							tmp1.mode[type] = tmp2.mode[type];
							diff = true;
						}
					});

					if (diff === true) {
						this.client.services.mode.save(tmp1, () => {});
					}

				} else if (tmp1.domain !== tmp2.domain) {

					config = tmp2;
					this.settings.modes.push(config);
					this.client.services.mode.save(config, () => {});

				} else {

					config = null;

				}

				if (config !== null) {

					this.tabs.forEach((tab) => {

						let tconfig = tab.config;
						if (tconfig.domain !== null && config.domain !== null) {

							if (
								tconfig.domain === config.domain
								&& tconfig !== config
							) {
								tab.config = config;
							}

						} else if (tconfig.domain === null && config.domain !== null) {

							let tdomain = tab.ref.domain || null;
							if (tdomain !== null) {

								let tsubdomain = tab.ref.subdomain || null;
								if (tsubdomain !== null) {
									tdomain = tsubdomain + '.' + tdomain;
								}

								if (tdomain === config.domain && tconfig !== config) {
									tab.config = config;
								}

							}

						}

					});

					if (this.tab !== null && this.tab.config === config) {
						this.emit('change', [ this.tab ]);
					}

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

