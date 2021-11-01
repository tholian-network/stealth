
import { isArray, isBuffer, isObject, isString } from '../../extern/base.mjs';



const PRIVATE_V4 = [

	// RFC1122
	'0.0.0.0',
	'127.',

	// RFC1918
	'10.',
	'172.16.', '172.17.', '172.18.', '172.19.',
	'172.20.', '172.21.', '172.22.', '172.23.',
	'172.24.', '172.25.', '172.26.', '172.27.',
	'172.28.', '172.29.', '172.30.', '172.31.',
	'192.168.',

	// RFC2544
	'198.0.',   '198.2.',   '198.4.',   '198.6.',
	'198.8.',   '198.10.',  '198.12.',  '198.14.',
	'198.16.',  '198.18.',  '198.20.',  '198.22.',
	'198.24.',  '198.26.',  '198.28.',  '198.30.',
	'198.32.',  '198.34.',  '198.36.',  '198.38.',
	'198.40.',  '198.42.',  '198.44.',  '198.46.',
	'198.48.',  '198.50.',  '198.52.',  '198.54.',
	'198.56.',  '198.58.',  '198.60.',  '198.62.',
	'198.64.',  '198.66.',  '198.68.',  '198.70.',
	'198.72.',  '198.74.',  '198.76.',  '198.78.',
	'198.80.',  '198.82.',  '198.84.',  '198.86.',
	'198.88.',  '198.90.',  '198.92.',  '198.94.',
	'198.96.',  '198.98.',  '198.100.', '198.102.',
	'198.104.', '198.106.', '198.108.', '198.110.',
	'198.112.', '198.114.', '198.116.', '198.118.',
	'198.120.', '198.122.', '198.124.', '198.126.',
	'198.128.', '198.130.', '198.132.', '198.134.',
	'198.136.', '198.138.', '198.140.', '198.142.',
	'198.144.', '198.146.', '198.148.', '198.150.',
	'198.152.', '198.154.', '198.156.', '198.158.',
	'198.160.', '198.162.', '198.164.', '198.166.',
	'198.168.', '198.170.', '198.172.', '198.174.',
	'198.176.', '198.178.', '198.180.', '198.182.',
	'198.184.', '198.186.', '198.188.', '198.190.',
	'198.192.', '198.194.', '198.196.', '198.198.',
	'198.200.', '198.202.', '198.204.', '198.206.',
	'198.208.', '198.210.', '198.212.', '198.214.',
	'198.216.', '198.218.', '198.220.', '198.222.',
	'198.224.', '198.226.', '198.228.', '198.230.',
	'198.232.', '198.234.', '198.236.', '198.238.',
	'198.240.', '198.242.', '198.244.', '198.246.',
	'198.248.', '198.250.', '198.252.', '198.254.',

	// RFC3068
	'192.88.99.',

	// RFC3927
	'169.254.',

	// RFC6598
	'100.64.',
	'100.128.',
	'100.192.',

	// RFC6890
	'192.0.2.',
	'198.51.100.',
	'203.0.113.'

];

const PRIVATE_V6 = [

	// RFC3513
	'0000:0000:0000:0000:0000:0000:0000:0000',
	'0000:0000:0000:0000:0000:0000:0000:0001',
	'fe80:0000:0000:0000'

];

const render_ipv4 = function(ipv4) {
	return ipv4;
};

const render_ipv6 = function(ipv6) {

	let chunk = [];

	let zero = ipv6.split(':').findIndex((v) => v === '0000');
	if (zero !== -1) {

		ipv6.split(':').map((v, i) => {

			if (v === '0000' && i === zero) {
				return i === 0 ? ':' : '';
			} else if (v !== '0000') {
				return parseInt(v, 16).toString(16);
			} else {
				return null;
			}

		}).filter((v) => v !== null).forEach((v) => {
			chunk.push(v);
		});

	} else {

		ipv6.split(':').map((v) => {
			return parseInt(v, 16).toString(16);
		}).forEach((v) => {
			chunk.push(v);
		});

	}

	return chunk.join(':');

};

const parse_ipv4 = function(ipv4) {

	let tmp   = ipv4.split('.').map((v) => parseInt(v, 10));
	let valid = true;

	if (tmp.length === 4) {

		tmp.forEach((t) => {

			if (Number.isNaN(t) === false && t >= 0 && t <= 255) {
				// continue
			} else {
				valid = false;
			}

		});

		if (
			tmp[0] === 0
			&& tmp[1] === 0
			&& tmp[2] === 0
			&& tmp[3] === 0
		) {
			// Do Nothing
		} else if (
			tmp[3] === 0
			|| tmp[3] === 255
		) {
			valid = false;
		}

	} else {
		valid = false;
	}

	if (valid === true) {
		return ipv4;
	}


	return null;

};

