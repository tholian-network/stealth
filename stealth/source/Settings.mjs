
import fs   from 'fs';
import path from 'path';

import { console, isArray, isBoolean, isFunction, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                                 } from './ENVIRONMENT.mjs';
import { Session, isSession                                          } from './Session.mjs';
import { HOSTS                                                       } from './parser/HOSTS.mjs';
import { Beacon                                                      } from './server/Beacon.mjs';
import { Blocker                                                     } from './server/Blocker.mjs';
import { Host                                                        } from './server/Host.mjs';
import { Mode                                                        } from './server/Mode.mjs';
import { Peer                                                        } from './server/Peer.mjs';
import { Redirect                                                    } from './server/Redirect.mjs';



export const isSettings = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Settings]';
};

const get_message = (settings) => `
${settings.beacons.length} Beacon${settings.beacons.length === 1 ? '' : 's'}, \
${settings.blockers.length} Blocker${settings.blockers.length === 1 ? '' : 's'}, \
${settings.hosts.length} Host${settings.hosts.length === 1 ? '' : 's'}, \
${settings.modes.length} Mode${settings.modes.length === 1 ? '' : 's'}, \
${settings.peers.length} Peer${settings.peers.length === 1 ? '' : 's'}, \
${settings.redirects.length} Redirect${settings.redirects.length === 1 ? '' : 's'}, \
${settings.sessions.length} Session${settings.sessions.length === 1 ? '' : 's'}.
`;

const init = function(callback) {

	callback = isFunction(callback) ? callback : null;


	let result = false;

	if (ENVIRONMENT.hosts !== null) {

		let stat = null;

		try {
			stat = fs.lstatSync(path.resolve(ENVIRONMENT.hosts));
		} catch (err) {
			stat = null;
		}

		if (stat !== null && stat.isFile() === true) {

			let tmp = null;

			try {
				tmp = fs.readFileSync(path.resolve(ENVIRONMENT.hosts), 'utf8');
			} catch (err) {
				tmp = null;
			}

			if (tmp !== null) {

				let hosts = HOSTS.parse(tmp);
				if (hosts !== null) {

					hosts.filter((host) => {

						if (host.domain.includes('.') === false) {
							return host.hosts.find((ip) => ip.scope === 'private') !== undefined;
						}

						return false;

					}).forEach((host) => {
						this.hosts.push(host);
					});

					result = true;

				}

			}

		}

	}

	if (callback !== null) {
		callback(result);
	}

};

const read_file = function(url, data, keepdata, isData) {

	keepdata = isBoolean(keepdata) ? keepdata : true;
	isData   = isFunction(isData)  ? isData   : null;


	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}


	if (stat === null) {

		try {
			fs.writeFileSync(path.resolve(url), JSON.stringify(data, null, '\t'), 'utf8');
		} catch (err) {
			// Do nothing
		}

		try {
			stat = fs.lstatSync(path.resolve(url));
		} catch (err) {
			stat = null;
		}

	}

	if (stat !== null && stat.isFile() === true) {

		let tmp = null;

		try {
			tmp = JSON.parse(fs.readFileSync(path.resolve(url), 'utf8'));
		} catch (err) {
			tmp = null;
		}

		if (tmp !== null) {

			if (isArray(tmp) === true && isArray(data) === true) {

				if (keepdata === false) {

					data.splice(0);

					tmp.forEach((object) => {

						if (isData !== null) {

							if (isData(object)) {
								data.push(object);
							}

						} else {
							data.push(object);
						}

					});

				} else {

					if (tmp.length > 0) {

						let uuid = [];
						if ('id' in tmp[0]) {
							uuid.push('id');
						} else if ('path' in tmp[0]) {
							uuid.push('domain');
							uuid.push('path');
						} else if ('domain' in tmp[0]) {
							uuid.push('domain');
						} else if ('host' in tmp[0]) {
							uuid.push('host');
						}

						if (uuid.length > 0) {

							let map = {};

							data.forEach((object) => {
								let id  = uuid.map((key) => object[key]).join('|');
								map[id] = object;
							});

							tmp.forEach((object) => {
								let id  = uuid.map((key) => object[key]).join('|');
								map[id] = object;
							});

							data.splice(0);

							Object.values(map).forEach((object) => {

								if (isData !== null) {

									if (isData(object) === true) {
										data.push(object);
									}

								} else {
									data.push(object);
								}

							});

						} else {

							tmp.forEach((object) => {

								if (isData !== null) {

									if (isData(object) === true) {
										data.push(object);
									}

								} else {
									data.push(object);
								}

							});

						}

					}

				}

			} else if (isObject(tmp) === true && isObject(data) === true) {

				if (keepdata === false) {

					Object.keys(data).forEach((key) => {
						delete data[key];
					});

				}


				if (isData !== null) {

					if (isData(tmp) === true) {

						Object.keys(tmp).forEach((key) => {
							data[key] = tmp[key];
						});

					}

				} else {

					Object.keys(tmp).forEach((key) => {
						data[key] = tmp[key];
					});

				}

			}

			return true;

		}

	}


	return false;

};

