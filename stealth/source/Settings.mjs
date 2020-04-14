
import fs   from 'fs';
import path from 'path';

import { console, isArray, isBoolean, isFunction, isObject, isString } from './BASE.mjs';
import { hosts as default_hosts, profile as default_profile, temp    } from './ENVIRONMENT.mjs';
import { Session                                                     } from './Session.mjs';
import { HOSTS                                                       } from './parser/HOSTS.mjs';



const get_latest = function(json) {

	json = isObject(json) ? json : {};


	let latest = null;

	let type = json.type === 'Request' ? json.type : null;
	let data = isObject(json.data)     ? json.data : null;

	if (type !== null && data !== null) {

		let timeline = isObject(data.timeline) ? data.timeline : null;
		if (timeline !== null) {

			Object.values(timeline).forEach((time) => {

				if (time !== null) {

					if (latest !== null && time > latest) {
						latest = time;
					} else if (latest === null) {
						latest = time;
					}

				}

			});

		}

	}

	return latest;

};

const get_message = (settings) => `
${settings.blockers.length} Blocker${settings.blockers.length === 1 ? '' : 's'}, \
${settings.filters.length} Filter${settings.filters.length === 1 ? '' : 's'}, \
${settings.hosts.length} Host${settings.hosts.length === 1 ? '' : 's'}, \
${settings.modes.length} Mode${settings.modes.length === 1 ? '' : 's'}, \
${settings.peers.length} Peer${settings.peers.length === 1 ? '' : 's'}, \
${settings.redirects.length} Redirect${settings.redirects.length === 1 ? '' : 's'}, \
${settings.sessions.length} Session${settings.sessions.length === 1 ? '' : 's'}.
`;

