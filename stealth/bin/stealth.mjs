
import process from 'process';

import { Stealth } from '../source/Stealth.mjs';



const ROOT = (() => {

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

const FLAGS = (() => {

	let argv  = Array.from(process.argv).slice(2).map((v) => v.trim()).filter((v) => v !== '');
	let flags = {};

	Array.from(argv).filter((v) => v.startsWith('--') === true).forEach((flag) => {

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



const settings = {
	debug:   FLAGS.debug   || false,
	profile: FLAGS.profile || null,
	root:    ROOT
};

(function(global) {

	let stealth = global.stealth = new Stealth(settings);
	if (stealth !== null) {
		stealth.connect(FLAGS.host || null);
	}


	process.on('SIGTERM', () => {

		if (stealth !== null) {

			stealth.disconnect((result) => {
				process.exit(result === true ? 0 : 1);
			});

		} else {
			process.exit(0);
		}

	});

	process.on('SIGINT', () => {

		if (stealth !== null) {

			stealth.disconnect((result) => {
				process.exit(result === true ? 0 : 1);
			});

		} else {
			process.exit(0);
		}

	});

	process.on('SIGTSTP', () => {

		if (stealth !== null) {
			stealth.disconnect();
		}

	});

	process.on('SIGCONT', () => {

		if (stealth !== null) {
			stealth.connect(FLAGS.host || null);
		}

	});

})(global);