const read = function(profile, keepdata, callback) {

	keepdata = isBoolean(keepdata)  ? keepdata : true;
	callback = isFunction(callback) ? callback : null;


	setup(profile, (result) => {

		if (result === true) {

			let sessions = [];

			let check = [
				read_file.call(this, profile + '/internet.json',  this.internet,  keepdata),
				read_file.call(this, profile + '/beacons.json',   this.beacons,   keepdata, Beacon.isBeacon),
				read_file.call(this, profile + '/blockers.json',  this.blockers,  keepdata, Blocker.isBlocker),
				read_file.call(this, profile + '/hosts.json',     this.hosts,     keepdata, Host.isHost),
				read_file.call(this, profile + '/modes.json',     this.modes,     keepdata, Mode.isMode),
				read_file.call(this, profile + '/peers.json',     this.peers,     keepdata, Peer.isPeer),
				read_file.call(this, profile + '/redirects.json', this.redirects, keepdata, Redirect.isRedirect),
				read_file.call(this, profile + '/sessions.json',  sessions,       keepdata)
			].filter((v) => v === false);

			if (sessions.length > 0) {

				if (keepdata === false) {

					this.sessions = sessions.map((raw) => {

						let session = Session.from(raw);
						if (session !== null && session.tabs.length > 0) {
							return session;
						}

						return null;

					}).filter((session) => session !== null);

				} else {

					sessions.map((raw) => {

						let session = Session.from(raw);
						if (session !== null && session.tabs.length > 0) {
							return session;
						}

						return null;

					}).filter((session) => session !== null).forEach((session) => {

						let other = this.sessions.find((s) => s.domain === session.domain) || null;
						if (other !== null) {
							Session.merge(other, session);
						} else {
							this.sessions.push(session);
						}

					});

				}

			}

			if (callback !== null) {
				callback(check.length === 0);
			}

		} else if (callback !== null) {
			callback(false);
		}

	});

};

const save_file = function(url, data, isData) {

	isData = isFunction(isData) ? isData : null;


	let result = false;

	let tmp = null;

	if (isArray(data) === true) {

		if (isData !== null) {
			tmp = data.filter((object) => isData(object));
		} else {
			tmp = data;
		}

	} else if (isObject(data) === true) {

		if (isData !== null) {
			tmp = isData(data) ? data : null;
		} else {
			tmp = data;
		}

	}


	if (tmp !== null) {

		try {
			fs.writeFileSync(path.resolve(url), JSON.stringify(tmp, null, '\t'), 'utf8');
			result = true;
		} catch (err) {
			result = false;
		}

	}


	return result;

};

