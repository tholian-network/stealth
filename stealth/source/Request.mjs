
import { Emitter, isBoolean, isObject, isString } from '../extern/base.mjs';
import { Download                               } from '../source/Download.mjs';
import { DATETIME                               } from '../source/parser/DATETIME.mjs';
import { URL                                    } from '../source/parser/URL.mjs';
import { isServer                               } from '../source/Server.mjs';
import { Mode                                   } from '../source/server/Mode.mjs';
import { Policy                                 } from '../source/server/Policy.mjs';
import { Redirect                               } from '../source/server/Redirect.mjs';



export const isRequest = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Request]';
};



Download.prototype = Object.assign({}, Emitter.prototype, {

	start: function() {

		if (this.connection === null) {

			if (this.connection !== null) {

				this.connection.once('@connect', () => {


					let headers = {
						'@method': 'GET',
						'@url':    URL.render(url),
						'host':    hostname,
						'range':   'bytes=0-'
					};

					if (url.headers !== null) {

						let accept = url.headers['accept'] || null;
						if (accept !== null) {
							headers['accept'] = accept;
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


				return true;

			}

		}


		return false;

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

		if (this.redirect.domain === null) {

			let domain = URL.toDomain(this.url);
			let host   = URL.toHost(this.url);

			if (domain !== null) {
				this.policy.domain = domain;
				this.redirect.domain = domain;
			} else if (host !== null) {
				this.policy.domain = host;
				this.redirect.domain = host;
			}

		}

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
		block:    null,
		mode:     null,
		policy:   null,
		cache:    null,
		connect:  null,
		download: null,
		optimize: null,
		response: null

	};


	Emitter.call(this);


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

					if (redirect.location !== this.url.link) {

						this.emit('redirect', [{
							headers: { location: redirect.location },
							payload: null
						}, true ]);

					} else {
						this.emit('block');
					}

				} else {
					this.emit('block');
				}

			});

		} else if (Redirect.isRedirect(this.redirect) === true) {

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

				if (redirect.location !== this.url.link) {

					this.emit('redirect', [{
						headers: { location: redirect.location },
						payload: null
					}, true ]);

				} else {
					this.emit('block');
				}

			} else {
				this.emit('block');
			}

		} else {
			this.emit('block');
		}

	});

	this.on('stop', () => {

		this.timeline.stop = DATETIME.parse(new Date());

		if (this.download !== null) {

			this.download.stop();
			this.download = null;

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

					if (this.url.protocol === 'https' || this.url.protocol === 'http') {
						this.emit('mode');
					} else {
						this.emit('error', [{ type: 'block' }]);
					}

				}

			});

		} else {

			if (this.url.protocol === 'https' || this.url.protocol === 'http') {
				this.emit('mode');
			} else {
				this.emit('error', [{ type: 'block' }]);
			}

		}

	});

	this.on('mode', () => {

		let mime    = this.url.mime;
		let allowed = this.mode.mode[mime.type] === true;

		this.timeline.mode = DATETIME.parse(new Date());

		if (allowed === true) {
			this.emit('policy');
		} else {
			this.emit('error', [{ type: 'mode' }]);
		}

	});

	this.on('policy', () => {

		this.timeline.policy = DATETIME.parse(new Date());

		if (this.server !== null) {

			this.server.services.policy.read(this.url, (response) => {

				if (response.payload !== null) {
					this.policy = response.payload;
				}

				let redirect = URL.filter(this.url, this.policy);
				if (redirect.link !== this.url.link) {

					this.emit('redirect', [{
						headers: { location: redirect.link },
						payload: null
					}, true ]);

				} else {
					this.emit('cache');
				}

			});

		} else if (Policy.isPolicy(this.policy) === true) {

			let redirect = URL.filter(this.url, this.policy);
			if (redirect.link !== this.url.link) {

				this.emit('redirect', [{
					headers: { location: redirect.link },
					payload: null
				}, true ]);

			} else {
				this.emit('cache');
			}

		} else {
			this.emit('cache');
		}

	});

	this.on('cache', () => {

		if (this.flags.refresh === true) {

			if (this.flags.connect === true) {
				this.emit('connect');
			} else {
				// External Scheduler calls emit('connect')
			}

		} else {

			if (this.server !== null) {

				this.server.services.cache.read(this.url, (response) => {

					this.timeline.cache = DATETIME.parse(new Date());

					if (response.payload !== null) {
						this.response = response.payload;
						this.emit('optimize');
					} else {
						this.emit('connect');
					}

				});

			} else {

				this.timeline.cache = DATETIME.parse(new Date());
				this.emit('connect');

			}

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


		this.download = new Download(this.url);

		this.download.once('error', (error) => {

			if (this.download !== null) {
				this.download.off('redirect');
				this.download.off('response');
				this.download = null;
			}


			if (error.cause === 'socket-stability') {

				this.retries++;

				if (this.retries < 10) {
					this.emit('download');
				} else {
					this.emit('error', [ error ]);
				}

			} else {

				this.emit('error', [ error ]);

			}

		});

		this.download.once('redirect', (response) => {

			if (this.download !== null) {
				this.download.off('error');
				this.download.off('response');
				this.download = null;
			}

			this.emit('redirect', [ response, false ]);

		});

		this.download.once('response', (response) => {

			if (this.download !== null) {
				this.download.off('error');
				this.download.off('redirect');
				this.download = null;
			}

			this.response = response;
			this.emit('optimize');

		});

		this.download.start();

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


		this.timeline.redirect = DATETIME.parse(new Date());


		if (ignore === true) {

			// Do nothing

		} else if (response !== null && response.headers !== null) {

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

				this.server.services.cache.save(Object.assign({}, this.url, response), () => {
					// Do Nothing
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
					id:       isString(data.id)                  ? data.id             : null,
					mode:     Mode.isMode(data.mode)             ? data.mode           : null,
					policy:   Policy.isPolicy(data.policy)       ? data.policy         : null,
					redirect: Redirect.isRedirect(data.redirect) ? data.redirect       : null,
					url:      isString(data.url)                 ? URL.parse(data.url) : null
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

			if (this.url !== null) {

				this.emit('start');

				return true;

			}

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

