
import process from 'process';

import { console, Emitter, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                          } from '../source/ENVIRONMENT.mjs';
import { Request                              } from '../source/Request.mjs';
import { Server                               } from '../source/Server.mjs';
import { Session                              } from '../source/Session.mjs';
import { Settings                             } from '../source/Settings.mjs';
import { IP                                   } from '../source/parser/IP.mjs';
import { URL                                  } from '../source/parser/URL.mjs';



const RELEASE = 'X0';
const DATE    = '2021-08-18';

export const VERSION = RELEASE + ':' + DATE;



export const isStealth = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Stealth]';
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
		if (search !== null) {

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



const Stealth = function(settings) {

	settings = isObject(settings) ? settings : {};


	this._settings = Object.freeze(Object.assign({
		debug:   false,
		host:    null,
		profile: null
	}, settings));


	console.clear();
	console.log('Stealth: Command-Line Arguments:');
	console.log(this._settings);


	this.interval = null;
	this.requests = [];
	this.server   = new Server({
		host: this._settings.host
	}, this);
	this.settings = new Settings({
		debug:   this._settings.debug,
		profile: this._settings.profile,
		vendor:  ENVIRONMENT.vendor
	});

	this.__state = {
		connected: false
	};


	Emitter.call(this);


	this.on('connect', () => {

		let interval = this.interval;
		if (interval === null) {

			this.interval = setInterval(() => {

				let cur_downloads = 0;
				let max_downloads = 0;

				for (let r = 0; r < this.requests.length; r++) {

					let request = this.requests[r];
					if (request.timeline.connect !== null) {
						cur_downloads++;
					}

				}


				let connection = this.settings.internet.connection;
				if (connection === 'mobile') {
					max_downloads = 2;
				} else if (connection === 'broadband') {
					max_downloads = 8;
				} else if (connection === 'peer') {
					max_downloads = 2;
				} else if (connection === 'tor') {
					max_downloads = 2;
				}

				if (this._settings.debug === true) {
					max_downloads = 1;
				}


				for (let r = 0; r < this.requests.length; r++) {

					if (cur_downloads <= max_downloads) {

						let request = this.requests[r];
						if (request.flags.connect === false) {

							if (request.timeline.connect === null) {
								request.emit('connect');
								cur_downloads++;
							}

						}

					} else {
						break;
					}

				}

			}, 1000);

		}

	});

	this.on('disconnect', () => {

		let interval = this.interval;
		if (interval !== null) {

			clearInterval(interval);
			this.interval = null;

		}

		if (this.requests.length > 0) {

			for (let r = 0, rl = this.requests.length; r < rl; r++) {

				this.requests[r].stop();

				this.requests.splice(r, 1);
				rl--;
				r--;

			}

		}

	});


	process.on('SIGINT', () => {
		this.disconnect();
	});

	process.on('SIGQUIT', () => {
		this.disconnect();
	});

	process.on('SIGABRT', () => {
		this.disconnect();
	});

	process.on('SIGTERM', () => {
		this.disconnect();
	});

	process.on('error', () => {
		this.disconnect();
	});

};


Stealth.isStealth = isStealth;


Stealth.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Stealth',

	connect: function() {

		if (this.__state.connected === false) {

			this.server.once('connect', () => {

				this.__state.connected = true;
				this.emit('connect');

			});

			this.server.once('disconnect', () => {

				this.__state.connected = false;
				this.emit('disconnect');

			});

			let result = this.server.connect();
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

			if (this._settings.debug === true) {

				this.server.disconnect();

			} else {

				this.settings.save(true, () => {
					this.server.disconnect();
				});

			}

			return true;

		}


		return false;

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

	open: function(link) {

		link = isString(link) ? link : null;


		let url = URL.parse(link);
		if (URL.isURL(url) === true) {

			let request = null;

			for (let s = 0, sl = this.settings.sessions.length; s < sl; s++) {

				let cached = this.settings.sessions[s].get(url.link);
				if (cached !== null) {
					request = cached;
					break;
				}

			}

			if (request === null) {
				request = this.requests.find((r) => r.url.link === url.link) || null;
			}

			if (request === null) {

				if (this.settings.internet.connection === 'tor') {
					url.proxy = { host: '127.0.0.1', port: 9050 };
				}

				request = new Request({
					mode: toMode.call(this, url),
					url:  url
				}, this.server.services);

				request.on('error',    () => this.requests.remove(request));
				request.on('redirect', () => this.requests.remove(request));
				request.on('response', () => this.requests.remove(request));

				// Allow non-scheduled cached requests
				// Disallow non-scheduled networked requests
				request.set('connect', false);

				this.requests.push(request);

			}

			return request;

		}


		return null;

	},

	track: function(session, headers) {

		session = session instanceof Session ? session : null;
		headers = isObject(headers)          ? headers : null;


		if (session !== null) {

			if (this.settings.sessions.includes(session) === false) {
				this.settings.sessions.push(session);
			}

			return session;

		} else if (headers !== null) {

			let address = headers['@remote'] || null;
			if (address !== null) {

				// XXX: This is a Chromium Bug, two parallel connections
				// lead to ::ffff:127.0.0.2-255 remote address
				// whereas the initial connection uses ::1
				if (address === '::1' || address.startsWith('127.0.0.') === true) {
					address = '127.0.0.1';
				}


				let ip   = IP.parse(address);
				let host = this.settings.hosts.find((host) => {

					let found = host.hosts.find((h) => h.ip === ip.ip) || null;
					if (found !== null) {
						return true;
					}

					return false;

				}) || null;

				let sdomain = ip.ip || null;
				if (sdomain === '::1') {
					headers['domain'] = sdomain = ENVIRONMENT.hostname;
				} else if (sdomain === '127.0.0.1') {
					headers['domain'] = sdomain = ENVIRONMENT.hostname;
				} else if (host !== null) {
					headers['domain'] = sdomain = host.domain;
				}


				if (sdomain !== null) {
					session = this.settings.sessions.find((s) => s.domain === sdomain) || null;
				}

			}

			if (session !== null) {

				session.dispatch(headers);

			} else {

				session = new Session(this);
				session.dispatch(headers);

				if (this.settings.sessions.includes(session) === false) {
					this.settings.sessions.push(session);
				}

			}

			return session;

		}


		return null;

	},

	untrack: function(session) {

		session = session instanceof Session ? session : null;


		if (session !== null) {

			let sessions = this.settings.sessions;
			if (sessions.includes(session) === true) {

				let index = sessions.indexOf(session);
				if (index !== -1) {
					sessions.splice(index, 1);
					session.destroy();
				}

				return true;

			}

		}


		return false;

	}

});


export { Stealth };

