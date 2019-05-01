
import fs          from 'fs';
import os          from 'os';
import path        from 'path';
import process     from 'process';

import { isArray, isObject } from './POLYFILLS.mjs';

import { console } from './console.mjs';

const _PROFILE = (function(env, platform) {

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

const _USER = (function(env) {
	return env.SUDO_USER || env.USER;
})(process.env);



const _info = (settings) => `
${settings.blockers.length} blocker${settings.blockers.length === 1 ? '' : 's'}, \
${settings.filters.length} filter${settings.filters.length === 1 ? '' : 's'}, \
${settings.hosts.length} host${settings.hosts.length === 1 ? '' : 's'}, \
${settings.modes.length} mode${settings.modes.length === 1 ? '' : 's'}, \
${settings.peers.length} peer${settings.peers.length === 1 ? '' : 's'}, \
${settings.redirects.length} redirect${settings.redirects.length === 1 ? '' : 's'}.
`;


const _read_file = function(url, data, complete) {

	complete = typeof complete === 'boolean' ? complete : false;


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

				if (complete === true) {

					tmp.forEach((object) => {
						data.push(object);
					});

				} else {

					tmp.forEach((object) => {

						if ('domain' in object) {

							let check = data.find((d) => d.domain === object.domain) || null;
							if (check !== null) {

								for (let prop in object) {

									if (data[prop] === undefined) {
										data[prop] = object[prop];
									} else if (data[prop] === null && object[prop] !== null) {
										data[prop] = object[prop];
									}

								}

							} else {
								data.push(object);
							}

						} else if ('id' in object) {

							let check = data.find((d) => d.id === object.id) || null;
							if (check !== null) {

								for (let prop in object) {

									if (data[prop] === undefined) {
										data[prop] = object[prop];
									} else if (data[prop] === null && object[prop] !== null) {
										data[prop] = object[prop];
									}

								}

							} else {
								data.push(object);
							}

						}

					});

				}

			} else if (isObject(tmp) && isObject(data)) {

				Object.keys(tmp).forEach((key) => {
					data[key] = tmp[key];
				});

			}

			return true;

		}

	}


	return false;

};

const _read = function(profile, complete, callback) {

	complete = typeof complete === 'boolean'  ? complete : false;
	callback = typeof callback === 'function' ? callback : null;


	_setup(profile, (result) => {

		if (result === true) {

			let results = [
				_read_file.call(this, profile + '/internet.json',  this.internet),
				_read_file.call(this, profile + '/hosts.json',     this.hosts),
				_read_file.call(this, profile + '/modes.json',     this.modes),
				_read_file.call(this, profile + '/peers.json',     this.peers),
				_read_file.call(this, profile + '/redirects.json', this.redirects)
			];

			this.filters = [];
			results.push(_read_file.call(this, profile + '/filters.json', this.filters, true));

			if (complete === true) {
				this.blockers = [];
				results.push(_read_file.call(this, profile + '/blockers.json', this.blockers, true));
			}


			let check = results.filter((r) => r === true);
			if (callback !== null) {
				callback(check.length === results.length);
			}

		} else {
			callback(false);
		}

	});

};

const _save_file = function(url, data) {

	let result = false;

	try {
		fs.writeFileSync(path.resolve(url), JSON.stringify(data, null, '\t'), 'utf8');
		result = true;
	} catch (err) {
		result = false;
	}

	return result;

};

const _save = function(profile, callback) {

	callback = typeof callback === 'function' ? callback : null;


	_setup(profile, (result) => {

		if (result === true) {

			let results = [
				_save_file.call(this, profile + '/internet.json',  this.internet),
				_save_file.call(this, profile + '/filters.json',   this.filters),
				_save_file.call(this, profile + '/hosts.json',     this.hosts),
				_save_file.call(this, profile + '/modes.json',     this.modes),
				_save_file.call(this, profile + '/peers.json',     this.peers),
				_save_file.call(this, profile + '/redirects.json', this.redirects)
			];

			let check = results.filter((r) => r === true);
			if (callback !== null) {
				callback(check.length === results.length);
			}

		} else {
			callback(false);
		}

	});

};