const save = function(profile, keepdata, callback) {

	keepdata = isBoolean(keepdata)  ? keepdata : true;
	callback = isFunction(callback) ? callback : null;


	setup(profile, (result) => {

		if (result === true) {

			if (this.sessions.length > 0) {

				if (this.internet.history !== 'forever') {

					this.sessions.forEach((session) => {

						session.tabs.forEach((tab) => {
							tab.forget(this.internet.history);
						});

					});

				}

			}


			let check = [
				save_file.call(this, profile + '/internet.json',  this.internet),
				save_file.call(this, profile + '/beacons.json',   this.beacons,   Beacon.isBeacon),
				true, // blockers cannot be saved
				save_file.call(this, profile + '/hosts.json',     this.hosts,     Host.isHost),
				save_file.call(this, profile + '/modes.json',     this.modes,     Mode.isMode),
				save_file.call(this, profile + '/peers.json',     this.peers,     Peer.isPeer),
				save_file.call(this, profile + '/redirects.json', this.redirects, Redirect.isRedirect),
				save_file.call(this, profile + '/sessions.json',  this.sessions,  isSession)
			].filter((v) => v === false);

			if (callback !== null) {
				callback(check.length === 0);
			}

		} else if (callback !== null) {
			callback(false);
		}

	});

};

const setup_dir = function(url) {

	let result = false;

	try {

		let stat = fs.lstatSync(path.resolve(url));
		if (stat.isDirectory() === true) {
			result = true;
		}

	} catch (err) {

		fs.mkdirSync(path.resolve(url));

		try {

			let stat = fs.lstatSync(path.resolve(url));
			if (stat.isDirectory() === true) {
				result = true;
			}

		} catch (err) {
			result = false;
		}

	}

	return result;

};

const setup = function(profile, callback) {

	fs.lstat(path.resolve(profile), (err, stat) => {

		if (err) {

			fs.mkdir(path.resolve(profile), {
				recursive: true
			}, (err) => {

				if (!err) {

					let check = [
						setup_dir(profile + '/cache'),
						setup_dir(profile + '/cache/headers'),
						setup_dir(profile + '/cache/payload'),
						setup_dir(profile + '/stash'),
						setup_dir(profile + '/stash/headers'),
						setup_dir(profile + '/stash/payload')
					].filter((v) => v === false);

					if (check.length !== 0) {
						console.error('Settings: Profile at "' + profile + '" is not writeable!');
					}

					if (callback !== null) {
						callback(check.length === 0);
					}

				} else {

					console.error('Settings: Profile at "' + profile + '" is not writeable!');

					if (callback !== null) {
						callback(false);
					}

				}

			});

		} else if (stat.isDirectory() === true) {

			let check = [
				setup_dir(profile + '/cache'),
				setup_dir(profile + '/cache/headers'),
				setup_dir(profile + '/cache/payload'),
				setup_dir(profile + '/stash'),
				setup_dir(profile + '/stash/headers'),
				setup_dir(profile + '/stash/payload')
			].filter((v) => v === false);

			if (check.length !== 0) {
				console.error('Settings: Profile at "' + profile + '" is not writeable!');
			}

			if (callback !== null) {
				callback(check.length === 0);
			}

		} else {

			console.error('Settings: Profile at "' + profile + '" is not a directory!');

			if (callback !== null) {
				callback(false);
			}

		}

	});

};



const Settings = function(settings) {

	this.internet  = {
		connection: 'mobile',
		history:    'stealth',
		useragent:  'stealth'
	};
	this.beacons   = [];
	this.blockers  = [];
	this.hosts     = [];
	this.modes     = [];
	this.peers     = [];
	this.redirects = [];
	this.sessions  = [];


	this.profile = ENVIRONMENT.profile;
	this.vendor  = null;

	if (isObject(settings) === true) {

		if (isString(settings.profile) === true) {
			this.profile = settings.profile;
		}

		if (isString(settings.vendor) === true) {
			this.vendor = settings.vendor;
		}

	}


	init.call(this, (result) => {

		if (result === true) {
			console.info('Settings: Native Hosts imported from "' + ENVIRONMENT.hosts + '".');
			console.log('> ' + this.hosts.length + ' Host' + (this.hosts.length === 1 ? '' : 's') + '.');
		}


		if (this.vendor !== null) {

			read.call(this, this.vendor, true, (result) => {

				if (result === true) {

					console.info('Settings: Vendor Profile imported from "' + this.vendor + '".');

					let message = get_message(this).trim();
					if (message.length > 0) {
						message.split('\n').forEach((m) => console.log('> ' + m));
					}

				}

			});

		}


		read.call(this, this.profile, true, (result) => {

			if (result === true) {

				console.info('Settings: Profile imported from "' + this.profile + '".');

				let message = get_message(this).trim();
				if (message.length > 0) {
					message.split('\n').forEach((m) => console.log('> ' + m));
				}

				// Ensure profile settings to be
				// in-sync with imported settings
				this.save();

			} else {

				this.profile = ENVIRONMENT.temp;

				read.call(this, this.profile, true, (result) => {

					if (result === true) {
						console.warn('Settings: Profile imported from "' + this.profile + '".');
					}

				});

			}

		});

	});

};


