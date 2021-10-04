
import child_process from 'child_process';
import fs            from 'fs';
import os            from 'os';
import path          from 'path';
import process       from 'process';



const TEMPORARY = {};

const action = (() => {

	let value = Array.from(process.argv).slice(2).filter((v) => v.startsWith('--') === false).shift() || '';

	if (/^([check]{5})$/g.test(value) === true) {
		return 'check';
	} else if (/^([inspect]{7})$/g.test(value) === true) {
		return 'inspect';
	} else if (/^([scan]{4})$/g.test(value) === true) {
		return 'scan';
	} else if (/^([time]{4})$/g.test(value) === true) {
		return 'time';
	}

	return 'help';

})();

const flags = (() => {

	let flags = {
		debug:    false,
		inspect:  null,
		internet: true,
		network:  null,
		report:   null,
		timeout:  null
	};

	Array.from(process.argv).slice(2).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=').map((v) => v.trim());
		if (tmp.length === 2) {

			let key = tmp[0];
			let val = tmp[1];

			let num = parseInt(val, 10);
			if (Number.isNaN(num) === false && (num).toString() === val) {
				val = num;
			} else if (val === 'true') {
				val = true;
			} else if (val === 'false') {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else if (val.endsWith('s') === true) {

				let num = parseInt(val.substr(0, val.length - 1), 10);
				if (Number.isNaN(num) === false) {
					val = num + 's';
				}

			}

			flags[key] = val;

		}

	});

	return flags;

})();

const patterns = (() => {

	let patterns = [];

	Array.from(process.argv).slice(2).filter((v) => v.startsWith('--') === false).slice(1).forEach((pattern) => {
		patterns.push(pattern);
	});

	return patterns;

})();

const project = (() => {

	let folder   = '/tmp/covert';
	let platform = os.platform();

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd' || platform === 'darwin') {

		let pwd = process.env.PWD || null;
		if (pwd !== null) {
			folder = path.resolve(pwd);
		}

	} else if (platform === 'android') {

		let pwd = process.env.PWD || null;
		if (pwd !== null) {
			folder = path.resolve(pwd);
		}

	} else if (platform === 'win32') {

		if (process.env.MSYSTEM === 'MINGW64') {

			let pwd = process.env.PWD || null;
			if (pwd.startsWith('/c/') === true) {
				folder = path.resolve('C:\\' + pwd.substr(3).split('/').join('\\'));
			}

		} else {

			let cwd = null;
			try {
				cwd = child_process.execSync('echo %cd%').toString('utf8').trim();
			} catch (err) {
				cwd = null;
			}

			if (cwd !== null) {
				folder = cwd;
			}

		}

	}

	if (folder.endsWith('/') === true) {
		folder = folder.substr(0, folder.length - 1);
	}

	return folder;

})();

const read = (sandbox, url) => {

	let found = false;

	for (let tmp in TEMPORARY) {

		if (tmp === sandbox) {
			found = true;
			break;
		}

	}

	if (found === true) {

		if (url.startsWith('/') === true) {
			url = url.substr(1);
		}

		let buffer = null;

		try {
			buffer = fs.readFileSync(sandbox + '/' + url);
		} catch (err) {
			buffer = null;
		}

		return buffer;

	}

	return null;

};

const temp = (() => {

	let user     = process.env.SUDO_USER || process.env.USER || process.env.USERNAME;
	let folder   = '/tmp/covert-' + user;
	let platform = os.platform();

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {
		folder = path.resolve('/tmp/covert-' + user);
	} else if (platform === 'android') {
		folder = path.resolve(process.env.TMPDIR || '/mnt/sdcard/Covert');
	} else if (platform === 'darwin') {
		folder = path.resolve(process.env.TMPDIR || '/tmp/covert-' + user);
	} else if (platform === 'win32') {
		folder = path.resolve(process.env.USERPROFILE + '\\AppData\\Local\\Temp\\covert-' + user);
	}

	if (folder.endsWith('/') === true) {
		folder = folder.substr(0, folder.length - 1);
	}

	return folder;

})();

const randomize = (length) => {

	let str = '';

	for (let a = 0; a < length / 2; a++) {

		let val = '' + ((Math.random() * 0xff) | 0).toString(16);
		if (val.length < 2) {
			val = '0' + val;
		}

		str += val;

	}

	return str;

};

const mktemp = (prefix, seed) => {

	prefix = typeof prefix === 'string' ? prefix                   : randomize(4);
	seed   = typeof seed === 'number'   ? Math.round(seed / 2) * 2 : null;


	if (prefix.startsWith('/') === true) {
		prefix = prefix.substr(1);
	}

	if (prefix.endsWith('/') === true) {
		prefix = prefix.substr(0, prefix.length - 1);
	}



	if (seed !== null) {

		let tmp = path.resolve(temp + '/' + prefix + '-' + randomize(seed));

		while (TEMPORARY[tmp] !== undefined) {
			tmp = path.resolve(temp + '/' + prefix + '-' + randomize(seed));
		}

		TEMPORARY[tmp] = 0;

		return tmp;

	} else {

		let tmp = path.resolve(temp + '/' + prefix);

		if (TEMPORARY[tmp] !== undefined) {
			TEMPORARY[tmp] += 1;
		} else {
			TEMPORARY[tmp] = 0;
		}

		return tmp + '-' + TEMPORARY[tmp];

	}

};



const ENVIRONMENT = {

	action:   action,
	flags:    flags,
	mktemp:   mktemp,
	patterns: patterns,
	project:  project,
	read:     read,
	temp:     temp

};


export { ENVIRONMENT };