const _setup_dir = function(url) {

	let result = false;

	try {

		let stat = fs.lstatSync(path.resolve(url));
		if (stat.isDirectory()) {
			result = true;
		}

	} catch (err) {

		fs.mkdirSync(path.resolve(url));

		try {

			let stat = fs.lstatSync(path.resolve(url));
			if (stat.isDirectory()) {
				result = true;
			}

		} catch (err) {
			result = false;
		}

	}

	return result;

};

const _setup = function(profile, callback) {

	fs.lstat(path.resolve(profile), (err, stat) => {

		if (err) {

			fs.mkdir(path.resolve(profile), {
				recursive: true
			}, (err) => {

				if (!err) {

					let results = [
						_setup_dir(profile + '/cache'),
						_setup_dir(profile + '/cache/headers'),
						_setup_dir(profile + '/cache/payload'),
						_setup_dir(profile + '/stash'),
						_setup_dir(profile + '/stash/headers'),
						_setup_dir(profile + '/stash/payload')
					];

					let check = results.filter((r) => r === true);
					if (check.length !== results.length) {
						console.error('Stealth Profile at "' + profile + '" is not writeable!');
					}

					if (callback !== null) {
						callback(check.length === results.length);
					}

				} else {
					console.error('Stealth Profile at "' + profile + '" is not writeable!');
					callback(false);
				}

			});

		} else if (stat.isDirectory()) {

			let results = [
				_setup_dir(profile + '/cache'),
				_setup_dir(profile + '/cache/headers'),
				_setup_dir(profile + '/cache/payload'),
				_setup_dir(profile + '/stash'),
				_setup_dir(profile + '/stash/headers'),
				_setup_dir(profile + '/stash/payload')
			];

			let check = results.filter((r) => r === true);
			if (check.length !== results.length) {
				console.error('Stealth Profile at "' + profile + '" is not writeable!');
			}

			if (callback !== null) {
				callback(check.length === results.length);
			}

		} else {
			console.error('Stealth Profile at "' + profile + '" is not a directory!');
			callback(false);
		}

	});

};



const Settings = function(stealth, profile, defaults) {

	profile  = typeof profile === 'string'  ? profile  : _PROFILE;
	defaults = typeof defaults === 'string' ? defaults : null;


	this.internet  = { connection: 'mobile' };
	this.blockers  = [];
	this.filters   = [];
	this.hosts     = [];
	this.modes     = [];
	this.peers     = [];
	this.redirects = [];

	this.profile = profile;


	if (defaults !== null) {

		_read.call(this, defaults, true, (result) => {

			if (result === true) {

				console.info('Stealth Defaults loaded.');

				let info = _info(this).trim();
				if (info.length > 0) {
					info.split('\n').forEach((i) => console.log('> ' + i));
				}

			}

		});

	}

	_read.call(this, this.profile, true, (result) => {

		if (result === true) {

			console.info('Stealth Profile loaded from "' + this.profile + '".');

			let info = _info(this).trim();
			if (info.length > 0) {
				info.split('\n').forEach((i) => console.log('> ' + i));
			}

		} else {

			this.profile = '/tmp/stealth-' + _USER;

			_read.call(this, this.profile, false, (result) => {

				if (result === true) {
					console.warn('Stealth Profile loaded from "' + this.profile + '".');
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
			peers:    []
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

		return data;

	},

	read: function(complete, callback) {

		complete = typeof complete === 'boolean'  ? complete : false;
		callback = typeof callback === 'function' ? callback : null;


		_read.call(this, this.profile, complete, (result) => {

			if (callback !== null) {
				callback(result);
			}

		});

	},

	save: function(complete, callback) {

		complete = typeof complete === 'boolean'  ? complete : false;
		callback = typeof callback === 'function' ? callback : null;


		_save.call(this, this.profile, complete, (result) => {

			if (callback !== null) {
				callback(result);
			}

		});

	}

};


export { Settings };

