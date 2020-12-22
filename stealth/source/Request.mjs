
import { Emitter, isBoolean, isObject, isString } from '../extern/base.mjs';
import { HTTP                                   } from '../source/connection/HTTP.mjs';
import { HTTPS                                  } from '../source/connection/HTTPS.mjs';
import { SOCKS                                  } from '../source/connection/SOCKS.mjs';
import { CSS                                    } from '../source/parser/CSS.mjs';
import { DATETIME                               } from '../source/parser/DATETIME.mjs';
import { HTML                                   } from '../source/parser/HTML.mjs';
import { URL                                    } from '../source/parser/URL.mjs';
import { isServer                               } from '../source/Server.mjs';
import { Mode                                   } from '../source/server/Mode.mjs';
import { Policy                                 } from '../source/server/Policy.mjs';
import { Redirect                               } from '../source/server/Redirect.mjs';



export const isRequest = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Request]';
};



const Download = function(url) {

	this.connection = null;

	this.__state = {
		bandwidth: {
			index:    0,
			length:   0,
			timeline: new Array(30).fill(null)
		},
		interval: null,
		url:      url
	};


	Emitter.call(this);

};

Download.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Download',

	toJSON: function() {

		let data = {
			bandwidth:  this.bandwidth(),
			connection: null,
			percentage: '???.??%'
		};

		if (this.connection !== null) {
			data.connection = this.connection.toJSON();
		}

		if (this.connection !== null) {

			if (this.connection.fragment.length !== null) {
				data.percentage = ((this.connection.fragment.payload.length / this.connection.fragment.length) * 100).toFixed(2) + '%';
			}

		}

		return {
			'type': 'Download',
			'data': data
		};

	},

	bandwidth: function() {

		if (this.connection !== null) {

			let timeline = this.__state.bandwidth.timeline;
			if (timeline.includes(null) === false) {
				return timeline.reduce((a, b) => a + b, 0) / timeline.length;
			}

		}


		return -1;

	},

	start: function() {

		if (this.connection === null) {

			let url   = this.__state.url;
			let proxy = this.__state.url.proxy || null;

			if (proxy !== null) {

				this.connection = SOCKS.connect(url);

			} else if (url.protocol === 'https') {

				this.connection = HTTPS.connect(url);

			} else if (url.protocol === 'http') {

				this.connection = HTTP.connect(url);

			}

			if (this.connection !== null) {

				this.connection.on('error',    (...args) => this.emit('error',    args));
				this.connection.on('progress', (...args) => this.emit('progress', args));
				this.connection.on('redirect', (...args) => this.emit('redirect', args));
				this.connection.on('response', (...args) => this.emit('response', args));
				this.connection.on('timeout',  (...args) => this.emit('timeout',  args));

				this.connection.once('@connect', () => {

					this.__state.interval = setInterval(() => {

						let old_length = this.__state.bandwidth.length;
						let new_length = this.connection.fragment.length;
						let new_index  = this.__state.bandwidth.index++;

						this.__state.bandwidth.timeline[new_index] = new_length - old_length;
						this.__state.bandwidth.index %= this.__state.bandwidth.timeline.length;


						let bandwidth = this.bandwidth();
						if (bandwidth >= 0 && bandwidth < 0.01) {

							if (this.connection !== null) {
								this.connection.disconnect();
							}

						}

					}, 1000);


					let hostname = null;
					let domain   = URL.toDomain(url);
					let host     = URL.toHost(url);

					if (domain !== null) {
						hostname = domain;
					} else if (host !== null) {
						hostname = host;
					}


					let headers = {
						'@method': 'GET',
						'@url':    url.path + (url.query !== null ? ('?' + url.query) : ''),
						'host':    hostname,
						'range':   'bytes=0-'
					};

					if (url.headers !== null) {

						let accept = url.headers['accept'] || null;
						if (accept !== null) {
							headers['accept'] = accept;
						}

						let useragent = url.headers['user-agent'] || null;
						if (useragent !== null) {
							headers['user-agent'] = useragent;
						}

						let tmp1 = url.headers['@status']       || null;
						let tmp2 = url.headers['content-range'] || null;

						if (
							tmp1 === '206 Partial Content'
							&& tmp2 !== null
							&& url.payload !== null
						) {
							headers['range'] = 'bytes=' + url.payload.length + '-';
						}

					}


					if (url.protocol === 'https') {

						HTTPS.send(this.connection, {
							headers: headers
						});

					} else if (url.protocol === 'http') {

						HTTP.send(this.connection, {
							headers: headers
						});

					}

				});

				this.connection.once('@disconnect', () => {

					if (this.__state.interval !== null) {
						clearInterval(this.__state.interval);
						this.__state.interval = null;
					}

				});

				return true;

			} else {

				this.emit('error', [{ type: 'block' }]);

			}

		}


		return false;

	},

	stop: function() {

		if (this.connection !== null) {
			this.connection.disconnect();
		}

	}

});