Settings.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Settings' ? json.type : null;
		let data = isObject(json.data)      ? json.data : null;

		if (type !== null && data !== null) {

			let settings = new Settings({
				profile: isString(data.profile) ? data.profile : null,
				vendor:  isString(data.vendor)  ? data.vendor  : null
			});

			if (isObject(data.internet) === true) {

				Object.keys(data.internet).forEach((key) => {
					settings.internet[key] = data.internet[key];
				});

			}

			if (isArray(data.beacons) === true) {
				settings.beacons = data.beacons.filter((beacon) => Beacon.isBeacon(beacon));
			}

			if (isArray(data.hosts) === true) {
				settings.hosts = data.hosts.filter((host) => Host.isHost(host));
			}

			if (isArray(data.modes) === true) {
				settings.modes = data.modes.filter((mode) => Mode.isMode(mode));
			}

			if (isArray(data.peers) === true) {
				settings.peers = data.peers.filter((peer) => Peer.isPeer(peer));
			}

			if (isArray(data.redirects) === true) {
				settings.redirects = data.redirects.filter((redirect) => Redirect.isRedirect(redirect));
			}

			if (isArray(data.sessions) === true) {
				settings.sessions = data.sessions.map((session) => Session.from(session)).filter((session) => session !== null);
			}

			return settings;

		}

	}


	return null;

};


Settings.isSettings = isSettings;


Settings.prototype = {

	[Symbol.toStringTag]: 'Settings',

	toJSON: function() {

		let data = {
			internet:  {},
			beacons:   [],
			blockers:  null, // private
			hosts:     [],
			modes:     [],
			peers:     [],
			profile:   null,
			redirects: null, // private
			sessions:  [],
			vendor:    null
		};

		Object.keys(this.internet).forEach((key) => {
			data.internet[key] = this.internet[key];
		});

		this.beacons.forEach((beacon) => {

			if (Beacon.isBeacon(beacon) === true) {
				data.beacons.push(beacon);
			}

		});

		this.hosts.forEach((host) => {

			if (Host.isHost(host) === true) {
				data.hosts.push(host);
			}

		});

		this.modes.forEach((mode) => {

			if (Mode.isMode(mode) === true) {
				data.modes.push(mode);
			}

		});

		this.peers.forEach((peer) => {

			if (Peer.isPeer(peer) === true) {
				data.peers.push(peer);
			}

		});

		if (this.profile !== ENVIRONMENT.profile) {
			data.profile = this.profile;
		}

		this.sessions.forEach((session) => {

			if (isSession(session) === true) {
				data.sessions.push(session.toJSON());
			}

		});

		if (this.vendor !== null) {
			data.vendor = this.vendor;
		}


		return {
			type: 'Settings',
			data: data
		};

	},

	read: function(keepdata, callback) {

		keepdata = isBoolean(keepdata)  ? keepdata : true;
		callback = isFunction(callback) ? callback : null;


		read.call(this, this.profile, keepdata, (result) => {

			if (callback !== null) {
				callback(result);
			}

		});

	},

	save: function(keepdata, callback) {

		keepdata = isBoolean(keepdata)  ? keepdata : true;
		callback = isFunction(callback) ? callback : null;


		save.call(this, this.profile, keepdata, (result) => {

			if (result === true) {
				console.info('Settings: Profile saved to "' + this.profile + '".');
			}

			if (callback !== null) {
				callback(result);
			}

		});

	}

};


export { Settings };

