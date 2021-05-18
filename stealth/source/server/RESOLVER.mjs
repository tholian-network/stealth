
import { isFunction, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                    } from '../../source/ENVIRONMENT.mjs';
import { DNS                            } from '../../source/connection/DNS.mjs';
import { DNSS                           } from '../../source/connection/DNSS.mjs';
// import { DNSviaHTTPS                    } from '../../source/connection/DNSviaHTTPS.mjs';
// import { MDNS                           } from '../../source/connection/MDNS.mjs';
import { IP                             } from '../../source/parser/IP.mjs';
import { URL                            } from '../../source/parser/URL.mjs';


// TODO: Remove once Implementations are ready
const DNSviaHTTPS = { connect: () => null, send: () => false };
const MDNS        = { connect: () => null, send: () => false };


const BOOTSTRAP = {

	'admin.tholian.network':   [],
	'beacon.tholian.network':  [],
	'recon.tholian.network':   [],
	'sonar.tholian.network':   [],
	'stealth.tholian.network': [],

	'radar.tholian.network': [
		IP.parse('93.95.228.18')
	],

	'tholian.network': [
		IP.parse('185.199.108.153'),
		IP.parse('185.199.109.153'),
		IP.parse('185.199.110.153'),
		IP.parse('185.199.111.153')
	]

};

const RONIN = [];