const parse_ipv6 = function(ipv6) {

	let valid = true;
	let chunk = [];

	if (ipv6.includes('::') === true) {

		let tmp = ipv6.split('::').map((v) => v.split(':'));

		let len1 = tmp[0].length;
		if (len1 < 4) {
			tmp[0].push.apply(tmp[0], ['','','',''].slice(0, 4 - len1));
		}

		let len2 = tmp[1].length;
		if (len2 < 4) {
			tmp[1].unshift.apply(tmp[1], ['','','',''].slice(0, 4 - len2));
		}

		[].concat(tmp[0]).concat(tmp[1]).map((v) => {

			if (v.length < 4) {
				return '0000'.substr(0, 4 - v.length) + v;
			}

			return v;

		}).forEach((v) => {

			chunk.push(v);

			let num = parseInt(v, 16);
			if (num === 0) {

				if (v !== '0000') {
					valid = false;
				}

			} else if (Number.isNaN(num) === false && num >= 0 && num <= 65535) {
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

			} else if (Number.isNaN(num) === false && num >= 0 && num <= 65535) {
				// continue
			} else {
				valid = false;
			}

		});

	}

	if (chunk.length !== 8) {
		valid = false;
	}

	if (valid === true) {
		return chunk.join(':');
	}


	return null;

};



const IP = {

	compare: function(a, b) {

		let is_ip_a = IP.isIP(a) === true;
		let is_ip_b = IP.isIP(b) === true;

		if (is_ip_a === true && is_ip_b === true) {

			if (a.scope === 'private' && b.scope !== 'private') return -1;
			if (b.scope === 'private' && a.scope !== 'private') return 1;

			if (a.scope === 'private' && b.scope === 'private') {

				if (a.type === 'v4' && b.type !== 'v4') return -1;
				if (b.type === 'v4' && a.type !== 'v4') return 1;

				if (a.ip < b.ip) return -1;
				if (b.ip < a.ip) return 1;

			}

			if (a.scope === 'public' && b.scope === 'public') {

				if (a.type === 'v4' && b.type !== 'v4') return -1;
				if (b.type === 'v4' && a.type !== 'v4') return 1;

				if (a.ip < b.ip) return -1;
				if (b.ip < a.ip) return 1;

			}

			return 0;

		} else if (is_ip_a === true) {
			return -1;
		} else if (is_ip_b === true) {
			return 1;
		}


		return 0;

	},

	isIP: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			let scope = payload.scope || null;
			if (scope === 'private' || scope === 'public') {

				let type = payload.type || null;
				if (type === 'v4' || type === 'v6') {

					let ip = payload.ip || '';
					if (ip.includes(':') === true) {

						let check = parse_ipv6(ip);
						if (check === ip) {
							return true;
						}

					} else if (ip.includes('.') === true) {

						let check = parse_ipv4(ip);
						if (check === ip) {
							return true;
						}

					}

				}

			}

		}


		return false;

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
		}


		let ip    = null;
		let scope = null;
		let type  = null;

		if (raw !== null) {

			if (raw.startsWith('::ffff:') === true) {
				raw = raw.substr(7);
			}

			if (raw.includes('%') === true) {
				raw = raw.substr(0, raw.indexOf('%'));
			}

			if (raw.includes(':') === true) {

				let check = parse_ipv6(raw);
				if (check !== null) {

					ip   = check;
					type = 'v6';

					let subnet = PRIVATE_V6.find((prefix) => {
						return check.startsWith(prefix) === true;
					}) || null;

					if (subnet !== null) {
						scope = 'private';
					} else {
						scope = 'public';
					}

				}

			} else if (raw.includes('.') === true) {

				let check = parse_ipv4(raw);
				if (check !== null) {

					ip   = check;
					type = 'v4';

					let subnet = PRIVATE_V4.find((prefix) => {
						return check.startsWith(prefix) === true;
					}) || null;

					if (subnet !== null) {
						scope = 'private';
					} else {
						scope = 'public';
					}

				}

			}

		}


		return {
			ip:    ip,
			scope: scope,
			type:  type
		};

	},

	render: function(ip) {

		ip = IP.isIP(ip) ? ip : null;


		if (ip !== null) {

			let type = ip.type || null;
			if (type === 'v4') {
				return render_ipv4(ip.ip);
			} else if (type === 'v6') {
				return render_ipv6(ip.ip);
			}

		}


		return null;

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((ip) => {
				return IP.isIP(ip) === true;
			}).sort((a, b) => {
				return IP.compare(a, b);
			});

		}


		return [];

	}

};


export { IP };

