
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


	fs.lstat(profile, (err, stat) => {

		if (!err) {

			let result = [
				_read_file.call(this, profile + '/internet.json', this.internet),
				_read_file.call(this, profile + '/filters.json',  this.filters),
				_read_file.call(this, profile + '/hosts.json',    this.hosts),
				_read_file.call(this, profile + '/peers.json',    this.peers),
				_read_file.call(this, profile + '/sites.json',    this.sites)
			];

			let check = result.filter(r => r === true);
			if (callback !== null) {
				callback(check.length === result.length);
			}

		} else if (err.code === 'ENOENT') {

			fs.mkdir(profile, {
				recursive: true
			}, (err) => {

				let result = [
					_read_file.call(this, profile + '/internet.json', this.internet),
					_read_file.call(this, profile + '/filters.json',  this.filters),
					_read_file.call(this, profile + '/hosts.json',    this.hosts),
					_read_file.call(this, profile + '/peers.json',    this.peers),
					_read_file.call(this, profile + '/sites.json',    this.sites)
				];

				let check = result.filter(r => r === true);
				if (callback !== null) {
					callback(check.length === result.length);
				}

			});

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


	fs.lstat(profile, (err, stat) => {

		if (!err) {

			let result = [
				_save_file.call(this, profile + '/internet.json', this.internet),
				_save_file.call(this, profile + '/filters.json',  this.filters),
				_save_file.call(this, profile + '/hosts.json',    this.hosts),
				_save_file.call(this, profile + '/peers.json',    this.peers),
				_save_file.call(this, profile + '/sites.json',    this.sites)
			];

			let check = result.filter(r => r === true);
			if (callback !== null) {
				callback(check.length === result.length);
			}

		} else if (err.code === 'ENOENT') {

			fs.mkdir(profile, {
				recursive: true
			}, (err) => {

				let result = [
					_save_file.call(this, profile + '/internet.json', this.internet),
					_save_file.call(this, profile + '/filters.json',  this.filters),
					_save_file.call(this, profile + '/hosts.json',    this.hosts),
					_save_file.call(this, profile + '/peers.json',    this.peers),
					_save_file.call(this, profile + '/sites.json',    this.sites)
				];

				let check = result.filter(r => r === true);
				if (callback !== null) {
					callback(check.length === result.length);
				}

			});

		}

	});

};



const Settings = function(stealth, profile) {

	profile = typeof profile === 'string' ? profile : _PROFILE;


	this.internet = {
		connection: 'mobile',
		torify:     false
	};

	this.filters = [];
	this.hosts   = [];
	this.peers   = [];
	this.sites   = [];

	this.profile = profile;


	_read.call(this, this.profile, result => {

		if (result === true) {
			console.info('Stealth Profile is at "' + this.profile + '".');
		} else {
			console.warn('Stealth Profile is at "/tmp/stealth".');
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

