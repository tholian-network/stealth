
import { Buffer } from 'buffer';

import { isArray, isBuffer, isFunction, isObject } from '../POLYFILLS.mjs';
import { IP                                      } from '../parser/IP.mjs';
import { HTTPS                                   } from './HTTPS.mjs';



let DNS_RONIN = 0;



const parse = function(raw) {

	let hosts = [];

	if (isBuffer(raw)) {

		let data = null;

		try {
			data = JSON.parse(raw.toString('utf8'));
		} catch (err) {
			data = null;
		}


		if (isObject(data) && isArray(data['Answer'])) {

			let answers = Array.from(data['Answer']).filter((answer) => {
				return answer.type === DNS.TYPE.A || answer.type === DNS.TYPE.AAAA;
			});

			if (answers.length > 0) {

				answers.forEach((answer) => {

					let ip = IP.parse(answer.data);
					if (ip.type !== null) {
						hosts.push(ip);
					}

				});

			}

		}

	}

	return hosts;

};

const query = function(ref, name, type, callback) {

	ref.host      = null;
	ref.subdomain = null;
	ref.headers   = null;
	ref.payload   = null;


	let buffer = {
		length:  null,
		partial: false,
		payload: Buffer.from('', 'utf8'),
		start:   0
	};

	let connection = HTTPS.connect(ref, buffer);
	if (connection !== null) {

		connection.on('@connect', (socket) => {

			HTTPS.send(socket, {
				headers: {
					'@method': 'GET',
					'@path':   ref.path + '?name=' + name + '&type=' + type,
					'accept':  'application/dns-json',
					'host':    ref.domain
				}
			});

		});

		connection.on('@disconnect', () => {

			let hosts = parse(buffer.payload);
			if (hosts.length > 0) {
				callback(hosts);
			} else {
				callback(null);
			}

		});

	}

};



const DNS = {

	SERVER:  null,

	SERVERS: [{
		domain:   'cloudflare-dns.com',
		path:     '/dns-query',
		port:     443,
		protocol: 'https',
		hosts:    [{
			ip:    '1.1.1.1',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '2606:4700:4700:0000:0000:0000:0000:1111',
			scope: 'public',
			type:  'v6'
		}, {
			ip:    '1.0.0.1',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '2606:4700:4700:0000:0000:0000:0000:1001',
			scope: 'public',
			type:  'v6'
		}]
	}, {
		domain:   'dns.google',
		path:     '/resolve',
		port:     443,
		protocol: 'https',
		hosts:    [{
			ip:    '8.8.4.4',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '8.8.8.8',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '2001:4860:4860:0000:0000:0000:0000:8844',
			scope: 'public',
			type:  'v6'
		}, {
			ip:    '2001:4860:4860:0000:0000:0000:0000:8888',
			scope: 'public',
			type:  'v6'
		}]
	}, {
		domain:   'doh.dns.sb',
		path:     '/dns-query',
		port:     443,
		protocol: 'https',
		hosts:    [{
			ip:    '104.18.56.150',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '2606:4700:0030:0000:0000:0000:6812:3896',
			scope: 'public',
			type:  'v6'
		}, {
			ip:    '104.18.57.150',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '2606:4700:0030:0000:0000:0000:6812:3996',
			scope: 'public',
			type:  'v6'
		}]
	}, {
		domain:   'dns.quad9.net',
		path:     '/dns-query',
		port:     443,
		protocol: 'https',
		hosts:    [{
			ip:    '9.9.9.9',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '2620:00fe:0000:0000:0000:0000:0000:00fe',
			scope: 'public',
			type:  'v6'
		}]
	}, {
		domain:   'dns.rubyfish.cn',
		path:     '/dns-query',
		port:     443,
		protocol: 'https',
		hosts:    [{
			ip:    '118.89.110.78',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '47.96.179.163',
			scope: 'public',
			type:  'v4'
		}]
	}, {
		domain:   'doh.securedns.eu',
		path:     '/dns-query',
		port:     443,
		protocol: 'https',
		hosts:    [{
			ip:    '146.185.167.43',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '2a03:b0c0:0000:1010:0000:0000:0e9a:3001',
			scope: 'public',
			type:  'v6'
		}]
	}, {
		domain:   'doh-jp.blahdns.com',
		path:     '/dns-query',
		port:     443,
		protocol: 'https',
		hosts:    [{
			ip:    '108.61.201.119',
			scope: 'public',
			type:  'v4'
		}, {
			ip:    '2001:19f0:7001:1ded:5400:01ff:fe90:945b',
			scope: 'public',
			type:  'v6'
		}]
	}].filter((dns) => {

		// XXX: These DNS are broken at the moment :-/
		if (dns.domain.includes('blahdns.com')) return false;

		return true;

	}),

	TYPE: {
		A:     1,
		AAAA: 28
	},

	resolve: function(ref, callback) {

		ref      = isObject(ref)        ? ref      : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && callback !== null) {

			let domain = ref.domain || null;
			let server = null;

			if (DNS.SERVER === null) {

				server = DNS.SERVERS[DNS_RONIN];

				DNS_RONIN += 1;
				DNS_RONIN %= DNS.SERVERS.length;

			} else if (DNS.SERVERS.includes(DNS.SERVER) === true) {

				server = DNS.SERVER;

			} else {

				DNS.SERVER = null;

				server = DNS.SERVERS[DNS_RONIN];

				DNS_RONIN += 1;
				DNS_RONIN %= DNS.SERVERS.length;

			}


			if (domain !== null && server !== null) {

				let subdomain = ref.subdomain || null;
				if (subdomain !== null) {
					domain = subdomain + '.' + domain;
				}


				query(server, domain, 'A', (hosts_v4) => {

					query(server, domain, 'AAAA', (hosts_v6) => {

						let hosts = [];

						if (hosts_v4 !== null) {
							hosts_v4.forEach((h) => hosts.push(h));
						}

						if (hosts_v6 !== null) {
							hosts_v6.forEach((h) => hosts.push(h));
						}


						if (hosts.length > 0) {

							callback({
								headers: {},
								payload: {
									domain: domain,
									hosts:  hosts
								}
							});

						} else {

							callback({
								headers: {},
								payload: null
							});

						}

					});

				});

			} else {

				callback({
					headers: {},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {},
				payload: null
			});

		}

	}

};


export { DNS };

