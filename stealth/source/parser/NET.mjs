
import { isArray, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';



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



const toBinary = function(num, length) {

	let str = (num).toString(2);

	if (isNumber(length) === true) {

		let zeros = new Array(length).fill(0).join('');

		if (str.length < length) {
			str = zeros.substr(0, length - str.length) + str;
		}

	}

	return str;

};

const toBitmask = function(bitmask1, bitmask2) {

	let bitmask = new Array(bitmask1.length).fill(0);

	if (bitmask1.length === bitmask2.length) {

		for (let b = 0, bl = bitmask.length; b < bl; b++) {

			if (
				bitmask1[b] === '1'
				&& bitmask2[b] === '1'
			) {
				bitmask[b] = 1;
			}

		}


	}

	return bitmask.join('');

};

const toHex = function(num, length) {

	let str = (num).toString(16);

	if (isNumber(length) === true) {

		let zeros = new Array(length).fill(0).join('');

		if (str.length < length) {
			str = zeros.substr(0, length - str.length) + str;
		}

	}

	return str;

};

const toIPv4 = function(netmask) {

	return [
		netmask.substr( 0, 8),
		netmask.substr( 8, 8),
		netmask.substr(16, 8),
		netmask.substr(24, 8)
	].map((v) => parseInt(v, 2)).join('.');

};

const toIPv6 = function(netmask) {

	return [
		netmask.substr(  0, 16),
		netmask.substr( 16, 16),
		netmask.substr( 32, 16),
		netmask.substr( 48, 16),
		netmask.substr( 64, 16),
		netmask.substr( 80, 16),
		netmask.substr( 96, 16),
		netmask.substr(112, 16)
	].map((v) => parseInt(v, 2)).map((v) => toHex(v, 4)).join(':');

};

const render_netv4 = function(netmask, bitmask) {

	let length = bitmask.length;

	for (let i = 0; i < bitmask.length; i++) {

		if (bitmask[i] === '0') {
			length = i;
			break;
		}

	}

	return toIPv4(netmask) + '/' + length;

};

const render_netv6 = function(netmask, bitmask) {

	let length = bitmask.length;

	for (let i = 0; i < bitmask.length; i++) {

		if (bitmask[i] === '0') {
			length = i;
			break;
		}

	}

	return toIPv6(netmask) + '/' + length;

};

const parse_netv4 = function(ipv4, prefix) {

	prefix = isNumber(prefix) ? prefix : null;


	let bitmask = new Array(32).fill(0).join('');
	let netmask = new Array(32).fill(0).join('');
	let chunk   = ipv4.split('.').map((v) => parseInt(v, 10));
	let valid   = true;

	if (chunk.length === 4) {

		chunk.forEach((num) => {

			if (Number.isNaN(num) === false && num >= 0 && num <= 255) {
				// continue
			} else {
				valid = false;
			}

		});


		if (prefix === null) {

			if (
				chunk[0] === 0
				&& chunk[1] === 0
				&& chunk[2] === 0
				&& chunk[3] === 0
			) {

				prefix = 0;

			} else if (
				chunk[0] !== 0
				&& chunk[1] === 0
				&& chunk[2] === 0
				&& chunk[3] === 0
			) {

				prefix = 8;

			} else if (
				chunk[0] !== 0
				&& chunk[1] !== 0
				&& chunk[2] === 0
				&& chunk[3] === 0
			) {

				prefix = 16;

			} else if (
				chunk[0] !== 0
				&& chunk[1] !== 0
				&& chunk[2] !== 0
				&& chunk[3] === 0
			) {

				prefix = 24;

			} else if (
				chunk[0] !== 0
				|| chunk[1] !== 0
				|| chunk[2] !== 0
				|| chunk[3] !== 0
			) {

				prefix = 32;

			}

		}

	} else {
		valid = false;
	}


	if (valid === true) {

		if (prefix > 0 && prefix <= 32) {
			bitmask = new Array(prefix).fill(1).join('') + new Array(32 - prefix).fill(0).join('');
			netmask = toBitmask(bitmask, chunk.map((v) => toBinary(v, 8)).join(''));
		}

		return {
			bitmask: bitmask,
			netmask: netmask,
			network: toIPv4(netmask)
		};

	}


	return null;

};

const parse_netv6 = function(ipv6, prefix) {

	prefix = isNumber(prefix) ? prefix : null;


	let bitmask = new Array(128).fill(0).join('');
	let netmask = new Array(128).fill(0).join('');
	let chunk   = [];
	let valid   = true;

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
			chunk.push(parseInt(v, 16));
		});

	} else {

		ipv6.split(':').map((v) => {
			if (v.length < 4) return '0000'.substr(0, 4 - v.length) + v;
			return v;
		}).forEach((v) => {
			chunk.push(parseInt(v, 16));
		});

	}

	if (chunk.length === 8) {

		chunk.forEach((num) => {

			if (Number.isNaN(num) === false && num >= 0 && num <= 65535) {
				// continue
			} else {
				valid = false;
			}

		});

		if (prefix === null) {

			if (
				chunk[0] === 0
				&& chunk[1] === 0
				&& chunk[2] === 0
				&& chunk[3] === 0
				&& chunk[4] === 0
				&& chunk[5] === 0
				&& chunk[6] === 0
				&& chunk[7] === 0
			) {

				prefix = 0;

			} else if (
				chunk[0] !== 0
				&& chunk[1] === 0
				&& chunk[2] === 0
				&& chunk[3] === 0
				&& chunk[4] === 0
				&& chunk[5] === 0
				&& chunk[6] === 0
				&& chunk[7] === 0
			) {

				prefix = 16;

			} else if (
				chunk[0] !== 0
				&& chunk[1] !== 0
				&& chunk[2] === 0
				&& chunk[3] === 0
				&& chunk[4] === 0
				&& chunk[5] === 0
				&& chunk[6] === 0
				&& chunk[7] === 0
			) {

				prefix = 32;

			} else if (
				chunk[0] !== 0
				&& chunk[1] !== 0
				&& chunk[2] !== 0
				&& chunk[3] === 0
				&& chunk[4] === 0
				&& chunk[5] === 0
				&& chunk[6] === 0
				&& chunk[7] === 0
			) {

				prefix = 48;

			} else if (
				chunk[0] !== 0
				&& chunk[1] !== 0
				&& chunk[2] !== 0
				&& chunk[3] !== 0
				&& chunk[4] === 0
				&& chunk[5] === 0
				&& chunk[6] === 0
				&& chunk[7] === 0
			) {

				prefix = 64;

			} else if (
				chunk[0] !== 0
				&& chunk[1] !== 0
				&& chunk[2] !== 0
				&& chunk[3] !== 0
				&& chunk[4] !== 0
				&& chunk[5] === 0
				&& chunk[6] === 0
				&& chunk[7] === 0
			) {

				prefix = 80;

			} else if (
				chunk[0] !== 0
				&& chunk[1] !== 0
				&& chunk[2] !== 0
				&& chunk[3] !== 0
				&& chunk[4] !== 0
				&& chunk[5] !== 0
				&& chunk[6] === 0
				&& chunk[7] === 0
			) {

				prefix = 96;

			} else if (
				chunk[0] !== 0
				&& chunk[1] !== 0
				&& chunk[2] !== 0
				&& chunk[3] !== 0
				&& chunk[4] !== 0
				&& chunk[5] !== 0
				&& chunk[6] !== 0
				&& chunk[7] === 0
			) {

				prefix = 112;

			} else if (
				chunk[0] !== 0
				|| chunk[1] !== 0
				|| chunk[2] !== 0
				|| chunk[3] !== 0
				|| chunk[4] !== 0
				|| chunk[5] !== 0
				|| chunk[6] !== 0
				|| chunk[7] !== 0
			) {

				prefix = 128;

			}

		}

	} else {
		valid = false;
	}


	if (valid === true) {

		if (prefix > 0 && prefix <= 128) {
			bitmask = new Array(prefix).fill(1).join('') + new Array(128 - prefix).fill(0).join('');
			netmask = toBitmask(bitmask, chunk.map((v) => toBinary(v, 16)).join(''));
		}

		return {
			bitmask: bitmask,
			netmask: netmask,
			network: toIPv6(netmask)
		};

	}


	return null;

};



