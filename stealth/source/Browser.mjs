
import { console, Emitter, isArray, isBoolean, isFunction, isObject, isString } from '../extern/base.mjs';
import { Client                                                               } from '../source/Client.mjs';
import { isTab, Tab                                                           } from '../source/Tab.mjs';
import { URL                                                                  } from '../source/parser/URL.mjs';



export const isBrowser = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Browser]';
};

export const isMode = function(payload) {

	if (
		isObject(payload) === true
		&& (isString(payload.domain) === true || payload.domain === null)
		&& isObject(payload.mode) === true
		&& isBoolean(payload.mode.text) === true
		&& isBoolean(payload.mode.image) === true
		&& isBoolean(payload.mode.audio) === true
		&& isBoolean(payload.mode.video) === true
		&& isBoolean(payload.mode.other) === true
	) {
		return true;
	}


	return false;

};

const toMode = function(url) {

	url = URL.isURL(url) ? url : null;


	let mode = {
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

		let search = URL.toDomain(url);

		if (url.protocol === 'stealth') {

			mode.domain     = search;
			mode.mode.text  = true;
			mode.mode.image = true;
			mode.mode.audio = true;
			mode.mode.video = true;
			mode.mode.other = true;

		} else if (search !== null) {

			let modes = this.settings.modes.filter((m) => URL.isDomain(m.domain, search));
			if (modes.length > 1) {

				return modes.sort((a, b) => {
					if (a.domain.length > b.domain.length) return -1;
					if (b.domain.length > a.domain.length) return  1;
					return 0;
				})[0];

			} else if (modes.length === 1) {

				return modes[0];

			} else {

				mode.domain = search;

			}

		}

	}

	return mode;

};

const on_mode_change = function(mode) {

	this.tabs.forEach((tab) => {

		let changed = false;

		tab.history.forEach((entry) => {

			if (entry.mode.domain === mode.domain) {
				entry.mode = mode;
				changed    = true;
			}

		});

		if (tab.mode.domain === mode.domain) {
			tab.mode = mode;
			changed  = true;
		}

		if (changed === true && this.tab === tab) {
			this.emit('change', [ this.tab ]);
		}

	});

};



