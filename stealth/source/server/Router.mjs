
import dgram from 'dgram';

import { isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { isStealth                                } from '../../source/Stealth.mjs';
import { ENVIRONMENT                              } from '../../source/ENVIRONMENT.mjs';
import { DNSH                                     } from '../../source/connection/DNSH.mjs';
import { DNSS                                     } from '../../source/connection/DNSS.mjs';
import { DNS as PACKET                            } from '../../source/packet/DNS.mjs';
import { isServices                               } from '../../source/server/Services.mjs';
import { IP                                       } from '../../source/parser/IP.mjs';
import { URL                                      } from '../../source/parser/URL.mjs';



const RESERVED_SUBDOMAINS = [

	// *.tholian.network
	'admin',
	'beacon',
	'browser',
	'radar',
	'recon',
	'sonar',
	'stealth',
	'www'

];

const RESERVED_DOMAINS = [

	// DNS RFC
	'domain',
	'example',
	'invalid',
	'local',
	'localhost',
	'test',

	// Basically RFC-violating companies
	'belkin',
	'corp',
	'home',
	'lan',
	'localdomain',
	'mail',
	'wpad',
	'workgroup'

];

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
	Object.assign(URL.parse('https://dns.google:443/dns-query'), {
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

export const isRouter = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Router]';
};

const isQuery = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& (isString(payload.subdomain) === true || payload.subdomain === null)
	) {

		let valid = true;

		RESERVED_DOMAINS.forEach((tld) => {

			if (payload.domain.endsWith('.' + tld) || payload.domain === tld) {
				valid = false;
			}

		});

		if (
			isString(payload.domain) === true
			&& payload.domain === 'tholian.network'
		) {

			if (isString(payload.subdomain) === true) {

				if (RESERVED_SUBDOMAINS.includes(payload.subdomain) === true) {
					valid = true;
				} else {
					valid = false;
				}

			} else if (payload.subdomain === null) {
				valid = true;
			}

		}

		if (
			isString(payload.domain) === true
			&& payload.domain === 'tholian.local'
		) {
			valid = false;
		}

		return valid;

	}


	return false;

};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof dgram.Socket;
	}


	return false;

};

const isValid = (record) => {

	if (record.type === 'A' || record.type === 'AAAA') {

		let url    = URL.parse(record.domain);
		let domain = URL.toDomain(url);
		if (domain !== null) {

			let valid = true;

			RESERVED_DOMAINS.forEach((tld) => {

				if (domain === tld || domain.endsWith('.' + tld)) {
					valid = false;
				}

			});

			return valid;

		}

	}


	return false;

};

const isResolveRequest = function(packet) {

	if (packet.headers['@type'] === 'request') {

		if (packet.payload.questions.length > 0 && packet.payload.answers.length === 0) {

			let check1 = packet.payload.questions.filter((q) => isValid(q));
			if (check1.length === packet.payload.questions.length) {
				return true;
			}

		}

	}


	return false;

};

const isResolveResponse = function(packet) {

	if (packet.headers['@type'] === 'response') {

		if (packet.payload.questions.length > 0 && packet.payload.answers.length > 0) {

			let check1 = packet.payload.questions.filter((q) => isValid(q));
			let check2 = packet.payload.answers.filter((a) => isValid(a));

			if (
				check1.length === packet.payload.questions.length
				&& check2.length === packet.payload.answers.length
			) {
				return true;
			}

		}

	}


	return false;

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



const Router = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

};


Router.prototype = {

	[Symbol.toStringTag]: 'Router',

	toJSON: function() {

		let data = {
		};


		return {
			'type': 'Router',
			'data': data
		};

	},

	can: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (PACKET.isPacket(buffer) === true) {

				let packet = PACKET.decode(null, buffer);
				if (packet !== null) {

					if (packet.headers['@type'] === 'request') {

						if (isResolveRequest(packet) === true) {
							return true;
						} else if (isResolveResponse(packet) === true) {
							return true;
						}

					}

				}

			}

		}


		return false;

	},

	resolve: function(query, callback) {

		query    = isQuery(query)       ? query    : null;
		callback = isFunction(callback) ? callback : null;


		let connection = null;

		if (this.stealth !== null) {
			connection = this.stealth.settings.internet.connection;
		}

		if (
			query !== null
			&& ENVIRONMENT.ips.length > 0
			&& (
				connection === 'mobile'
				|| connection === 'broadband'
				|| connection === 'tor'
			)
		) {

			let domain      = toDomain(query);
			let supports_v4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
			let supports_v6 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6').length > 0;

			if (RONIN.length === 0) {

				SERVERS.forEach((server) => RONIN.push(server));

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

			}

			let url        = RONIN.shift();
			let connection = null;

			if (url.protocol === 'https') {
				connection = DNSH.connect(url);
			} else if (url.protocol === 'dnss') {
				connection = DNSS.connect(url);
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

					if (callback !== null) {

						callback({
							domain: domain,
							hosts:  hosts
						});

					}

					connection.disconnect();

				});

				connection.once('error', () => {

					if (callback !== null) {
						callback(null);
					}

				});


				let request = {
					headers: {
						'@type': 'request'
					},
					payload: {
						questions: [{
							domain: domain,
							type:   'A',
							value:  null
						}, {
							domain: domain,
							type:   'AAAA',
							value:  null
						}],
						answers:   []
					}
				};

				connection.once('@connect', () => {

					if (connection.protocol === 'https') {
						DNSH.send(request);
					} else if (connection.protocol === 'dnss') {
						DNSS.send(request);
					}

				});

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

	},

	upgrade: function(buffer, socket, remote) {

		buffer = isBuffer(buffer) ? buffer : null;
		socket = isSocket(socket) ? socket : null;


		let packet = PACKET.decode(null, buffer);
		if (packet !== null) {

			if (isResolveRequest(packet) === true) {

				// TODO: Try to resolve via Hosts Service's read() method
				// which automatically leads to caching and automatically
				// uses the resolve() method if necessary

				// TODO: Only resolve hosts if internet settings
				// allow to do so (broadband, mobile)

			} else if (isResolveResponse(packet) === true) {

				// TODO: Verify A and AAAA entries
				// TODO: Add hosts to settings.hosts[]

			}

		} else {

			// Do Nothing

		}


		return null;

	}

};


export { Router };