const SERVERS = [
	Object.assign(URL.parse('https://cloudflare-dns.com:443/dns-query'), {
		hosts: [
			IP.parse('1.1.1.1'),
			IP.parse('2606:4700:4700::1111'),
			IP.parse('1.0.0.1'),
			IP.parse('2606:4700:4700::1001')
		]
	}),
	Object.assign(URL.parse('dnss://dns.google:853'), {
		hosts: [
			IP.parse('8.8.4.4'),
			IP.parse('2001:4860:4860::8844'),
			IP.parse('8.8.8.8'),
			IP.parse('2001:4860:4860::8888')
		]
	}),
	Object.assign(URL.parse('https://dns.google:443/resolve'), {
		hosts: [
			IP.parse('8.8.4.4'),
			IP.parse('2001:4860:4860::8844'),
			IP.parse('8.8.8.8'),
			IP.parse('2001:4860:4860::8888')
		]
	}),
	Object.assign(URL.parse('dnss://dns.digitale-gesellschaft.ch:853'), {
		hosts: [
			IP.parse('185.95.218.42'),
			IP.parse('2a05:fc84::42'),
			IP.parse('185.95.218.43'),
			IP.parse('2a05:fc84::43')
		]
	}),
	Object.assign(URL.parse('https://dns.digitale-gesellschaft.ch:443/dns-query'), {
		hosts: [
			IP.parse('185.95.218.42'),
			IP.parse('2a05:fc84::42'),
			IP.parse('185.95.218.43'),
			IP.parse('2a05:fc84::43')
		]
	}),
	Object.assign(URL.parse('dnss://dnsforge.de:853'), {
		hosts: [
			IP.parse('176.9.93.198'),
			IP.parse('2a01:04f8:0151:34aa::0198'),
			IP.parse('176.9.1.117'),
			IP.parse('2a01:04f8:0141:316d::0117')
		]
	}),
	Object.assign(URL.parse('dnss://dns.alidns.com:443'), {
		hosts: [
			IP.parse('223.5.5.5'),
			IP.parse('2400:3200::1'),
			IP.parse('223.6.6.6'),
			IP.parse('2400:3200:baba::1')
		]
	}),
	Object.assign(URL.parse('https://dns.alidns.com:443/resolve'), {
		hosts: [
			IP.parse('223.5.5.5'),
			IP.parse('2400:3200::1'),
			IP.parse('223.6.6.6'),
			IP.parse('2400:3200:baba::1')
		]
	}),
	Object.assign(URL.parse('https://doh.au.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('103.73.64.132'),
			IP.parse('2406:ef80:0100:0011::0011')
		]
	}),
	Object.assign(URL.parse('https://doh.es.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('45.132.74.167'),
			IP.parse('2a0e:0dc0:0009:0017::0017')
		]
	}),
	Object.assign(URL.parse('https://doh.it.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('45.91.95.12'),
			IP.parse('2a0e:0dc0:0008:0012::0012')
		]
	}),
	Object.assign(URL.parse('https://doh.la.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('45.67.219.208'),
			IP.parse('2a04:bdc7:0100:0070::0070')
		]
	}),
	Object.assign(URL.parse('https://doh.nl.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('5.2.75.75'),
			IP.parse('2a04:52c0:0101:0075::0075')
		]
	}),
	Object.assign(URL.parse('https://doh.no.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('185.175.56.133'),
			IP.parse('2a0d:5600:0030:0028:0028')
		]
	}),
	Object.assign(URL.parse('https://doh.ny.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('185.213.26.187'),
			IP.parse('2a0d:5600:0033:0003::0003')
		]
	}),
	Object.assign(URL.parse('https://doh.pl.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('45.132.75.16'),
			IP.parse('2a0e:0dc0:0007:000d::000d')
		]
	}),
	Object.assign(URL.parse('dnss://dot.libredns.gr:854'), {
		hosts: [
			IP.parse('116.202.176.26')
		]
	}),
	Object.assign(URL.parse('dnss://adfree.usableprivacy.net:853'), {
		hosts: [
			IP.parse('149.154.153.153')
		]
	}),
	Object.assign(URL.parse('dnss://dns.sb:853'), {
		hosts: [
			IP.parse('185.222.222.222'),
			IP.parse('2a09::0001'),
			IP.parse('185.184.222.222'),
			IP.parse('2a09::0000')
		]
	}),
	Object.assign(URL.parse('https://doh.dns.sb:443/dns-query'), {
		hosts: [
			IP.parse('104.18.56.150'),
			IP.parse('2606:4700:0030::6812:3896'),
			IP.parse('104.18.57.150'),
			IP.parse('2606:4700:0030::6812:3996')
		]
	}),
	Object.assign(URL.parse('https://dns.quad9.net:5053/dns-query'), {
		hosts: [
			IP.parse('9.9.9.9'),
			IP.parse('2620:00fe::00fe')
		]
	}),
	Object.assign(URL.parse('https://dns.rubyfish.cn:443/dns-query'), {
		hosts: [
			IP.parse('118.89.110.78'),
			IP.parse('47.96.179.163')
		]
	}),
	Object.assign(URL.parse('dnss://dot.ffmuc.net:853'), {
		hosts: [
			IP.parse('5.1.66.255'),
			IP.parse('2001:0678:0e68:f000::'),
			IP.parse('185.150.99.255'),
			IP.parse('2001:0678:0ed0:f000::'),
		]
	})
];


const isQuery = function(obj) {

	if (
		isObject(obj) === true
		&& (isString(obj.subdomain) === true || obj.subdomain === null)
		&& isString(obj.subdomain) === true
	) {
		return true;
	}

	return false;

};

