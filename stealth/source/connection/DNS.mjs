
import { isArray, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { IP                                                } from '../parser/IP.mjs';
import { HTTPS                                             } from './HTTPS.mjs';



let DNS_RONIN = 0;

const isQuery = function(payload) {

	if (
		isObject(payload)
		&& isString(payload.domain)
		&& (isString(payload.subdomain) || payload.subdomain === null)
	) {
		return true;
	}


	return false;

};

const toDomain = function(payload) {

	let domain = null;

	if (isString(payload.domain) === true) {

		if (isString(payload.subdomain) === true) {
			domain = payload.subdomain + '.' + payload.domain;
		} else {
			domain = payload.domain;
		}

	}

	return domain;

};

const parse = function(payload) {

	let hosts = [];

	if (isBuffer(payload) === true) {

		let data = null;

		try {
			data = JSON.parse(payload.toString('utf8'));
		} catch (err) {
			data = null;
		}


		if (isObject(data) === true && isArray(data['Answer']) === true) {

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

const resolve = function(url, domain, type, callback) {

	url.host      = null;
	url.subdomain = null;
	url.headers   = null;
	url.payload   = null;


	let connection = HTTPS.connect(url);
	if (connection !== null) {

		connection.on('@connect', () => {

			HTTPS.send(connection, {
				headers: {
					'@method': 'GET',
					'@url':    url.path + '?name=' + domain + '&type=' + type,
					'accept':  'application/dns-json',
					'host':    url.domain
				}
			});

		});

		connection.on('response', (response) => {
			callback(parse(response.payload));
		});

		connection.on('error', () => {
			callback(null);
		});

		connection.on('redirect', () => {
			callback(null);
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
		port:     5053,
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
		if (dns.domain === 'doh-jp.blahdns.com') return false;

		return true;

	}),

	TYPE: {
		A:     1,
		AAAA: 28
	},

	resolve: function(query, callback) {

		query    = isQuery(query)       ? query    : null;
		callback = isFunction(callback) ? callback : null;


		if (query !== null && callback !== null) {

			let domain     = toDomain(query);
			let server_url = null;

			if (DNS.SERVER === null) {

				server_url = DNS.SERVERS[DNS_RONIN];

				DNS_RONIN += 1;
				DNS_RONIN %= DNS.SERVERS.length;

			} else if (DNS.SERVERS.includes(DNS.SERVER) === true) {

				server_url = DNS.SERVER;

			} else {

				DNS.SERVER = null;
				server_url = DNS.SERVERS[DNS_RONIN];

				DNS_RONIN += 1;
				DNS_RONIN %= DNS.SERVERS.length;

			}


			if (domain !== null && server_url !== null) {

				resolve(server_url, domain, 'A', (hosts_v4) => {

					resolve(server_url, domain, 'AAAA', (hosts_v6) => {

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

