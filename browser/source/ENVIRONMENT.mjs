
import { URL } from '../source/parser/URL.mjs';



const flags = ((global) => {

	let flags = {
		cause: null,
		code:  null,
		debug: false,
		url:   URL.parse()
	};

	let tmp1 = (global.location        || {}).search || '';
	let tmp2 = (global.parent.location || {}).search || '';
	if (tmp1.includes('debug') === true) {
		flags.debug = true;
	} else if (tmp2.includes('debug') === true) {
		flags.debug = true;
	}

	if (tmp1.startsWith('?') === true) {

		tmp1.substr(1).split('&').forEach((flag) => {

			let tmp = flag.split('=');
			if (tmp.length >= 2) {

				let key = tmp[0];
				let val = tmp.slice(1).join('=');

				if (key === 'url') {

					flags[key] = URL.parse(decodeURIComponent(val));

				} else {

					let num = parseInt(val, 10);
					if (Number.isNaN(num) === false && (num).toString() === val) {
						val = num;
					}

					if (val === 'true')  val = true;
					if (val === 'false') val = false;
					if (val === 'null')  val = null;

					flags[key] = val;

				}

			}

		});

	}

	return flags;

})(typeof window !== 'undefined' ? window : this);

const hostname = ((global) => {

	let host = 'localhost';

	let tmp1 = (global.location || {}).host || '';
	if (tmp1.includes(':') === true) {

		let tmp2 = tmp1.split(':').slice(0, -1).join(':');
		if (tmp2 !== 'localhost') {
			host = tmp2;
		}

	} else if (tmp1 !== '') {
		host = tmp1;
	}

	return host;

})(typeof window !== 'undefined' ? window : this);

const secure = ((global) => {

	let secure = true;

	let tmp1 = (global.location || {}).protocol || '';
	if (tmp1.includes(':') === true) {

		let tmp2 = tmp1.split(':').shift();
		if (tmp2 !== 'https') {
			secure = false;
		}

	}

	return secure;

})(typeof window !== 'undefined' ? window : this);


const ENVIRONMENT = {

	flags:    flags,
	hostname: hostname,
	secure:   secure

};


export { ENVIRONMENT };

