
import process from 'process';

import { console, Emitter, isObject, isString } from '../extern/base.mjs';
import { hostname, root                       } from './ENVIRONMENT.mjs';
import { Request                              } from './Request.mjs';
import { Server                               } from './Server.mjs';
import { Session                              } from './Session.mjs';
import { Settings                             } from './Settings.mjs';
import { IP                                   } from './parser/IP.mjs';
import { URL                                  } from './parser/URL.mjs';



export const isStealth = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Stealth]';
};

const get_config = function(url) {

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

		let ref     = URL.parse(url);
		let rdomain = ref.domain || null;
		if (rdomain !== null) {

			let rsubdomain = ref.subdomain || null;
			if (rsubdomain !== null) {
				rdomain = rsubdomain + '.' + rdomain;
			}

		}


		if (rdomain !== null) {

			let modes = this.settings.modes.filter((m) => rdomain.endsWith(m.domain));
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

};

const remove_request = function(request) {

	for (let r = 0; r < this.requests.length; r++) {

		if (this.requests[r] === request) {
			this.requests.splice(r, 1);
			r--;
		}

	}

};



const Stealth = function(settings) {

	this._settings = Object.freeze(Object.assign({
		debug:   false,
		host:    null,
		profile: null,
		root:    root
	}, settings));


	console.log('Stealth: Command-Line Arguments:');
	console.log(this._settings);


	this.interval = null;
	this.settings = new Settings(this,
		this._settings.profile,
		this._settings.debug === true ? null : this._settings.root + '/profile'
	);
	this.peers    = [];
	this.requests = [];
	this.server   = new Server({
		host: this._settings.host
	}, this);

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
				} else if (connection === 'i2p') {
					max_downloads = 2;
				} else if (connection === 'tor') {
					max_downloads = 2;
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

		if (this.peers.length > 0) {

			for (let p = 0, pl = this.peers.length; p < pl; p++) {

				this.peers[p].disconnect();

				this.peers.splice(p, 1);
				pl--;
				p--;

			}

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

	open: function(url) {

		url = isString(url) ? url : null;


		let ref = URL.parse(url);
		if (URL.isURL(ref) === true) {

			let request = null;

			for (let s = 0, sl = this.settings.sessions.length; s < sl; s++) {

				let cached = this.settings.sessions[s].get(ref.url);
				if (cached !== null) {
					request = cached;
					break;
				}

			}

			if (request === null) {

				for (let r = 0, rl = this.requests.length; r < rl; r++) {

					let cached = this.requests[r];
					if (cached.url === ref.url) {
						request = cached;
						break;
					}

				}

			}

			if (request === null) {

				if (this.settings.internet.connection === 'i2p') {
					ref.proxy = { host: '127.0.0.1', port: 4444 };
				} else if (this.settings.internet.connection === 'tor') {
					ref.proxy = { host: '127.0.0.1', port: 9050 };
				}

				request = new Request({
					config:   get_config.call(this, ref.url),
					ref:      ref,
					blockers: this.settings.blockers
				}, this.server);

				request.on('error',    () => remove_request.call(this, request));
				request.on('redirect', () => remove_request.call(this, request));
				request.on('response', () => remove_request.call(this, request));

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
				if (address === '::1' || address.startsWith('127.0.0.')) {
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
					headers['domain'] = sdomain = hostname;
				} else if (sdomain === '127.0.0.1') {
					headers['domain'] = sdomain = hostname;
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

