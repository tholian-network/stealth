
export const hostname = ((global) => {

	let host = 'localhost';

	let tmp1 = (global.location || {}).host || '';
	if (tmp1.includes(':')) {

		let tmp2 = tmp1.split(':').shift();
		if (tmp2 !== 'localhost') {
			host = tmp2;
		}

	} else if (tmp1 !== '') {
		host = tmp1;
	}

	return host;

})(typeof window !== 'undefined' ? window : this);

export const flags = ((global) => {

	let flags = {
		debug: false
	};

	let tmp1 = (global.location || {}).search || '';
	if (tmp1.includes('debug')) {
		flags.debug = true;
	}

	return flags;

})(typeof window !== 'undefined' ? window : this);


const ENVIRONMENT = {

	hostname: hostname

};


export { ENVIRONMENT };

