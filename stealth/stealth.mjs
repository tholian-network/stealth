
import process     from 'process';
import { Stealth } from './source/Stealth.mjs';

const _ARGS = Array.from(process.argv).slice(2).filter((v) => v.trim() !== '');
const _ROOT = (function() {

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

const _FLAGS = (function() {

	let flags = {};

	_ARGS.forEach((arg) => {

		let tmp1 = arg.trim();
		if (tmp1.startsWith('--')) {

			tmp1 = tmp1.substr(2);

			if (tmp1.includes('=')) {

				let key = tmp1.split('=')[0].trim();
				let val = tmp1.split('=').slice(1).join('=').trim();

				let num = parseInt(val, 10);
				if (!isNaN(num) && (num).toString() === val) {
					val = num;
				}

				if (val === 'true')  val = true;
				if (val === 'false') val = false;
				if (val === 'null')  val = null;

				flags[key] = val;

			}

		}

	});

	return flags;

})();



const settings = {
	debug:   _FLAGS.debug   || false,
	profile: _FLAGS.profile || null,
	root:    _ROOT
};

(function(global) {

	let stealth = global.stealth = new Stealth(settings);
	if (stealth !== null) {

		stealth.connect(
			_FLAGS.host || null,
			_FLAGS.port || null
		);

	}


	process.on('SIGINT', () => {

		let result = true;

		if (stealth !== null) {
			result = stealth.disconnect();
		}

		process.exit(result === true ? 0 : 1);

	});

})(global);