const Browser = function(settings) {

	settings = isObject(settings) ? settings : {};


	this._settings = Object.freeze(Object.assign({
		debug: false,
		host:  'localhost'
	}, settings));

	this.client   = new Client({
		host: this._settings.host
	}, this);
	this.settings = {
		'interface': {
			assistant: false,
			theme:     'dark',
			enforce:   false,
			opentab:   'stealth:welcome'
		},
		'internet':  {
			connection: 'mobile',
			history:    'stealth',
			useragent:  'stealth'
		},
		'beacons':   [],
		'blockers':  [],
		'hosts':     [],
		'modes':     [],
		'peers':     [],
		'policies':  [],
		'redirects': [],
		'sessions':  []
	};
	this.tab      = null;
	this.tabs     = [];

	this.__state = {
		connected: false,
		reconnect: 0
	};


	Emitter.call(this);


	this.client.services.settings.on('read', (response) => {

		if (isObject(response['interface']) === true) {

			let old_theme = this.settings['interface'].theme;
			let new_theme = response['interface'].theme;

			if (old_theme !== new_theme) {
				this.emit('theme', [ new_theme ]);
			}

			this.settings['interface'] = response['interface'];

		}

		if (isObject(response['internet']) === true) {
			this.settings['internet'] = response['internet'];
		}

		if (isArray(response['beacons']) === true) {
			this.settings['beacons'] = response['beacons'];
		}

		if (isArray(response['blockers']) === true) {
			this.settings['blockers'] = response['blockers'];
		}

		if (isArray(response['hosts']) === true) {
			this.settings['hosts'] = response['hosts'];
		}

		if (isArray(response['modes']) === true) {

			this.settings['modes'] = response['modes'];

			this.settings['modes'].forEach((mode) => {
				on_mode_change.call(this, mode);
			});

		}

		if (isArray(response['peers']) === true) {
			this.settings['peers'] = response['peers'];
		}

		if (isArray(response['policies']) === true) {
			this.settings['policies'] = response['policies'];
		}

		if (isArray(response['redirects']) === true) {
			this.settings['redirects'] = response['redirects'];
		}

		if (isArray(response['sessions']) === true) {
			this.settings['sessions'] = response['sessions'];
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


Browser.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Browser' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {

			let browser = new Browser({
				debug: isBoolean(data.debug) ? data.debug : null,
				host:  isString(data.host)   ? data.host  : null
			});

			return browser;

		}

	}


	return null;

};


Browser.isBrowser = isBrowser;
Browser.isMode    = isMode;


Browser.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Browser',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			client:   null,
			events:   blob.data.events,
			journal:  blob.data.journal,
			settings: Object.assign({}, this._settings),
			state:    {
				connected: false,
				reconnect: 0
			}
		};

		if (this.client !== null) {
			data.client = this.client.toJSON();
		}

		if (this.__state.connected === true) {
			data.state.connected = true;
		}

		if (this.__state.reconnect > 0) {
			data.state.reconnect = this.__state.reconnect;
		}

		return {
			'type': 'Browser',
			'data': data
		};

	},

	back: function() {

		if (this.tab !== null) {

			let result = this.tab.back();
			if (result === true) {

				this.emit('refresh', [ this.tab, this.tabs ]);

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

				let tab = this.open(this.settings['interface'].opentab);
				if (tab !== null) {
					this.show(tab);
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

				this.client.off('connect');

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

	download: function(link, callback) {

		link     = isString(link)       ? link     : null;
		callback = isFunction(callback) ? callback : null;


		if (link !== null) {

			let url = URL.parse(link);

			if (
				URL.isURL(url) === true
				&& (url.protocol === 'https' || url.protocol === 'http')
				&& this.__state.connected === true
			) {

				if (callback !== null) {

					setTimeout(() => {

						this.client.services.session.download(url, (response) => {
							callback(response);
						});

					}, 0);

				} else {

					setTimeout(() => {

						this.client.services.session.download(url, (response) => {
							this.emit('download', [ response ]);
						});

					}, 0);

				}

				return true;

			} else {

				if (callback !== null) {
					callback(null);
				}

				return false;

			}

		} else {

			if (callback !== null) {
				callback(null);
			}

			return false;

		}

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

	navigate: function(link) {

		link = isString(link) ? link : null;


		if (link !== null) {

			if (this.tab !== null) {

				let result = this.tab.navigate(link, toMode.call(this, URL.parse(link)));
				if (result === true) {

					this.emit('refresh', [ this.tab, this.tabs ]);

					return true;

				} else {

					let tab = this.open(link);
					if (tab !== null) {

						if (this.tab !== tab) {
							this.show(tab);
						}

						return true;

					}

				}

			} else if (link.startsWith('./') === false && link.startsWith('../') === false) {

				let tab = this.open(link);
				if (tab !== null) {

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

				this.emit('refresh', [ this.tab, this.tabs ]);

				return true;

			}

		}


		return false;

	},

	open: function(link) {

		link = isString(link) ? link : null;


		if (link !== null) {

			let url = URL.parse(link);
			let tab = this.tabs.find((t) => t.url.link === url.link) || null;
			if (tab === null) {

				tab = new Tab({
					mode: toMode.call(this, url),
					url:  url
				});

				this.tabs.push(tab);
				this.emit('open', [ tab, this.tabs ]);

			}

			return tab;

		}


		return null;

	},

	reconnect: function() {

		if (this.__state.connected === false) {

			let reconnect = this.__state.reconnect++;

			setTimeout(() => {

				if (this.__state.connected === false) {

					this.client.once('connect', () => {

						this.__state.connected = true;
						this.__state.reconnect = 0;

						this.emit('connect');

					});

					this.client.once('disconnect', () => {

						this.client.off('connect');

						this.__state.connected = false;
						this.emit('disconnect');

					});

					this.client.connect();

				}

			}, reconnect * 30000);

			return true;

		}


		return false;

	},

	reload: function() {

		if (this.tab !== null) {

			// TODO: Re-request this.tab.url via Service API

			return true;

		}


		return false;

	},

	getMode: function(link) {

		link = isString(link) ? link : null;


		if (link !== null) {

			let url  = URL.parse(link);
			let mode = toMode.call(this, url);
			if (mode !== null) {
				return mode;
			}

		}


		return null;

	},

	setMode: function(mode) {

		mode = isMode(mode) ? mode : null;


		if (mode !== null) {

			if (mode.domain !== null) {

				let tmp1 = toMode.call(this, URL.parse('https://' + mode.domain + '/'));
				let tmp2 = {
					domain: mode.domain,
					mode:   {
						text:  mode.mode.text,
						image: mode.mode.image,
						audio: mode.mode.audio,
						video: mode.mode.video,
						other: mode.mode.other
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
						mode = tmp1;
					}

				} else if (URL.isDomain(tmp1.domain, tmp2.domain)) {

					mode = tmp2;

				} else {

					mode = null;

				}


				if (mode !== null) {

					if (this.settings.modes.includes(mode) === false) {
						this.settings.modes.push(mode);
					}

					this.client.services.mode.save(mode, () => {});
					on_mode_change.call(this, mode);

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

