
import { isBoolean, isObject, isString } from './BASE.mjs';
import { Emitter                       } from './Emitter.mjs';
import { URL                           } from './parser/URL.mjs';
import { Blocker                       } from './request/Blocker.mjs';
import { Downloader                    } from './request/Downloader.mjs';
import { Filter                        } from './request/Filter.mjs';
import { Optimizer                     } from './request/Optimizer.mjs';



const Request = function(data, stealth) {

	let settings = Object.assign({}, data);


	Emitter.call(this);


	this.id       = 'request-' + Date.now();
	this.url      = null;
	this.config   = settings.config || {
		domain: null,
		mode:   {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};
	this.download = null;
	this.flags    = {
		connect:   true,
		refresh:   false,
		useragent: null,
		webview:   false
	};
	this.ref      = null;
	this.response = null;
	this.retries  = 0;
	this.stealth  = stealth;
	this.timeline = {

		// error workflow
		error:    null,
		kill:     null,
		redirect: null,

		// response workflow
		init:     null,
		cache:    null,
		stash:    null,
		block:    null,
		mode:     null,
		filter:   null,
		connect:  null,
		download: null,
		optimize: null,
		response: null

	};


	let ref = settings.ref || null;
	let url = settings.url || null;

	if (ref !== null) {

		this.ref = ref;
		this.url = this.ref.url;

	} else if (url !== null) {

		this.ref = URL.parse(url);
		this.url = this.ref.url;

	}


	if (this.stealth.settings.internet.connection === 'i2p') {
		this.ref.proxy = { host: '127.0.0.1', port: 4444 };
	} else if (this.stealth.settings.internet.connection === 'tor') {
		this.ref.proxy = { host: '127.0.0.1', port: 9050 };
	}


	this.on('init', () => {

		this.timeline.init = Date.now();

		this.stealth.server.services.redirect.read(this.ref, (redirect) => {

			let payload = redirect.payload || null;
			if (payload !== null) {

				this.emit('redirect', [{
					headers: { location: payload.location },
					payload: null
				}, true ]);

			} else {
				this.emit('cache');
			}

		});

	});

	this.on('cache', () => {

		if (this.flags.refresh === true) {

			this.emit('stash');

		} else {

			this.stealth.server.services.cache.read(this.ref, (response) => {

				this.timeline.cache = Date.now();

				if (response.payload !== null) {
					this.response = response.payload;
					this.emit('response', [ this.response ]);
				} else {
					this.emit('stash');
				}

			});

		}

	});

	this.on('stash', () => {

		if (this.flags.refresh === true) {

			this.emit('block');

		} else {

			this.stealth.server.services.stash.read(this.ref, (response) => {

				this.timeline.stash = Date.now();

				if (response.payload !== null) {

					if (response.payload.headers !== null) {

						delete response.payload.headers['service'];
						delete response.payload.headers['event'];
						delete response.payload.headers['method'];

						if (Object.keys(response.payload.headers).length > 0) {
							this.ref.headers = response.payload.headers;
						}

					}

					if (response.payload.payload !== null) {
						this.ref.payload = response.payload.payload;
					}

				}

				this.emit('block');

			});

		}

	});

	this.on('block', () => {

		Blocker.check(this.stealth.settings.blockers, this.ref, (blocked) => {

			this.timeline.block = Date.now();

			if (blocked === true) {

				// Always Block, no matter the User's Config
				this.config.mode.text  = false;
				this.config.mode.image = false;
				this.config.mode.audio = false;
				this.config.mode.video = false;
				this.config.mode.other = false;

				this.emit('error', [{ code: 403 }]);

			} else {
				this.emit('mode');
			}

		});

	});

	this.on('mode', () => {

		let mime    = this.ref.mime;
		let allowed = this.config.mode[mime.type] === true;

		this.timeline.mode = Date.now();

		if (allowed === true) {
			this.emit('filter');
		} else if (this.flags.webview === true) {
			this.emit('error', [{ type: 'mode' }]);
		} else {
			this.emit('error', [{ code: 403 }]);
		}

	});

	this.on('filter', () => {

		Filter.check(this.stealth.settings.filters, this.ref, (allowed) => {

			this.timeline.filter = Date.now();

			if (allowed === true) {

				if (this.flags.connect === true) {
					this.emit('connect');
				} else {
					// External Scheduler calls emit('connect')
				}

			} else if (this.ref.mime.ext === 'html') {
				this.emit('error', [{ type: 'filter' }]);
			} else {
				this.emit('error', [{ code: 403 }]);
			}

		});

	});

	this.on('connect', () => {

		if (this.ref.hosts.length > 0) {

			this.timeline.connect = Date.now();
			this.emit('download');

		} else {

			this.timeline.connect = Date.now();

			this.stealth.server.services.host.read({
				domain:    this.ref.domain,
				subdomain: this.ref.subdomain
			}, (response) => {

				if (response.payload !== null) {

					response.payload.hosts.forEach((host) => {

						let check = this.ref.hosts.find((h) => h.ip === host.ip) || null;
						if (check === null) {
							this.ref.hosts.push(host);
						}

					});

				}

				if (this.ref.hosts.length > 0) {
					this.emit('download');
				} else {
					this.emit('error', [{ type: 'host' }]);
				}

			});

		}

	});

	this.on('download', () => {

		let useragent = this.get('useragent');
		if (useragent !== null) {

			if (this.ref.headers === null) {
				this.ref.headers = {};
			}

			if (this.ref.mime !== null) {
				this.ref.headers['accept'] = this.ref.mime.format;
			} else {
				this.ref.headers['accept'] = '*/*';
			}

			this.ref.headers['user-agent'] = useragent;

		} else {

			if (this.ref.headers !== null) {

				if (this.ref.headers['user-agent'] !== undefined) {
					delete this.ref.headers['user-agent'];
				}

				if (this.ref.headers['accept'] !== undefined) {
					delete this.ref.headers['accept'];
				}

			}

		}


		Downloader.check(this.ref, this.config, (result) => {

			if (result === true) {

				Downloader.download(this.ref, this.config, (download) => {

					this.timeline.download = Date.now();

					if (download !== null) {

						this.download = download;

						download.on('progress', (partial, progress) => {

							this.stealth.server.services.stash.save(Object.assign({}, this.ref, partial), () => {
								this.emit('progress', [ partial, progress ]);
							});

						});

						download.on('timeout', (partial) => {

							if (partial !== null) {

								this.retries++;

								if (this.retries < 10) {

									this.stealth.server.services.stash.save(Object.assign({}, this.ref, partial), (result) => {

										if (result === true) {

											this.ref.headers = partial.headers;
											this.ref.payload = partial.payload;
											this.emit('download');

										}

									});

								} else {
									this.emit('error', [{ type: 'request', cause: 'socket-stability' }]);
								}

							} else {
								this.emit('error', [{ type: 'request', cause: 'socket-timeout' }]);
							}

						});

						download.on('error', (error) => {

							this.download = null;

							if (error.type === 'stash') {

								this.stealth.server.services.stash.remove(this.ref, () => {

									this.ref.headers = null;
									this.ref.payload = null;
									this.emit('download');

								});

							} else {
								this.emit('error', [ error ]);
							}

						});

						download.on('redirect', (response) => {

							this.download = null;

							this.stealth.server.services.stash.remove(this.ref, () => {

								let location = response.headers['location'] || null;
								if (location !== null) {
									this.emit('redirect', [ response, false ]);
								} else {
									this.emit('error', [{ type: 'request', cause: 'headers-location' }]);
								}

							});

						});

						download.on('response', (response) => {

							this.download = null;

							this.stealth.server.services.stash.remove(this.ref, () => {
								this.ref.headers = null;
								this.ref.payload = null;
							});

							this.response = response;
							this.emit('optimize');

						});

						download.init();

					} else {
						this.emit('error', [{ code: 403 }]);
					}

				});

			} else {
				this.emit('error', [{ code: 403 }]);
			}

		});

	});

	this.on('optimize', () => {

		/* IGNORE OPTIMIZE EVENT FOR NAO */

		this.emit('response', [ this.response ]);

		// let url = URL.render(this.ref);
		// let ref = URL.parse(url);

		// ref.headers = this.response.headers;
		// ref.payload = this.response.payload;


		// Optimizer.check(ref, this.config, (result) => {

		// 	this.timeline.optimize = Date.now();

		// 	if (result === true) {

		// 		Optimizer.optimize(ref, this.config, (response) => {

		// 			if (response !== null) {
		// 				this.emit('response', [ response ]);
		// 			} else {
		// 				this.emit('response', [ this.response ]);
		// 			}

		// 		});

		// 	} else {
		// 		this.emit('response', [ this.response ]);
		// 	}

		// });

	});

	this.on('redirect', (response, ignore) => {

		ignore = typeof ignore === 'boolean' ? ignore : false;


		if (ignore === true) {

			// Do nothing

		} else if (response !== null && response.headers !== null) {

			this.timeline.redirect = Date.now();

			let location = response.headers['location'] || null;
			if (location !== null) {

				this.stealth.server.services.redirect.save(Object.assign({}, this.ref, {
					location: location
				}), () => {});

			}

		}

	});

	this.on('response', (response) => {

		if (response !== null && response.payload !== null) {

			this.timeline.response = Date.now();

			if (this.response !== response) {
				this.response = response;
			}

			this.stealth.server.services.cache.save(Object.assign({}, this.ref, response), (result) => {

				if (result === true) {

					this.stealth.server.services.stash.remove(this.ref, (result) => {

						if (result === true) {
							this.ref.headers = null;
							this.ref.payload = null;
						}

					});

				}

			});

		}

	});

};


Request.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Request' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {

			let request = new Request();

			if (isString(data.id))  request.id  = data.id;
			if (isString(data.url)) request.url = data.url;

			if (isObject(data.config)) {

				if (isString(data.config.domain)) {
					request.config.domain = data.config.domain;
				}

				if (isObject(data.config.mode)) {

					Object.keys(request.config.mode).forEach((key) => {

						let mode = data.config.mode[key] || null;
						if (isBoolean(mode)) {
							request.config.mode[key] = mode;
						}

					});

				}

			}

			if (isObject(data.flags)) {

				Object.keys(data.flags).forEach((key) => {

					let flag = data.flags[key];
					if (isBoolean(flag)) {
						request.flags[key] = flag;
					}

				});

			}

			return request;

		}

	}


	return null;

};


