
import os from 'os';

import { console                        } from './console.mjs';
import { isFunction, isObject, isString } from './BASE.mjs';
import { Request                        } from './Request.mjs';
import { Server                         } from './Server.mjs';
import { Session                        } from './Session.mjs';
import { Settings                       } from './Settings.mjs';
import { IP                             } from './parser/IP.mjs';
import { URL                            } from './parser/URL.mjs';



const HOSTNAME = os.hostname();

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



const Stealth = function(data) {

	let settings = Object.assign({
		profile: null,
		root:    null
	}, data);

	console.log('Stealth Service Command-Line Arguments:');
	console.log(settings);


	this.__debug  = settings.debug === true;
	this.settings = new Settings(this,
		settings.profile,
		settings.debug === true ? null : settings.root + '/profile'
	);
	this.peers    = [];
	this.requests = [];
	this.server   = new Server(this);


	this.scheduler = setInterval(() => {

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

};


Stealth.prototype = {

	connect: function(host, callback) {

		host     = isString(host)       ? host     : 'localhost';
		callback = isFunction(callback) ? callback : null;


		if (this.server !== null) {

			if (callback !== null) {
				this.server.connect(host, (result) => callback(result));
			} else {
				return this.server.connect(host);
			}

		} else {

			if (callback !== null) {
				callback(false);
			}

			return false;

		}

	},

	disconnect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.scheduler !== null) {
			clearInterval(this.scheduler);
		}

		if (this.peers.length > 0) {
			this.peers.forEach((peer) => {
				peer.disconnect();
			});
		}

		if (this.requests.length > 0) {
			this.requests.forEach((request) => {
				request.kill();
			});
		}

		if (this.__debug === true) {

			if (this.server !== null) {

				if (callback !== null) {
					this.server.disconnect((result) => callback(result));
				} else {
					this.server.disconnect();
				}

			} else {

				if (callback !== null) {
					callback(false);
				}

			}

		} else {

			this.settings.save(true, () => {

				if (this.server !== null) {

					if (callback !== null) {
						this.server.disconnect((result) => callback(result));
					} else {
						this.server.disconnect();
					}

				} else {

					if (callback !== null) {
						callback(false);
					}

				}

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
					headers['domain'] = sdomain = HOSTNAME;
				} else if (sdomain === '127.0.0.1') {
					headers['domain'] = sdomain = HOSTNAME;
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

};


export { Stealth };

