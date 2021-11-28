
import { Emitter, isBoolean, isObject, isString } from '../extern/base.mjs';
import { Download                               } from '../source/Download.mjs';
import { DATETIME                               } from '../source/parser/DATETIME.mjs';
import { UA                                     } from '../source/parser/UA.mjs';
import { URL                                    } from '../source/parser/URL.mjs';
import { isServices                             } from '../source/server/Services.mjs';
import { Mode                                   } from '../source/server/service/Mode.mjs';
import { Policy                                 } from '../source/server/service/Policy.mjs';
import { Redirect                               } from '../source/server/service/Redirect.mjs';



export const isRequest = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Request]';
};



/*
 * INTERNAL EVENTS
 *
 * - @blocker  -> @mode
 * - @blocker  -> error [{ type: 'blocker' }]
 *
 * - @mode     -> @policy
 * - @mode     -> error [{ type: 'mode' }]
 *
 * - @policy   -> @cache
 * - @policy   -> redirect
 *
 * - @cache    -> @host
 * - @cache    -> @optimize
 *
 * - @host     -> @download
 * - @host     -> error [{ type: 'host' }]
 *
 * - @download -> @optimize
 * - @download -> redirect
 * - @download -> error [{ cause: '...' }]
 *
 * - @optimize -> response
 *
 * EXTERNAL EVENTS
 *
 * - error
 *
 * - redirect
 *
 * - response
 *
 */

