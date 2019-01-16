
import { Stealth } from './source/Stealth.mjs';

const _ARGS    = Array.from(process.argv).slice(2).filter(v => v.trim() !== '');
const _PROFILE = '/home/' + (process.env.SUDO_USER || process.env.USER) + '/Stealth';
const _ROOT    = process.env.PWD;
const _FLAGS   = (function() {

	let flags = {};

	_ARGS.forEach(arg => {

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

				if (val === 'null') {
					val = null;
				}

				flags[key] = val;

			}

		}

	});

	return flags;

})();



const settings = {
	root: _ROOT
};

if (typeof _FLAGS.port === 'number') {
	settings.port = _FLAGS.port;
}

if (typeof _FLAGS.profile === 'string') {
	settings.profile = _FLAGS.profile;
}


(function(global) {

	const stealth = global.stealth = new Stealth(settings);

	stealth.connect();

})(typeof window !== 'undefined' ? window : global);

