
import os      from 'os';
import path    from 'path';
import process from 'process';



export const action = (() => {

	let value = Array.from(process.argv).slice(2).filter((v) => v.startsWith('--') === false).shift() || '';

	if (/^([check]{5})$/g.test(value)) {
		return 'check';
	} else if (/^([watch]{5})$/g.test(value)) {
		return 'watch';
	} else if (/^([scan]{4})$/g.test(value)) {
		return 'scan';
	} else if (/^([time]{4})$/g.test(value)) {
		return 'time';
	}

	return 'help';

})();

export const flags = (() => {

	let flags = {
		debug:    false,
		internet: true,
		network:  null,
		timeout:  null
	};

	Array.from(process.argv).slice(2).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=').map((v) => v.trim());
		if (tmp.length === 2) {

			let key = tmp[0];
			let val = tmp[1];

			let num = parseInt(val, 10);
			if (Number.isNaN(num) && (num).toString() === val) {
				val = num;
			} else if (val === 'true') {
				val = true;
			} else if (val === 'false') {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else if (val.endsWith('s')) {

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

export const patterns = (() => {

	let patterns = [];

	Array.from(process.argv).slice(2).filter((v) => v.startsWith('--') === false).slice(1).forEach((pattern) => {
		patterns.push(pattern);
	});

	return patterns;

})();

export const root = (() => {

	let pwd = process.env.PWD || null;
	if (pwd !== null) {
		return pwd;
	}

	let cwd = process.cwd();
	if (cwd.includes('\\')) {
		cwd = cwd.split('\\').join('/');
	}

	if (cwd.endsWith('/')) {
		cwd = cwd.substr(0, cwd.length - 1);
	}

	return cwd;

})();

export const temp = (() => {

	let user     = process.env.SUDO_USER || process.env.USER;
	let folder   = '/tmp/covert-' + user;
	let platform = os.platform();

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {

		folder = '/tmp/covert-' + user;

	} else if (platform === 'darwin') {

		folder = process.env.TMPDIR || '/tmp/covert-' + user;

	} else if (platform === 'win32') {

		let tmp = path.resolve(process.env.USERPROFILE || 'C:\\temp').split('\\').join('/');
		if (tmp.includes(':')) {
			tmp = tmp.split(':').slice(1).join(':');
		}

		folder = tmp + '/covert-' + user;

	}

	return folder;

})();

const TEMPORARY = {};

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

export const mktemp = (prefix, seed) => {

	prefix = typeof prefix === 'string' ? prefix                   : randomize(4);
	seed   = typeof seed === 'number'   ? Math.round(seed / 2) * 2 : null;


	if (prefix.startsWith('/')) {
		prefix = prefix.substr(1);
	}

	if (prefix.endsWith('/')) {
		prefix = prefix.substr(0, prefix.length - 1);
	}



	if (seed !== null) {

		let path = temp + '/' + prefix + '-' + randomize(seed);

		while (TEMPORARY[path] !== undefined) {
			path = temp + '/' + prefix + '-' + randomize(seed);
		}

		TEMPORARY[path] = 0;

		return path;

	} else {

		let path = temp + '/' + prefix;

		if (TEMPORARY[path] !== undefined) {
			TEMPORARY[path] += 1;
		} else {
			TEMPORARY[path] = 0;
		}

		path += '-' + TEMPORARY[path];

		return path;

	}

};



const ENVIRONMENT = {

	action:   action,
	flags:    flags,
	mktemp:   mktemp,
	patterns: patterns,
	root:     root,
	temp:     temp

};


export { ENVIRONMENT };

