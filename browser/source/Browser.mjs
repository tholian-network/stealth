
import { isFunction, isObject, isString } from './POLYFILLS.mjs';

import { Emitter } from './Emitter.mjs';
import { Client  } from './Client.mjs';
import { Tab     } from './Tab.mjs';
import { URL     } from './parser/URL.mjs';



const Browser = function() {

	Emitter.call(this);


	this.client   = new Client(this);
	this.settings = {
		internet: { connection: 'mobile' },
		filters:  [],
		hosts:    [],
		modes:    [],
		peers:    []
	};
	this.tab      = null;
	this.tabs     = [];

};


Browser.prototype = Object.assign({}, Emitter.prototype, {

	back: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			let index = this.tab.history.indexOf(this.tab.url);
			if (index !== -1) {

				let url = this.tab.history[index - 1] || null;
				if (url !== null) {

					this.tab.url = url;
					this.tab.ref = URL.parse(url);
					this.emit('refresh', [ this.tab, this.tabs, false ]);

					if (callback !== null) {
						callback(true);
					} else {
						return true;
					}

				} else {

					if (callback !== null) {
						callback(false);
					} else {
						return false;
					}

				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	connect: function(host, callback) {

		host     = isString(host)       ? host     : null;
		callback = isFunction(callback) ? callback : null;


		let client = this.client;
		if (client !== null && host !== null) {

			if (callback !== null) {

				client.connect(host, (result) => {

					if (result === true) {

						client.services.settings.read(null, (result) => {
							callback(result !== null);
						});

					} else {

						callback(false);

					}

				});

			} else {

				client.connect(host);

				return true;

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	disconnect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		let client = this.client;
		if (client !== null) {

			if (callback !== null) {

				client.disconnect((result) => {
					callback(result);
				});

			} else {

				client.disconnect();

				return true;

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	download: function(url) {

		// TODO: Implement download() method
		// that spawns a Request on the server
		// via the request service (?) or session service

	},

	execute: function(code, callback) {

		code     = isFunction(code)     ? code     : null;
		callback = isFunction(callback) ? callback : null;


		if (code !== null && callback !== null) {

			this.emit('execute', [ code, (result) => {

				if (result === true) {
					callback(true);
				} else {
					callback(false);
				}

			}]);

		} else if (code !== null) {

			this.emit('execute', [ code, () => {
				// Do nothing
			}]);

			return true;

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	get: function(url, callback) {

		url      = isString(url)        ? url      : null;
		callback = isFunction(callback) ? callback : null;


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


		if (callback !== null) {
			callback(config);
		} else {
			return config;
		}

	},

	kill: function(tab, callback) {

		tab      = tab instanceof Tab   ? tab      : null;
		callback = isFunction(callback) ? callback : null;


		if (tab !== null) {

			if (this.tabs.includes(tab) === true) {

				this.tabs.splice(this.tabs.indexOf(tab), 1);

				if (isFunction(tab.kill)) {
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
				callback(true);
			} else {
				return true;
			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	navigate: function(url, callback) {

		url      = isString(url)        ? url      : null;
		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			if (url.includes('./') || url.includes('../')) {
				url = URL.resolve(this.tab.url, url).url;
			}

			if (this.tab.url !== url) {

				let index1 = this.tab.history.indexOf(this.tab.url);
				if (index1 < this.tab.history.length - 1) {
					this.tab.history.splice(index1 + 1);
				}

				this.tab.url = url;
				this.tab.ref = URL.parse(url);

				let index2 = this.tab.history.indexOf(url);
				if (index2 !== -1) {
					this.tab.history.splice(index2, 1);
				}

				this.tab.history.push(url);

			}

			this.refresh();


			if (callback !== null) {
				callback(true);
			} else {
				return true;
			}

		} else {

			if (url.startsWith('./') || url.startsWith('../')) {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

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


					if (callback !== null) {
						callback(true);
					} else {
						return true;
					}

				} else {

					if (callback !== null) {
						callback(false);
					} else {
						return false;
					}

				}

			}

		}

	},

	next: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			let index = this.tab.history.indexOf(this.tab.url);
			if (index !== -1) {

				let url = this.tab.history[index + 1] || null;
				if (url !== null) {

					this.tab.url = url;
					this.tab.ref = URL.parse(url);
					this.emit('refresh', [ this.tab, this.tabs, false ]);

					if (callback !== null) {
						callback(true);
					} else {
						return true;
					}

				} else {

					if (callback !== null) {
						callback(false);
					} else {
						return false;
					}

				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}
		}

	},

	open: function(url, callback) {

		url      = isString(url)        ? url      : null;
		callback = isFunction(callback) ? callback : null;


		if (url !== null) {

			let ref = URL.parse(url);
			let tab = this.tabs.find((t) => t.url === ref.url) || null;
			if (tab !== null) {

				if (callback !== null) {
					callback(tab);
				} else {
					return tab;
				}

			} else {

				tab = new Tab({
					config: this.get(ref.url),
					ref:    ref,
					url:    ref.url
				});

				this.tabs.push(tab);
				this.emit('open', [ tab, this.tabs ]);


				if (callback !== null) {
					callback(tab);
				} else {
					return tab;
				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	},

	pause: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			this.emit('pause', [ this.tab, this.tabs, true ]);

			if (callback !== null) {
				callback(true);
			} else {
				return true;
			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	refresh: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			this.emit('refresh', [ this.tab, this.tabs, true ]);

			if (callback !== null) {
				callback(true);
			} else {
				return true;
			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	set: function(config, callback) {

		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;


		if (config !== null && isObject(config.mode)) {

			let domain = config.domain || null;
			if (domain !== null) {

				let tmp1 = this.get(domain);
				let tmp2 = {
					domain: config.domain,
					mode:   {
						text:  false,
						image: false,
						audio: false,
						video: false,
						other: false
					}
				};

				Object.keys(config.mode).forEach((type) => {
					tmp2.mode[type] = config.mode[type] === true;
				});


				config = null;

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


				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	show: function(tab, callback) {

		tab      = tab instanceof Tab   ? tab      : null;
		callback = isFunction(callback) ? callback : null;


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


			if (callback !== null) {
				callback(tab);
			} else {
				return tab;
			}

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
				callback(this.tab);
			} else {
				return this.tab;
			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	}

});


export { Browser };