Request.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Request',

	toJSON: function() {

		let data = {
			id:       this.id,
			url:      this.url,
			config:   {
				domain: this.config.domain,
				mode:   Object.assign({}, this.config.mode)
			},
			download: null,
			flags:    Object.assign({}, this.flags),
			timeline: Object.assign({}, this.timeline)
		};

		if (this.download !== null) {
			data.download = this.download.toJSON();
		}

		return {
			type: 'Request',
			data: data
		};

	},

	get: function(key) {

		key = isString(key) ? key : null;


		if (key !== null) {

			let value = this.flags[key];
			if (value !== undefined) {
				return value;
			}

		}


		return null;

	},

	init: function() {

		if (this.timeline.init === null) {
			this.emit('init');
		}

	},

	set: function(key, val) {

		key = isString(key)                   ? key : null;
		val = isBoolean(val) || isString(val) ? val : null;


		if (key !== null) {

			let exists = this.flags[key] !== undefined;
			if (exists === true) {

				this.flags[key] = val;

				return true;

			}

		}


		return false;

	},

	kill: function() {

		if (this.timeline.kill === null) {
			this.timeline.kill = Date.now();
		}


		if (this.timeline.download !== null) {

			let download = this.download || null;
			if (download !== null) {
				download.kill();
				this.download = null;
			}

		}

	}

});


export { Request };