const init = function(callback) {

	callback = isFunction(callback) ? callback : null;


	let result = false;

	if (default_hosts !== null) {

		let stat = null;

		try {
			stat = fs.lstatSync(path.resolve(default_hosts));
		} catch (err) {
			stat = null;
		}

		if (stat !== null && stat.isFile() === true) {

			let tmp = null;

			try {
				tmp = fs.readFileSync(path.resolve(default_hosts), 'utf8');
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

const read_file = function(url, data, keepdata) {

	keepdata = isBoolean(keepdata) ? keepdata : true;


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

			if (isArray(tmp) && isArray(data)) {

				if (keepdata === false) {

					data.splice(0);

					tmp.forEach((object) => {
						data.push(object);
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
								data.push(object);
							});

						} else {

							tmp.forEach((object) => {
								data.push(object);
							});

						}

					}

				}

			} else if (isObject(tmp) && isObject(data)) {

				if (keepdata === false) {

					Object.keys(data).forEach((key) => {
						delete data[key];
					});

				}

				Object.keys(tmp).forEach((key) => {
					data[key] = tmp[key];
				});

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
				read_file.call(this, profile + '/blockers.json',  this.blockers,  keepdata),
				read_file.call(this, profile + '/filters.json',   this.filters,   keepdata),
				read_file.call(this, profile + '/hosts.json',     this.hosts,     keepdata),
				read_file.call(this, profile + '/modes.json',     this.modes,     keepdata),
				read_file.call(this, profile + '/peers.json',     this.peers,     keepdata),
				read_file.call(this, profile + '/redirects.json', this.redirects, keepdata),
				read_file.call(this, profile + '/sessions.json',  sessions,       keepdata)
			].filter((v) => v === false);

			if (sessions.length > 0) {

				if (keepdata === false) {

					this.sessions = sessions.map((raw) => {

						let session = Session.from(raw);
						if (session !== null) {

							if (Object.keys(session.history).length > 0) {

								let count = 0;

								Object.values(session.history).forEach((history) => {
									count += history.length;
								});

								if (count > 0) {
									return session;
								}

							}

						}

						return null;

					}).filter((v) => v !== null);

				} else {

					sessions.map((raw) => {

						let session = Session.from(raw);
						if (session !== null) {

							if (Object.keys(session.history).length > 0) {

								let count = 0;

								Object.values(session.history).forEach((history) => {
									count += history.length;
								});

								if (count > 0) {
									return session;
								}

							}

						}

						return null;

					}).filter((v) => v !== null).forEach((session) => {

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

const save_file = function(url, data) {

	let result = false;

	try {
		fs.writeFileSync(path.resolve(url), JSON.stringify(data, null, '\t'), 'utf8');
		result = true;
	} catch (err) {
		result = false;
	}

	return result;

};

const save = function(profile, keepdata, callback) {

	keepdata = isBoolean(keepdata)  ? keepdata : true;
	callback = isFunction(callback) ? callback : null;


	setup(profile, (result) => {

		if (result === true) {

			if (this.sessions.length > 0) {

				let limit = null;
				if (this.internet.history === 'stealth') {
					limit = Date.now();
				} else if (this.internet.history === 'day') {
					limit = Date.now() - (1000 * 60 * 60 * 24);
				} else if (this.internet.history === 'week') {
					limit = Date.now() - (1000 * 60 * 60 * 24 * 7);
				} else if (this.internet.history === 'forever') {
					limit = null;
				}

				if (limit !== null) {

					let count = 0;

					this.sessions.forEach((session) => {

						for (let tid in session.history) {

							let history = session.history[tid];
							if (history.length > 0) {

								for (let h = 0, hl = history.length; h < hl; h++) {

									let request = history[h];
									let latest  = get_latest(request);
									if (latest !== null && latest < limit) {
										history.splice(h, 1);
										count++;
										hl--;
										h--;
									} else if (latest === null) {
										history.splice(h, 1);
										count++;
										hl--;
										h--;
									}

								}

							}

						}

					});

					if (count > 0) {
						console.warn('Settings: ' + count + ' Request' + (count === 1 ? '' : 's') + ' removed from History.');
					}

				}

			}


			let check = [
				save_file.call(this, profile + '/internet.json',  this.internet),
				true, // blockers cannot be saved
				save_file.call(this, profile + '/filters.json',   this.filters),
				save_file.call(this, profile + '/hosts.json',     this.hosts),
				save_file.call(this, profile + '/modes.json',     this.modes),
				save_file.call(this, profile + '/peers.json',     this.peers),
				save_file.call(this, profile + '/redirects.json', this.redirects),
				save_file.call(this, profile + '/sessions.json',  this.sessions)
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



const Settings = function(stealth, profile, vendor) {

	profile = isString(profile) ? profile : default_profile;
	vendor  = isString(vendor)  ? vendor  : null;


	this.internet  = {
		connection: 'mobile',
		history:    'stealth',
		useragent:  'stealth'
	};
	this.blockers  = [];
	this.filters   = [];
	this.hosts     = [];
	this.modes     = [];
	this.peers     = [];
	this.redirects = [];
	this.sessions  = [];

	this.profile = profile;
	this.vendor  = vendor;


	init.call(this, (result) => {

		if (result === true) {
			console.info('Settings: Native Hosts imported from "' + default_hosts + '".');
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

				this.profile = temp;

				read.call(this, this.profile, true, (result) => {

					if (result === true) {
						console.warn('Settings: Profile imported from "' + this.profile + '".');
					}

				});

			}

		});

	});

};


Settings.prototype = {

	toJSON: function() {

		let data = {
			internet:  {},
			blockers:  null, // XXX: private
			filters:   [],
			hosts:     [],
			modes:     [],
			peers:     [],
			redirects: null, // XXX: private
			sessions:  []
		};

		Object.keys(this.internet).forEach((key) => {
			data.internet[key] = this.internet[key];
		});

		this.filters.forEach((filter) => {
			data.filters.push(filter);
		});

		this.hosts.forEach((host) => {
			data.hosts.push(host);
		});

		this.modes.forEach((mode) => {
			data.modes.push(mode);
		});

		this.peers.forEach((peer) => {
			data.peers.push(peer);
		});

		this.sessions.forEach((session) => {
			data.sessions.push(session.toJSON());
		});


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

