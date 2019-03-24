
const _DUMMY = new Array(4).fill('');

const _validate_ipv4 = function(ipv4) {

	let tmp   = ipv4.split('.').map((v) => parseInt(v, 10));
	let valid = true;

	if (tmp.length === 4) {

		tmp.forEach((t) => {

			if (!isNaN(t) && t >= 0 && t <= 255) {
				// continue
			} else {
				valid = false;
			}

		});

		let class_d = tmp[tmp.length - 1];
		if (class_d === 0 || class_d === 255) {
			valid = false;
		}

	} else {
		valid = false;
	}

	return valid === true ? ipv4 : null;

};

const _validate_ipv6 = function(ipv6) {

	let valid = true;
	let chunk = [];

	if (ipv6.includes('::')) {

		let tmp = ipv6.split('::').map((v) => v.split(':'));

		let len1 = tmp[0].length;
		if (len1 < 4) {
			tmp[0].push.apply(tmp[0], _DUMMY.slice(0, 4 - len1));
		}

		let len2 = tmp[1].length;
		if (len2 < 4) {
			tmp[1].unshift.apply(tmp[1], _DUMMY.slice(0, 4 - len2));
		}

		[].concat(tmp[0]).concat(tmp[1]).map((v) => {
			if (v.length < 4) return '0000'.substr(0, 4 - v.length) + v;
			return v;
		}).forEach((v) => {

			chunk.push(v);

			let num = parseInt(v, 16);
			if (num === 0) {

				if (v !== '0000') {
					valid = false;
				}

			} else if (!isNaN(num) && num >= 0 && num <= 65535) {
				// continue
			} else {
				valid = false;
			}

		});

	} else {

		ipv6.split(':').map((v) => {
			if (v.length < 4) return '0000'.substr(0, 4 - v.length) + v;
			return v;
		}).forEach((v) => {

			chunk.push(v);

			let num = parseInt(v, 16);
			if (num === 0) {

				if (v !== '0000') {
					valid = false;
				}

			} else if (!isNaN(num) && num >= 0 && num <= 65535) {
				// continue
			} else {
				valid = false;
			}

		});

	}


	if (valid === true) {
		return chunk.join(':');
	}


	return null;

};



const IP = {

	parse: function(str) {

		str = typeof str === 'string' ? str : '';


		let type = null;
		let ip   = null;

		if (str.includes(':')) {

			let check = _validate_ipv6(str);
			if (check !== null) {
				type = 'v6';
				ip   = check;
			}

		} else if (str.includes('.')) {

			let check = _validate_ipv4(str);
			if (check !== null) {
				type = 'v4';
				ip   = check;
			}

		}

		return {
			ip:   ip,
			type: type
		};

	}

};


export { IP };