const Request = function(settings, server) {

	settings = isObject(settings) ? settings : {};
	server   = isServer(server)   ? server   : null;


	settings = Object.freeze({
		mode:     Mode.isMode(settings.mode)             ? settings.mode     : null,
		policy:   Policy.isPolicy(settings.policy)       ? settings.policy   : null,
		redirect: Redirect.isRedirect(settings.redirect) ? settings.redirect : null,
		url:      URL.isURL(settings.url)                ? settings.url      : null
	});


	if (Mode.isMode(settings.mode) === true) {
		this.mode = settings.mode;
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

	if (Policy.isPolicy(settings.policy) === true) {
		this.policy = settings.policy;
	} else {
		this.policy = {
			domain:   null,
			policies: []
		};
	}

	if (Redirect.isRedirect(settings.redirect) === true) {
		this.redirect = settings.redirect;
	} else {
		this.redirect = {
			domain:    null,
			redirects: []
		};
	}

	if (URL.isURL(settings.url) === true) {
		this.url = settings.url;
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


	// TODO: Implement on('policy') event
	// that filters out malicious URL parameters


	this.on('start', () => {

		this.timeline.start = DATETIME.parse(new Date());

		if (this.server !== null) {

			this.server.services.redirect.read(this.url, (response) => {

				if (response.payload !== null) {
					this.redirect = response.payload;
				}


				let redirect = this.redirect.redirects.find((redirect) => {

					if (
						this.url.path === redirect.path
						&& this.url.query === redirect.query
					) {
						return true;
					}

					return false;

				}) || null;

				if (redirect !== null) {

					this.emit('redirect', [{
						headers: { location: redirect.location },
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

		this.timeline.stop = DATETIME.parse(new Date());

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

					this.timeline.cache = DATETIME.parse(new Date());

					if (response.payload !== null) {
						this.response = response.payload;
						this.emit('optimize');
					} else {
						this.emit('stash');
					}

				});

			} else {

				this.timeline.cache = DATETIME.parse(new Date());
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

					this.timeline.stash = DATETIME.parse(new Date());

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

				this.timeline.stash = DATETIME.parse(new Date());
				this.emit('block');

			}

		}

	});

	this.on('block', () => {

		this.timeline.block = DATETIME.parse(new Date());

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

					this.emit('error', [{ type: 'block' }]);

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

		this.timeline.mode = DATETIME.parse(new Date());

		if (allowed === true) {

			if (this.flags.connect === true) {
				this.emit('connect');
			} else {
				// External Scheduler calls emit('connect')
			}

		} else if (this.flags.webview === true) {
			this.emit('error', [{ type: 'mode' }]);
		}

	});

	this.on('connect', () => {

		if (this.url.hosts.length > 0) {

			this.timeline.connect = DATETIME.parse(new Date());
			this.emit('download');

		} else {

			this.timeline.connect = DATETIME.parse(new Date());

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

		this.timeline.download = DATETIME.parse(new Date());


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


		if (this.url.protocol === 'https' || this.url.protocol === 'http') {

			this.download = new Download(this.url);

			this.download.on('progress', (partial, progress) => {

				if (this.server !== null) {
					this.server.services.stash.save(Object.assign({}, this.url, partial), () => {
						this.emit('progress', [ partial, progress ]);
					});
				}

			});

			this.download.once('timeout', (partial) => {

				this.download.off('progress');
				this.download.off('error');
				this.download.off('redirect');
				this.download.off('response');
				this.download = null;


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

			this.download.once('error', (error) => {

				this.download.off('progress');
				this.download.off('timeout');
				this.download.off('redirect');
				this.download.off('response');
				this.download = null;


				if (this.server !== null) {

					this.server.services.stash.remove(this.url, () => {

						this.url.headers = null;
						this.url.payload = null;

						this.emit('download');

					});

				} else {
					this.emit('error', [ error ]);
				}

			});

			this.download.once('redirect', (response) => {

				this.download.off('progress');
				this.download.off('timeout');
				this.download.off('error');
				this.download.off('response');
				this.download = null;


				if (this.server !== null) {

					this.server.services.stash.remove(this.url, () => {
						this.emit('redirect', [ response, false ]);
					});

				} else {
					this.emit('redirect', [ response, false ]);
				}

			});

			this.download.once('response', (response) => {

				this.download.off('progress');
				this.download.off('timeout');
				this.download.off('error');
				this.download.off('redirect');
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

			this.download.start();

		} else {
			this.emit('error', [{ type: 'block' }]);
		}

	});

	this.on('optimize', () => {

		this.timeline.optimize = DATETIME.parse(new Date());


		// let mime = this.url.mime || null;
		// if (mime !== null) {

		// 	if (mime.type === 'text' && mime.format === 'text/html') {

		// 		let parsed   = HTML.parse(this.response.payload);
		// 		let filtered = HTML.filter(parsed);
		// 		let rendered = HTML.render(filtered);

		// 		if (rendered !== null) {
		// 			this.response.payload = rendered;
		// 		}

		// 	} else if (mime.type === 'text' && mime.format === 'text/css') {

		// 		let parsed   = CSS.parse(this.response.payload);
		// 		let filtered = CSS.filter(parsed);
		// 		let rendered = CSS.render(filtered);

		// 		if (rendered !== null) {
		// 			this.response.payload = rendered;
		// 		}

		// 	} else if (mime.type === 'image' && mime.format === 'image/jpeg') {
		// 		// TODO: Integrate jpeg optimizer
		// 	} else if (mime.type === 'image' && mime.format === 'image/png') {
		// 		// TODO: Integrate optipng
		// 	}

		// }


		this.emit('response', [ this.response ]);

	});

	this.on('redirect', (response, ignore) => {

		ignore = isBoolean(ignore) ? ignore : false;


		if (ignore === true) {

			// Do nothing

		} else if (response !== null && response.headers !== null) {

			this.timeline.redirect = DATETIME.parse(new Date());


			let location = response.headers['location'] || null;
			let redirect = this.redirect.redirects.find((redirect) => {

				if (
					this.url.path === redirect.path
					&& this.url.query === redirect.query
				) {
					return true;
				}

				return false;

			}) || null;

			if (location !== null) {

				if (redirect !== null) {

					redirect.location = location;

				} else {

					this.redirect.redirects.push({
						path:     this.url.path,
						query:    this.url.query,
						location: location
					});

				}

				if (this.server !== null) {
					this.server.services.redirect.save(this.redirect, () => {});
				}

			}

		}

	});

	this.on('response', (response) => {

		if (response !== null && response.payload !== null) {

			this.timeline.response = DATETIME.parse(new Date());

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
					id:     isString(data.id)            ? data.id             : null,
					mode:   Mode.isMode(data.mode)       ? data.mode           : null,
					policy: Policy.isPolicy(data.policy) ? data.policy         : null,
					url:    isString(data.url)           ? URL.parse(data.url) : null
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
			policy:   this.policy,
			redirect: this.redirect,
			url:      URL.render(this.url),
			download: {
				bandwidth:  -1,
				connection: null,
				percentage: '???.??%'
			},
			flags:    Object.assign({}, this.flags),
			timeline: {},
			events:   blob.data.events,
			journal:  blob.data.journal
		};

		Object.keys(this.timeline).forEach((event) => {

			if (this.timeline[event] !== null) {
				data.timeline[event] = DATETIME.render(this.timeline[event]);
			} else {
				data.timeline[event] = null;
			}

		});

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

