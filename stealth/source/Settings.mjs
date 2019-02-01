
import fs          from 'fs';
import os          from 'os';
import process     from 'process';



const _PROFILE = (function(env, platform) {

	let profile = '/tmp/stealth';
	let user    = env.SUDO_USER || env.USER;

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {
		profile = '/home/' + user + '/Stealth';
	} else if (platform === 'darwin') {
		profile = '/Users/' + user + '/Library/Application Support/Stealth';
	}

	return profile;

})(process.env, os.platform());



const _info = (settings) => `
${settings.filters.length} filter${settings.filters.length === 1 ? '' : 's'}, \
${settings.hosts.length} host${settings.hosts.length === 1 ? '' : 's'}, \
${settings.peers.length} peer${settings.peers.length === 1 ? '' : 's'}, \
${settings.sites.length} site${settings.sites.length === 1 ? '' : 's'}.
${settings.blockers.hosts.length} blocked host${settings.blockers.hosts.length === 1 ? '' : 's'}, \
${settings.blockers.filters.length} blocked url${settings.blockers.filters.length === 1 ? '' : 's'}.
`;


const _read_file = function(path, data) {

	let stat = null;
	try {
		stat = fs.lstatSync(path);
	} catch (err) {
	}


	if (stat === null) {

		try {
			fs.writeFileSync(path, JSON.stringify(data, null, '\t'), 'utf8');
		} catch (err) {
		}

		try {
			stat = fs.lstatSync(path);
		} catch (err) {
		}

	}

	if (stat !== null && stat.isFile() === true) {

		let tmp = null;

		try {
			tmp = JSON.parse(fs.readFileSync(path, 'utf8'));
		} catch (err) {
		}

		if (tmp !== null) {

			if (tmp instanceof Array && data instanceof Array) {

				tmp.forEach(object => {

					if ('domain' in object) {

						let check = data.find(d => d.domain === object.domain) || null;
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

						let check = data.find(d => d.id === object.id) || null;
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

			} else if (tmp instanceof Object && data instanceof Object) {

				Object.keys(tmp).forEach(key => {
					data[key] = tmp[key];
				});

			}

			return true;

		}

	}


	return false;

};

const _read = function(profile, callback) {

	callback = typeof callback === 'function' ? callback : null;


	_setup(profile, result => {

		if (result === true) {

			let results = [
				_read_file.call(this, profile + '/blockers/hosts.json',   this.blockers.hosts),
				_read_file.call(this, profile + '/blockers/filters.json', this.blockers.filters),
				_read_file.call(this, profile + '/internet.json', this.internet),
				_read_file.call(this, profile + '/filters.json',  this.filters),
				_read_file.call(this, profile + '/hosts.json',    this.hosts),
				_read_file.call(this, profile + '/peers.json',    this.peers),
				_read_file.call(this, profile + '/sites.json',    this.sites)
			];

			let check = results.filter(r => r === true);
			if (callback !== null) {
				callback(check.length === results.length);
			}

		} else {
			callback(false);
		}

	});

};

const _save_file = function(path, data) {

	let result = false;

	try {
		fs.writeFileSync(path, JSON.stringify(data, null, '\t'), 'utf8');
		result = true;
	} catch (err) {
	}

	return result;

};

const _save = function(profile, callback) {

	callback = typeof callback === 'function' ? callback : null;


	_setup(profile, result => {

		if (result === true) {

			let results = [
				_save_file.call(this, profile + '/internet.json', this.internet),
				_save_file.call(this, profile + '/filters.json',  this.filters),
				_save_file.call(this, profile + '/hosts.json',    this.hosts),
				_save_file.call(this, profile + '/peers.json',    this.peers),
				_save_file.call(this, profile + '/sites.json',    this.sites)
			];

			let check = results.filter(r => r === true);
			if (callback !== null) {
				callback(check.length === results.length);
			}

		} else {
			callback(false);
		}

	});

};

const _setup = function(profile, callback) {

	fs.lstat(profile, (err, stat) => {

		if (err) {

			fs.mkdir(profile, {
				recursive: true
			}, (err) => {

				if (!err) {

					try {
						fs.mkdirSync(profile + '/cache');
						fs.mkdirSync(profile + '/download');
						fs.mkdirSync(profile + '/blockers');
						fs.mkdirSync(profile + '/scrapers');
					} catch (err) {
					}

					callback(true);

				} else {
					callback(false);
				}

			});

		} else {

			try {
				fs.mkdirSync(profile + '/cache');
				fs.mkdirSync(profile + '/download');
				fs.mkdirSync(profile + '/blockers');
				fs.mkdirSync(profile + '/scrapers');
			} catch (err) {
			}

			callback(true);

		}

	});

};



const Settings = function(stealth, profile, defaults) {

	profile  = typeof profile === 'string'  ? profile  : _PROFILE;
	defaults = typeof defaults === 'string' ? defaults : null;


	this.internet = {
		connection: 'mobile',
		torify:     false
	};

	this.blockers = { hosts: [], filters: [] };
	this.filters  = [];
	this.hosts    = [];
	this.peers    = [];
	this.sites    = [];

	this.profile = profile;


	if (defaults !== null) {

		_read.call(this, defaults, result => {

			if (result === true) {

				console.info('Stealth Defaults loaded.');

				let info = _info(this).trim();
				if (info.length > 0) {
					info.split('\n').forEach(i => console.log('> ' + i));
				}

			}

		});

	}

	_read.call(this, this.profile, result => {

		if (result === true) {

			console.info('Stealth Profile loaded from "' + this.profile + '".');

			let info = _info(this).trim();
			if (info.length > 0) {
				info.split('\n').forEach(i => console.log('> ' + i));
			}

		} else {

			console.warn('Stealth Profile loaded from "/tmp/stealth".');

		}

	});

};


Settings.prototype = {

	toJSON: function() {

		let data = {
			internet: {},
			filters:  [],
			hosts:    [],
			peers:    [],
			sites:    []
		};


		Object.keys(this.internet).forEach(key => {
			data.internet[key] = this.internet[key];
		});

		this.filters.forEach(filter => {
			data.filters.push(filter);
		});

		this.hosts.forEach(host => {
			data.hosts.push(host);
		});

		this.peers.forEach(peer => {
			data.peers.push(peer);
		});

		this.sites.forEach(site => {
			data.sites.push(site);
		});


		return data;

	},

	read: function(callback) {

		callback = typeof callback === 'function' ? callback : null;


		_read.call(this, this.profile, result => {

			if (callback !== null) {
				callback(result);
			}

		});

	},

	save: function(callback) {

		callback = typeof callback === 'function' ? callback : null;


		_save.call(this, this.profile, result => {

			if (callback !== null) {
				callback(result);
			}

		});

	}

};


export { Settings };

