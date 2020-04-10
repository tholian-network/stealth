
import os      from 'os';
import path    from 'path';
import process from 'process';



export const flags = (() => {

	let flags = {
		debug:   false,
		host:    null,
		profile: null
	};

	Array.from(process.argv).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=');
		if (tmp.length === 2) {

			let key = tmp[0];
			let val = tmp[1];

			let num = parseInt(val, 10);
			if (!isNaN(num) && (num).toString() === val) {
				val = num;
			}

			if (val === 'true')  val = true;
			if (val === 'false') val = false;
			if (val === 'null')  val = null;

			flags[key] = val;

		}

	});

	return flags;

})();

export const hostname = os.hostname();

export const hosts = (() => {

	let hosts    = null;
	let platform = os.platform();

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {
		hosts = '/etc/hosts';
	} else if (platform === 'darwin') {
		hosts = '/etc/hosts';
	} else if (platform === 'win32') {
		hosts = path.resolve('C:\\windows\\system32\\drivers\\etc\\hosts').split('\\').join('/');
	}

	return hosts;


})();

export const profile = (() => {

	let folder   = '/tmp/stealth';
	let user     = process.env.SUDO_USER || process.env.USER;
	let platform = os.platform();

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {

		folder = '/home/' + user + '/Stealth';

	} else if (platform === 'darwin') {

		folder = '/Users/' + user + '/Library/Application Support/Stealth';

	} else if (platform === 'win32') {

		let tmp = path.resolve(process.env.USERPROFILE || 'C:\\users\\' + user).split('\\').join('/');
		if (tmp.includes(':')) {
			tmp = tmp.split(':').slice(1).join(':');
		}

		folder = tmp + '/Stealth';

	}

	return folder;

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
	let folder   = '/tmp/stealth-' + user;
	let platform = os.platform();

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {

		folder = '/tmp/stealth-' + user;

	} else if (platform === 'darwin') {

		folder = process.env.TMPDIR || '/tmp/stealth-' + user;

	} else if (platform === 'win32') {

		let tmp = path.resolve(process.env.USERPROFILE || 'C:\\temp').split('\\').join('/');
		if (tmp.includes(':')) {
			tmp = tmp.split(':').slice(1).join(':');
		}

		folder = tmp + '/stealth-' + user;

	}

	return folder;

})();



const ENVIRONMENT = {

	flags:    flags,
	hostname: hostname,
	hosts:    hosts,
	profile:  profile,
	root:     root,
	temp:     temp

};


export { ENVIRONMENT };