const resolve_domain = function(server, domain, callback) {

	server = URL.isURL(server) ? server : null;


	if (ENVIRONMENT.ips.length > 0) {

		let supports_v4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
		let supports_v6 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6').length > 0;

		if (server === null) {

			if (RONIN.length === 0) {

				SERVERS.forEach((server) => RONIN.push(server));
				server = RONIN.shift();

				if (supports_v4 === false) {

					RONIN.forEach((server) => {
						server['hosts'] = server['hosts'].filter((ip) => ip.type !== 'v4');
					});

				}

				if (supports_v6 === false) {

					RONIN.forEach((server) => {
						server['hosts'] = server['hosts'].filter((ip) => ip.type !== 'v6');
					});

				}

			} else {
				server = RONIN.shift();
			}

		}


		let url        = server;
		let connection = null;

		if (url.protocol === 'https') {
			connection = DNSviaHTTPS.connect(url);
		} else if (url.protocol === 'dnss') {
			connection = DNSS.connect(url);
		} else if (url.protocol === 'dns') {
			connection = DNS.connect(url);
		} else if (url.protocol === 'mdns') {
			connection = MDNS.connect(url);
		}

		if (connection !== null) {

			connection.once('response', (response) => {

				let hosts = [];

				response.payload.answers.filter((a) => a.type === 'A').forEach((answer) => {

					if (IP.isIP(answer.value) === true) {
						hosts.push(answer.value);
					}

				});

				response.payload.answers.filter((a) => a.type === 'AAAA').forEach((answer) => {

					if (IP.isIP(answer.value) === true) {
						hosts.push(answer.value);
					}

				});

				callback({
					domain: domain,
					hosts:  hosts
				});

			});

			connection.once('error', () => {
				callback(null);
			});

			connection.once('timeout', () => {
				callback(null);
			});


			let request = {
				headers: {
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: domain,
						type:   'A'
					}, {
						domain: domain,
						type:   'AAAA'
					}]
				}
			};

			connection.once('@connect', () => {

				if (connection.protocol === 'https') {
					DNSviaHTTPS.send(request);
				} else if (connection.protocol === 'dnss') {
					DNSS.send(request);
				} else if (connection.protocol === 'dns') {
					DNS.send(request);
				} else if (connection.protocol === 'mdns') {
					MDNS.send(request);
				}

			});

		}

	} else {

		callback(null);

	}

};

const toDomain = function(payload) {

	let domain = null;

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		}

	}

	return domain;

};



const RESOLVER = {

	resolve: function(query, callback) {

		query    = isQuery(query)       ? query    : null;
		callback = isFunction(callback) ? callback : null;


		if (ENVIRONMENT.ips.length > 0) {

			let domain      = toDomain(query);
			let supports_v4 = ENVIRONMENT.ips.find((ip) => ip.type === 'v4');
			let supports_v6 = ENVIRONMENT.ips.find((ip) => ip.type === 'v6');

			if (domain !== null) {

				if (domain.endsWith('.tholian.local') === true) {

					if (supports_v4 === true && supports_v6 === true) {

						resolve_domain(URL.parse('mdns://224.0.0.251'), domain, (v4) => {

							resolve_domain(URL.parse('mdns://[ff02::fb]'), domain, (v6) => {

								let host = {
									domain: domain,
									hosts:  []
								};

								if (v4 !== null) {
									v4['hosts'].forEach((ip) => host['hosts'].push(ip));
								}

								if (v6 !== null) {
									v6['hosts'].forEach((ip) => host['hosts'].push(ip));
								}

								callback(host);

							});

						});

					} else if (supports_v4 === true) {

						resolve_domain(URL.parse('mdns://224.0.0.251'), domain, (host) => {
							callback(host);
						});

					} else if (supports_v6 === true) {

						resolve_domain(URL.parse('mdns://[ff02::fb]'), domain, (host) => {
							callback(host);
						});

					}

				} else if (domain === 'tholian.local') {

					// XXX: Reserved
					if (callback !== null) {
						callback([]);
					}

				} else if (domain.endsWith('.tholian.network') === true) {

					let bootstrap = BOOTSTRAP[domain] || null;
					if (bootstrap !== null) {

						callback({
							domain: domain,
							hosts:  bootstrap.slice()
						});

					} else {

						// TODO: Use Radar as Domain Resolver

					}

				} else if (domain === 'tholian.network') {

					callback({
						domain: 'tholian.network',
						hosts:  BOOTSTRAP['tholian.network'].slice()
					});

				} else {

					resolve_domain(null, domain, (host) => {
						callback(host);
					});

				}

			} else {

				if (callback !== null) {
					callback(null);
				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			}

		}

	}

};


export { RESOLVER };

