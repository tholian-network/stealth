
import { Emitter, isBoolean, isObject, isString } from '../extern/base.mjs';
import { isServer                               } from './Server.mjs';
import { URL                                    } from './parser/URL.mjs';
import { Downloader                             } from './request/Downloader.mjs';



// Embedded for Cross-Platform Compatibility
const isMode = function(payload) {

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

export const isRequest = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Request]';
};



const Request = function(data, server) {

	data   = isObject(data)   ? data   : {};
	server = isServer(server) ? server : null;


	if (isMode(data.mode) === true) {
		this.mode = data.mode;
	} else {
		this.mode = {
			domain: null,
			mode:   {
				text:  false,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		};
	}

	if (URL.isURL(data.url) === true) {
		this.url = data.url;
	} else {
		this.url = null;
	}


	if (isServer(server) === true) {
		this.server = server;
	} else {
		this.server = null;
	}



	this.download = null;
	this.flags    = {
		connect:   true,
		proxy:     false,
		refresh:   false,
		useragent: null,
		webview:   false
	};
	this.response = null;
	this.retries  = 0;
	this.timeline = {

		// error workflow
		error:    null,
		stop:     null,
		redirect: null,

		// response workflow
		start:    null,
		cache:    null,
		stash:    null,
		block:    null,
		mode:     null,
		connect:  null,
		download: null,
		optimize: null,
		response: null

	};


	Emitter.call(this);

	this.on('start', () => {

		this.timeline.start = Date.now();

		if (this.server !== null) {

			this.server.services.redirect.read(this.url, (redirect) => {

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

		} else {

			this.emit('cache');

		}

	});

	this.on('stop', () => {

		this.timeline.stop = Date.now();

		if (this.download !== null) {

			this.download.stop();
			this.download = null;

		}

	});

	this.on('cache', () => {

		if (this.flags.refresh === true) {

			this.emit('stash');

		} else {

			if (this.server !== null) {

				this.server.services.cache.read(this.url, (response) => {

					this.timeline.cache = Date.now();

					if (response.payload !== null) {
						this.response = response.payload;
						this.emit('response', [ this.response ]);
					} else {
						this.emit('stash');
					}

				});

			} else {

				this.timeline.cache = Date.now();
				this.emit('stash');

			}

		}

	});

	this.on('stash', () => {

		if (this.flags.refresh === true) {

			this.emit('block');

		} else {

			if (this.server !== null) {

				this.server.services.stash.read(this.url, (response) => {

					this.timeline.stash = Date.now();

					if (response.payload !== null) {

						if (response.payload.headers !== null) {

							delete response.payload.headers['service'];
							delete response.payload.headers['event'];
							delete response.payload.headers['method'];

							if (Object.keys(response.payload.headers).length > 0) {
								this.url.headers = response.payload.headers;
							}

						}

						if (response.payload.payload !== null) {
							this.url.payload = response.payload.payload;
						}

					}

					this.emit('block');

				});

			} else {

				this.timeline.stash = Date.now();
				this.emit('block');

			}

		}

	});

	this.on('block', () => {

		this.timeline.block = Date.now();

		if (this.server !== null) {

			this.server.services.blocker.read({
				domain:    this.url.domain,
				subdomain: this.url.subdomain,
				host:      this.url.host
			}, (response) => {

				if (response.payload !== null) {

					// Always Block, no matter the User's Mode
					this.mode.mode.text  = false;
					this.mode.mode.image = false;
					this.mode.mode.audio = false;
					this.mode.mode.video = false;
					this.mode.mode.other = false;

					this.emit('error', [{ code: 403 }]);

				} else {
					this.emit('mode');
				}

			});

		} else {
			this.emit('mode');
		}

	});

	this.on('mode', () => {

		let mime    = this.url.mime;
		let allowed = this.mode.mode[mime.type] === true;

		this.timeline.mode = Date.now();

		if (allowed === true) {

			if (this.flags.connect === true) {
				this.emit('connect');
			} else {
				// External Scheduler calls emit('connect')
			}

		} else if (this.flags.webview === true) {
			this.emit('error', [{ type: 'mode' }]);
		} else {
			this.emit('error', [{ code: 403 }]);
		}

	});

	this.on('connect', () => {

		if (this.url.hosts.length > 0) {

			this.timeline.connect = Date.now();
			this.emit('download');

		} else {

			this.timeline.connect = Date.now();

			if (this.server !== null) {

				this.server.services.host.read({
					domain:    this.url.domain,
					subdomain: this.url.subdomain
				}, (response) => {

					if (response.payload !== null) {

						response.payload.hosts.forEach((host) => {

							let check = this.url.hosts.find((h) => h.ip === host.ip) || null;
							if (check === null) {
								this.url.hosts.push(host);
							}

						});

					}

					if (this.url.hosts.length > 0) {
						this.emit('download');
					} else {
						this.emit('error', [{ type: 'host' }]);
					}

				});

			} else {

				if (this.url.hosts.length > 0) {
					this.emit('download');
				} else {
					this.emit('error', [{ type: 'host' }]);
				}

			}

		}

	});

	this.on('download', () => {

		let useragent = this.get('useragent');
		if (useragent !== null) {

			if (this.url.headers === null) {
				this.url.headers = {};
			}

			if (this.url.mime !== null) {
				this.url.headers['accept'] = this.url.mime.format;
			} else {
				this.url.headers['accept'] = '*/*';
			}

			this.url.headers['user-agent'] = useragent;

		} else {

			if (this.url.headers !== null) {

				if (this.url.headers['user-agent'] !== undefined) {
					delete this.url.headers['user-agent'];
				}

				if (this.url.headers['accept'] !== undefined) {
					delete this.url.headers['accept'];
				}

			}

		}


		Downloader.check(this.url, this.mode, (result) => {

			if (result === true) {

				Downloader.download(this.url, this.mode, (download) => {

					this.timeline.download = Date.now();

					if (download !== null) {

						this.download = download;

						download.on('progress', (partial, progress) => {

							if (this.server !== null) {
								this.server.services.stash.save(Object.assign({}, this.url, partial), () => {
									this.emit('progress', [ partial, progress ]);
								});
							}

						});

						download.on('timeout', (partial) => {

							if (partial !== null) {

								this.retries++;

								if (this.retries < 10) {

									if (this.server !== null) {

										this.server.services.stash.save(Object.assign({}, this.url, partial), (result) => {

											if (result === true) {
												this.url.headers = partial.headers;
												this.url.payload = partial.payload;
											}

											this.emit('download');

										});

									} else {
										this.emit('error', [{ type: 'request', cause: 'socket-stability' }]);
									}

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

								if (this.server !== null) {

									this.server.services.stash.remove(this.url, () => {

										this.url.headers = null;
										this.url.payload = null;

										this.emit('download');

									});

								} else {
									this.emit('error', [ error ]);
								}

							} else {
								this.emit('error', [ error ]);
							}

						});

						download.on('redirect', (response) => {

							this.download = null;

							if (this.server !== null) {

								this.server.services.stash.remove(this.url, () => {

									let location = response.headers['location'] || null;
									if (location !== null) {
										this.emit('redirect', [ response, false ]);
									} else {
										this.emit('error', [{ type: 'request', cause: 'headers-location' }]);
									}

								});

							} else {
								this.emit('redirect', [ response, false ]);
							}

						});

						download.on('response', (response) => {

							this.download = null;

							if (this.server !== null) {

								this.server.services.stash.remove(this.url, () => {
									this.url.headers = null;
									this.url.payload = null;
								});

							}

							this.response = response;
							this.emit('optimize');

						});

						download.start();

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

	});

	this.on('redirect', (response, ignore) => {

		ignore = isBoolean(ignore) ? ignore : false;


		if (ignore === true) {

			// Do nothing

		} else if (response !== null && response.headers !== null) {

			this.timeline.redirect = Date.now();

			let location = response.headers['location'] || null;
			if (location !== null) {

				if (this.server !== null) {
					this.server.services.redirect.save(Object.assign({}, this.url, {
						location: location
					}), () => {});
				}

			}

		}

	});

	this.on('response', (response) => {

		if (response !== null && response.payload !== null) {

			this.timeline.response = Date.now();

			if (this.response !== response) {
				this.response = response;
			}

			if (this.server !== null) {

				this.server.services.cache.save(Object.assign({}, this.url, response), (result) => {

					if (result === true) {

						this.server.services.stash.remove(this.url, (result) => {

							if (result === true) {
								this.url.headers = null;
								this.url.payload = null;
							}

						});

					}

				});

			}

		}

	});

};


Request.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Request' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {

			if (isString(data.url) === true) {

				let request = new Request({
					id:   isString(data.id)  ? data.id   : null,
					mode: isMode(data.mode)  ? data.mode : null,
					url:  isString(data.url) ? data.url  : null
				});

				if (isObject(data.flags) === true) {

					Object.keys(data.flags).forEach((key) => {
						request.set(key, data.flags[key]);
					});

				}

				return request;

			}

		}

	}


	return null;

};


Request.isRequest = isRequest;


Request.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Request',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			mode:     this.mode,
			url:      URL.render(this.url),
			download: null,
			flags:    Object.assign({}, this.flags),
			timeline: Object.assign({}, this.timeline),
			events:   blob.data.events,
			journal:  blob.data.journal
		};

		if (this.download !== null) {
			data.download = this.download.toJSON();
		}

		return {
			'type': 'Request',
			'data': data
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

	start: function() {

		if (this.timeline.start === null) {

			this.emit('start');

			return true;

		}


		return false;

	},

	set: function(key, val) {

		key = isString(key) ? key : null;


		if (key !== null) {

			if (isBoolean(val) === true) {

				let check = this.flags[key];
				if (isBoolean(check) === true) {

					this.flags[key] = val;

					return true;

				}

			} else if (isString(val) === true || val === null) {

				let check = this.flags[key];
				if (isString(check) === true || check === null) {

					this.flags[key] = val;

					return true;

				}

			}

		}


		return false;

	},

	stop: function() {

		if (this.timeline.stop === null) {

			this.emit('stop');

			return true;

		}


		return false;

	}

});


export { Request };