const Request = function(settings, services) {

	settings = isObject(settings)   ? settings : {};
	services = isServices(services) ? services : null;


	settings = Object.freeze({
		mode:     Mode.isMode(settings.mode)             ? settings.mode     : null,
		policy:   Policy.isPolicy(settings.policy)       ? settings.policy   : null,
		redirect: Redirect.isRedirect(settings.redirect) ? settings.redirect : null,
		refresh:  isBoolean(settings.refresh)            ? settings.refresh  : false,
		ua:       UA.isUA(settings.ua)                   ? settings.ua       : null,
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

	if (isBoolean(settings.refresh) === true) {
		this.refresh = settings.refresh;
	} else {
		this.refresh = false;
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

	if (UA.isUA(settings.ua) === true) {
		this.ua = settings.ua;
	} else {
		this.ua = null;
	}


	if (isServices(services) === true) {
		this.services = services;
	} else {
		this.services = null;
	}


	this.download = null;

	this.__state = {
		response: null,
		retries:  0,
		timeline: []
	};

	Emitter.call(this);


	this.on('@blocker', () => {

		this.__state.timeline.push({
			event:    '@blocker',
			datetime: DATETIME.parse(new Date())
		});

		if (this.services !== null) {

			this.services.blocker.read({
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

					this.emit('error', [{ type: 'blocker' }]);

				} else {

					if (this.url.protocol === 'https' || this.url.protocol === 'http') {
						this.emit('@mode');
					} else {
						this.emit('error', [{ type: 'blocker' }]);
					}

				}

			});

		} else {

			if (this.url.protocol === 'https' || this.url.protocol === 'http') {
				this.emit('@mode');
			} else {
				this.emit('error', [{ type: 'blocker' }]);
			}

		}

	});

	this.on('@mode', () => {

		let mime    = this.url.mime;
		let allowed = this.mode.mode[mime.type] === true;

		this.__state.timeline.push({
			event:    '@mode',
			datetime: DATETIME.parse(new Date())
		});

		if (allowed === true) {
			this.emit('@policy');
		} else {
			this.emit('error', [{ type: 'mode' }]);
		}

	});

	this.on('@policy', () => {

		this.__state.timeline.push({
			event:    '@policy',
			datetime: DATETIME.parse(new Date())
		});

		if (this.services !== null) {

			this.services.policy.read(this.url, (response) => {

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
					this.emit('@cache');
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
				this.emit('@cache');
			}

		} else {
			this.emit('@cache');
		}

	});

	this.on('@cache', () => {

		if (this.refresh === true) {

			this.emit('@host');

		} else {

			if (this.services !== null) {

				this.services.cache.read(this.url, (response) => {

					this.__state.timeline.push({
						event:    '@cache',
						datetime: DATETIME.parse(new Date())
					});

					if (response.payload !== null) {
						this.__state.response = response.payload;
						this.emit('@optimize');
					} else {
						this.emit('@host');
					}

				});

			} else {

				this.__state.timeline.push({
					event:    '@cache',
					datetime: DATETIME.parse(new Date())
				});

				this.emit('@host');

			}

		}

	});

	this.on('@host', () => {

		if (this.url.hosts.length > 0) {

			this.__state.timeline.push({
				event:    '@host',
				datetime: DATETIME.parse(new Date())
			});

			this.emit('@download');

		} else {

			this.__state.timeline.push({
				event:    '@host',
				datetime: DATETIME.parse(new Date())
			});

			if (this.services !== null) {

				this.services.host.read({
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
						this.emit('@download');
					} else {
						this.emit('error', [{ type: 'host' }]);
					}

				});

			} else {

				if (this.url.hosts.length > 0) {
					this.emit('@download');
				} else {
					this.emit('error', [{ type: 'host' }]);
				}

			}

		}

	});

	this.on('@download', () => {

		this.__state.timeline.push({
			event:    '@download',
			datetime: DATETIME.parse(new Date())
		});


		if (this.ua !== null) {

			if (this.url.headers === null) {
				this.url.headers = {};
			}


			if (this.ua.engine === 'chrome') {

				this.url.headers['accept-encoding']           = 'gzip, deflate, br';
				this.url.headers['accept-language']           = 'en-US,en;q=0.9';
				this.url.headers['sec-ch-ua-mobile']          = '?0';
				this.url.headers['sec-fetch-dest']            = 'document';
				this.url.headers['sec-fetch-mode']            = 'navigate';
				this.url.headers['sec-fetch-site']            = 'none';
				this.url.headers['sec-fetch-user']            = '?1';
				this.url.headers['upgrade-insecure-requests'] = '1';
				this.url.headers['user-agent']                = UA.render(this.ua);

				if (this.url.mime !== null) {

					this.url.headers['accept'] = this.url.mime.format;

					if (this.url.mime.format === 'text/html') {
						this.url.headers['sec-fetch-site'] = 'none';
					} else {
						this.url.headers['sec-fetch-site'] = 'same-origin';
					}

				} else {

					this.url.headers['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8';

				}

			} else if (this.ua.engine === 'firefox') {

				this.url.headers['accept-encoding']           = 'gzip, deflate, br';
				this.url.headers['accept-language']           = 'en-US,en;q=0.5';
				this.url.headers['cache-control']             = 'max-age=0';
				this.url.headers['sec-fetch-dest']            = 'document';
				this.url.headers['sec-fetch-mode']            = 'navigate';
				this.url.headers['sec-fetch-site']            = 'none';
				this.url.headers['sec-fetch-user']            = '?1';
				this.url.headers['upgrade-insecure-requests'] = '1';
				this.url.headers['user-agent']                = UA.render(this.ua);

				if (this.url.mime !== null) {

					this.url.headers['accept'] = this.url.mime.format;

					if (this.url.mime.format === 'text/html') {
						this.url.headers['sec-fetch-site'] = 'none';
					} else {
						this.url.headers['sec-fetch-site'] = 'same-origin';
					}

				} else {

					if (this.ua.version >= 92) {
						this.url.headers['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
					} else if (this.ua.version >= 72) {
						this.url.headers['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
					} else if (this.ua.version >= 66) {
						this.url.headers['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
					} else {
						this.url.headers['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
					}

				}

			} else if (this.ua.engine === 'safari') {

				this.url.headers['accept-encoding'] = 'gzip, deflate';
				this.url.headers['accept-language'] = 'en-us';
				this.url.headers['accept']          = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

			}

		} else {

			if (this.url.headers !== null) {

				if (isString(this.url.headers['user-agent']) === true) {
					delete this.url.headers['user-agent'];
				}

				if (isString(this.url.headers['accept']) === true) {
					delete this.url.headers['accept'];
				}

			}

		}


		this.download = new Download({
			ua:  this.ua,
			url: this.url
		});

		this.download.once('error', (error) => {

			if (this.download !== null) {
				this.download.off('redirect');
				this.download.off('response');
				this.download = null;
			}


			if (error.cause === 'socket-stability') {

				this.__state.retries++;

				if (this.__state.retries < 10) {
					this.emit('@download');
				} else {
					this.emit('error', [ error ]);
				}

			} else {

				this.emit('error', [ error ]);

			}

		});

		this.download.on('progress', (frame, progress) => {
			this.emit('progress', [ frame, progress ]);
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

			this.__state.response = response;
			this.emit('@optimize');

		});

		this.download.start();

	});

	this.on('@optimize', () => {

		this.__state.timeline.push({
			event:    '@optimize',
			datetime: DATETIME.parse(new Date())
		});


		// let mime = this.url.mime || null;
		// if (mime !== null) {

		// 	if (mime.type === 'text' && mime.format === 'text/html') {

		// 		let parsed   = HTML.parse(this.__state.response.payload);
		// 		let filtered = HTML.filter(parsed);
		// 		let rendered = HTML.render(filtered);

		// 		if (rendered !== null) {
		// 			this.__state.response.payload = rendered;
		// 		}

		// 	} else if (mime.type === 'text' && mime.format === 'text/css') {

		// 		let parsed   = CSS.parse(this.__state.response.payload);
		// 		let filtered = CSS.filter(parsed);
		// 		let rendered = CSS.render(filtered);

		// 		if (rendered !== null) {
		// 			this.__state.response.payload = rendered;
		// 		}

		// 	} else if (mime.type === 'image' && mime.format === 'image/jpeg') {
		// 		// TODO: Integrate jpeg optimizer
		// 	} else if (mime.type === 'image' && mime.format === 'image/png') {
		// 		// TODO: Integrate optipng
		// 	}

		// }


		if (this.__state.response !== null) {

			this.emit('response', [{
				headers: {
					'@status':        200,
					'content-length': this.__state.response.payload.length,
					'content-type':   this.url.mime.format,
					'last-modified':  this.__state.response.headers['last-modified'] || null
				},
				payload: this.__state.response.payload
			}]);

		} else {

			this.emit('error', [{ type: 'connection', cause: 'headers' }]);

		}

	});

	this.on('error', () => {

		this.__state.timeline.push({
			event:    'error',
			datetime: DATETIME.parse(new Date())
		});

	});

	this.on('redirect', (response, ignore) => {

		ignore = isBoolean(ignore) ? ignore : false;


		this.__state.timeline.push({
			event:    'redirect',
			datetime: DATETIME.parse(new Date())
		});


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

				if (this.services !== null) {
					this.services.redirect.save(this.redirect, () => {});
				}

			}

		}

	});

	this.on('response', (response) => {

		if (response !== null && response.payload !== null) {

			this.__state.timeline.push({
				event:    'response',
				datetime: DATETIME.parse(new Date())
			});

			if (this.__state.response !== response) {
				this.__state.response = response;
			}

			if (this.services !== null) {

				this.services.cache.save(Object.assign({}, this.url, this.__state.response), () => {
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
					refresh:  isBoolean(data.refresh)            ? data.refresh        : false,
					url:      isString(data.url)                 ? URL.parse(data.url) : null
				});

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
			refresh:  this.refresh,
			url:      URL.render(this.url),
			ua:       UA.render(this.ua),
			download: {
				bandwidth:  -1,
				connection: null,
				percentage: '???.??%'
			},
			timeline: [],
			events:   blob.data.events,
			journal:  blob.data.journal
		};

		if (this.__state.timeline.length > 0) {

			this.__state.timeline.forEach((entry) => {
				data.timeline.push(entry);
			});

		}

		if (this.download !== null) {
			data.download = this.download.toJSON();
		}

		return {
			'type': 'Request',
			'data': data
		};

	},

	start: function() {

		if (this.url !== null) {

			let check = this.__state.timeline.find((e) => e.event === '@start') || null;
			if (check === null) {

				this.__state.timeline.push({
					event:    '@start',
					datetime: DATETIME.parse(new Date())
				});

				this.emit('start');


				if (this.services !== null) {

					this.services.redirect.read(this.url, (response) => {

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
								this.emit('@blocker');
							}

						} else {
							this.emit('@blocker');
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
							this.emit('@blocker');
						}

					} else {
						this.emit('@blocker');
					}

				} else {
					this.emit('@blocker');
				}

				return true;

			}

		}


		return false;

	},

	stop: function() {

		let check = this.__state.timeline.find((e) => e.event === '@stop') || null;
		if (check === null) {

			if (this.download !== null) {

				this.download.off('error');
				this.download.off('redirect');
				this.download.off('response');

				this.download.stop();
				this.download = null;

			}

			this.__state.timeline.push({
				event:    '@stop',
				datetime: DATETIME.parse(new Date())
			});

			this.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
			this.emit('stop');

			return true;

		}


		return false;

	}

});


export { Request };

