
import fs      from 'fs';
import os      from 'os';
import path    from 'path';
import process from 'process';

import { isArray, isBoolean, isFunction, isObject, isString } from './POLYFILLS.mjs';

import { console } from './console.mjs';
import { Session } from './Session.mjs';

const PROFILE = (function(env, platform) {

	let profile = '/tmp/stealth';
	let user    = env.SUDO_USER || env.USER;

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {
		profile = '/home/' + user + '/Stealth';
	} else if (platform === 'darwin') {
		profile = '/Users/' + user + '/Library/Application Support/Stealth';
	} else if (platform === 'win32') {

		let tmp = path.resolve(process.env.USERPROFILE || 'C:\\users\\' + user).split('\\').join('/');
		if (tmp.includes(':')) {
			tmp = tmp.split(':').slice(1).join(':');
		}

		profile = tmp + '/Stealth';

	}

	return profile;

})(process.env, os.platform());

const USER = (function(env) {
	return env.SUDO_USER || env.USER;
})(process.env);



const _info = (settings) => `
${settings.blockers.length} blocker${settings.blockers.length === 1 ? '' : 's'}, \
${settings.filters.length} filter${settings.filters.length === 1 ? '' : 's'}, \
${settings.hosts.length} host${settings.hosts.length === 1 ? '' : 's'}, \
${settings.modes.length} mode${settings.modes.length === 1 ? '' : 's'}, \
${settings.peers.length} peer${settings.peers.length === 1 ? '' : 's'}, \
${settings.redirects.length} redirect${settings.redirects.length === 1 ? '' : 's'}, \
${settings.sessions.length} session${settings.sessions.length === 1 ? '' : 's'}.
`;


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
						if ('subdomain' in tmp[0]) {
							uuid.push('subdomain');
							uuid.push('domain');
						} else if ('domain' in tmp[0]) {
							uuid.push('domain');
						} else if ('id' in tmp[0]) {
							uuid.push('id');
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
				read_file.call(this, profile + '/internet.json',  this.internet,  false),
				read_file.call(this, profile + '/blockers.json',  this.blockers,  keepdata),
				read_file.call(this, profile + '/filters.json',   this.filters,   false),
				read_file.call(this, profile + '/hosts.json',     this.hosts,     keepdata),
				read_file.call(this, profile + '/modes.json',     this.modes,     keepdata),
				read_file.call(this, profile + '/peers.json',     this.peers,     keepdata),
				read_file.call(this, profile + '/redirects.json', this.redirects, keepdata),
				read_file.call(this, profile + '/sessions.json',  sessions,       keepdata)
			].filter((v) => v === false);

			if (sessions.length > 0) {

				if (keepdata === false) {

					this.sessions = sessions.map((raw) => {
						return Session.from(raw);
					}).filter((v) => v !== null);

				} else {

					sessions.map((raw) => {
						return Session.from(raw);
					}).filter((v) => v !== null).forEach((session) => {

						let other = this.sessions.find((s) => s.id === session.id) || null;
						if (other !== null) {
							Session.merge(other, session);
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

			// TODO: If keepdata is set to true,
			// then try to save data only incrementally
			// to user's profile!?

			let check = [
				save_file.call(this, profile + '/internet.json',  this.internet),
				true, // blockers cannot be modified
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
						console.error('Stealth Profile at "' + profile + '" is not writeable!');
					}

					if (callback !== null) {
						callback(check.length === 0);
					}

				} else {

					console.error('Stealth Profile at "' + profile + '" is not writeable!');

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
				console.error('Stealth Profile at "' + profile + '" is not writeable!');
			}

			if (callback !== null) {
				callback(check.length === 0);
			}

		} else {

			console.error('Stealth Profile at "' + profile + '" is not a directory!');

			if (callback !== null) {
				callback(false);
			}

		}

	});

};



const Settings = function(stealth, profile, vendor) {

	profile = isString(profile) ? profile : PROFILE;
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


	if (this.vendor !== null) {

		read.call(this, this.vendor, false, (result) => {

			if (result === true) {

				console.info('Vendor Profile loaded from "' + this.vendor + '".');

				let info = _info(this).trim();
				if (info.length > 0) {
					info.split('\n').forEach((i) => console.log('> ' + i));
				}

			}

		});

	}


	read.call(this, this.profile, true, (result) => {

		if (result === true) {

			console.info('Custom Profile loaded from "' + this.profile + '".');

			let info = _info(this).trim();
			if (info.length > 0) {
				info.split('\n').forEach((i) => console.log('> ' + i));
			}

		} else {

			this.profile = '/tmp/stealth-' + USER;

			read.call(this, this.profile, true, (result) => {

				if (result === true) {
					console.warn('Custom Profile loaded from "' + this.profile + '".');
				}

			});

		}

	});

};


Settings.prototype = {

	toJSON: function() {

		let data = {
			internet: {},
			filters:  [],
			hosts:    [],
			modes:    [],
			peers:    [],
			sessions: []
		};

		// XXX: this.blockers  is private
		// XXX: this.redirects is private

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

			if (callback !== null) {
				callback(result);
			}

		});

	}

};


export { Settings };