const NET = {

	compare: function(a, b) {

		let is_net_a = NET.isNET(a) === true;
		let is_net_b = NET.isNET(b) === true;

		if (is_net_a === true && is_net_b === true) {

			if (a.scope === 'private' && b.scope !== 'private') return -1;
			if (b.scope === 'private' && a.scope !== 'private') return 1;

			if (a.scope === 'private' && b.scope === 'private') {

				if (a.type === 'v4' && b.type !== 'v4') return -1;
				if (b.type === 'v4' && a.type !== 'v4') return 1;

				if (a.netmask < b.netmask) return -1;
				if (b.netmask < a.netmask) return 1;

				if (a.bitmask < b.bitmask) return -1;
				if (b.bitmask < a.bitmask) return 1;

			}

			if (a.scope === 'public' && b.scope === 'public') {

				if (a.type === 'v4' && b.type !== 'v4') return -1;
				if (b.type === 'v4' && a.type !== 'v4') return 1;

				if (a.netmask < b.netmask) return -1;
				if (b.netmask < a.netmask) return 1;

				if (a.bitmask < b.bitmask) return -1;
				if (b.bitmask < a.bitmask) return 1;

			}

			return 0;

		} else if (is_net_a === true) {
			return -1;
		} else if (is_net_b === true) {
			return 1;
		}


		return 0;

	},

	isNET: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			let bitmask = payload.bitmask || null;
			let netmask = payload.netmask || null;
			let network = payload.network || null;
			let scope   = payload.scope   || null;
			let type    = payload.type    || null;

			if (
				isString(scope) === true
				&& (scope === 'private' || scope === 'public')
				&& isString(bitmask) === true
				&& isString(netmask) === true
				&& isString(network) === true
				&& isString(type) === true
			) {

				if (
					type === 'v4'
					&& network !== '0.0.0.0'
					&& bitmask.length === 32
					&& netmask.length === 32
				) {

					let check1 = toBitmask(bitmask, netmask);
					let check2 = toIPv4(netmask);

					if (check1 === netmask && check2 === network) {
						return true;
					}

				} else if (
					type === 'v6'
					&& network !== '0000:0000:0000:0000:0000:0000:0000:0000'
					&& bitmask.length === 128
					&& netmask.length === 128
				) {

					let check1 = toBitmask(bitmask, netmask);
					let check2 = toIPv6(netmask);

					if (check1 === netmask && check2 === network) {
						return true;
					}

				}

			}

		}


		return false;

	},

	isIP: function(net, payload) {

		// TODO: Needs to be implemented

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
		}


		let bitmask = null;
		let netmask = null;
		let network = null;
		let scope   = null;
		let type    = null;

		if (raw !== null) {

			if (raw.startsWith('::ffff:') === true) {
				raw = raw.substr(7);
			}

			if (raw.includes('%') === true) {
				raw = raw.substr(0, raw.indexOf('%'));
			}

			if (raw.includes(':') === true) {

				if (raw.includes('/') === true) {

					let tmp0 = raw.split('/').shift();
					let tmp1 = raw.split('/').pop();

					let check = parse_netv6(tmp0, parseInt(tmp1, 10));
					if (check !== null) {

						bitmask = check.bitmask;
						netmask = check.netmask;
						network = check.network;
						type    = 'v6';

					}

				} else {

					let check = parse_netv6(raw);
					if (check !== null) {

						bitmask = check.bitmask;
						netmask = check.netmask;
						network = check.network;
						type    = 'v6';

					}

				}

			} else if (raw.includes('.') === true) {

				if (raw.includes('/') === true) {

					let tmp0 = raw.split('/').shift().trim();
					let tmp1 = raw.split('/').pop().trim();

					let check = parse_netv4(tmp0, parseInt(tmp1, 10));
					if (check !== null) {

						bitmask = check.bitmask;
						netmask = check.netmask;
						network = check.network;
						type    = 'v4';

					}

				} else {

					let check = parse_netv4(raw, null);
					if (check !== null) {

						bitmask = check.bitmask;
						netmask = check.netmask;
						network = check.network;
						type    = 'v4';

					}

				}

			}

		}


		if (network !== null) {

			if (type === 'v4') {

				let subnet = PRIVATE_V4.find((prefix) => {
					return network.startsWith(prefix) === true;
				}) || null;

				if (subnet !== null) {
					scope = 'private';
				} else {
					scope = 'public';
				}

			} else if (type === 'v6') {

				let subnet = PRIVATE_V6.find((prefix) => {
					return network.startsWith(prefix) === true;
				}) || null;

				if (subnet !== null) {
					scope = 'private';
				} else {
					scope = 'public';
				}

			}

		}


		return {
			bitmask: bitmask,
			netmask: netmask,
			network: network,
			scope:   scope,
			type:    type
		};

	},

	render: function(net) {

		net = NET.isNET(net) ? net : null;


		if (net !== null) {

			let type = net.type || null;
			if (type === 'v4') {
				return render_netv4(net.netmask, net.bitmask);
			} else if (type === 'v6') {
				return render_netv6(net.netmask, net.bitmask);
			}

		}


		return null;

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((subnet) => {
				return NET.isNET(subnet) === true;
			}).sort((a, b) => {
				return NET.compare(a, b);
			});

		}


		return [];

	}

};


export { NET };

