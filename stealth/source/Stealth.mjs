
import process from 'process';

import { console, isObject, isString } from './BASE.mjs';
import { Emitter                     } from './Emitter.mjs';
import { hostname, root              } from './ENVIRONMENT.mjs';
import { Request                     } from './Request.mjs';
import { Server                      } from './Server.mjs';
import { Session                     } from './Session.mjs';
import { Settings                    } from './Settings.mjs';
import { IP                          } from './parser/IP.mjs';
import { URL                         } from './parser/URL.mjs';



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


	console.log('Stealth Command-Line Arguments:');
	console.log(this._settings);


	this.interval = null;
	this.settings = new Settings(this,
		this._settings.profile,
		this._settings.debug === true ? null : this._settings.root + '/profile'
	);
	this.peers    = [];
	this.requests = [];
	this.server   = new Server(this);

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
			this.peers.forEach((peer) => {
				peer.disconnect();
			});
		}

		if (this.requests.length > 0) {
			this.requests.forEach((request) => request.kill());
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


Stealth.prototype = Object.assign({}, Emitter.prototype, {

	connect: function() {

		if (this.__state.connected === false) {

			let host = isString(this._settings.host) ? this._settings.host : 'localhost';

			this.server.connect(host, (result) => {

				if (result === true) {

					this.__state.connected = true;
					this.emit('connect');

				} else {

					this.__state.connected = false;
					this.emit('disconnect');

				}

			});

			return true;

		}


		return false;

	},

	disconnect: function() {

		if (this._settings.debug === true) {

			this.server.disconnect(() => {

				this.__state.connected = false;
				this.emit('disconnect');

			});

		} else {

			this.settings.save(true, () => {

				this.server.disconnect(() => {

					this.__state.connected = false;
					this.emit('disconnect');

				});

			});

		}

		return true;

	},

	open: function(url) {

		url = isString(url) ? url : '';


		if (url !== null) {

			let ref      = URL.parse(url);
			let request  = null;
			let sessions = this.settings.sessions;

			for (let s = 0, sl = sessions.length; s < sl; s++) {

				let cached = sessions[s].get(ref.url);
				if (cached !== null) {
					request = cached;
					break;
				}

			}

			if (request === null) {

				request = new Request({
					config: get_config.call(this, ref.url),
					ref:    ref,
					url:    ref.url
				}, this);

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

	init: function(session, headers) {

		session = session instanceof Session ? session : null;
		headers = isObject(headers)          ? headers : null;


		if (session !== null) {

			let sessions = this.settings.sessions;
			if (sessions.includes(session) === false) {
				sessions.push(session);
			}

			return session;

		} else if (headers !== null) {

			let address  = headers['@remote'] || null;
			let sessions = this.settings.sessions;

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

					for (let s = 0; s < sessions.length; s++) {

						let other = sessions[s];
						if (other.domain === sdomain) {
							session = other;
							break;
						}

					}

				}

			}

			if (session !== null) {
				session.set(headers);
			} else {
				session = new Session(headers);
				sessions.push(session);
			}

			return session;

		}


		return null;

	},

	kill: function(session) {

		session = session instanceof Session ? session : null;


		if (session !== null) {

			let sessions = this.settings.sessions;
			if (sessions.includes(session) === true) {

				let index = sessions.indexOf(session);
				if (index !== -1) {
					sessions.splice(index, 1);
					session.kill();
				}

			}

			return true;

		}


		return false;

	}

});


export { Stealth };

