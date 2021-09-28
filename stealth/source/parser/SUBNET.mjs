
import { console, isArray, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                    } from '../../source/parser/IP.mjs';



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

const parse_ipv6 = function(ipv6, prefix) {

	prefix = isNumber(prefix) ? prefix : 0;


	let valid   = true;
	let bitmask = new Array(128).fill(0).join('');
	let chunk   = [];

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

	if (prefix > 0 && prefix < 128) {
		bitmask = new Array(prefix).fill(1).join('') + new Array(128 - prefix).fill(0).join('');
	}

	if (valid === true) {

		return {
			bitmask: bitmask,
			subnet:  chunk.join(':')
		};

	}


	return null;

};



const SUBNET = {

	compare: function(a, b) {

		// TODO

	},

	isSubnet: function(payload, ip) {

		// if
		// - payload is object {subnet,prefix,scope,type}
		// - and ip is object {ip,scope,type}
		// then
		//
		// - check if toBinary(ip).startsWith(netmask)

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
		}


		let bitmask = null;
		let scope   = null;
		let subnet  = null;
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

					let check = parse_ipv6(tmp0, parseInt(tmp1, 10));

					if (check !== null) {

						bitmask = check.bitmask;
						subnet  = check.subnet;
						type    = 'v6';

					}

					// TODO: prefix = subnet.substrInBits(length)
					// TODO: Parse out Prefix Length

				} else {

					// TODO: Assume prefix length to be until subnet ends with 0 bits

					// TODO: Parse as Subnet Mask

				}

			} else if (raw.includes('.') === true) {

				if (raw.includes('/') === true) {

					// TODO: Parse out Prefix Length, then Subnet Mask
					// 192.168.123.192/25

				} else {

					// TODO: Parse as Subnet Mask and generate prefix with identical values
					// e.g. 192.32.0.1 will lead to
					// 110000 00010000 00000000 00000001 as bitmask

				}

			}

		}


		// TODO: prefix is bitmask for startsWith(prefix) usage
		// TODO: subnet is actual subnet that was parsed

		return {
			bitmask: bitmask,
			subnet:  subnet,
			scope:   scope,
			type:    type
		};

	},

	render: function() {
	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((subnet) => {
				return SUBNET.isSubnet(subnet) === true;
			}).sort((a, b) => {
				return SUBNET.compare(a, b);
			});

		}


		return [];

	}

};


export { SUBNET };

