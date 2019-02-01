
import https  from 'https';
import { IP } from '../parser/IP.mjs';


const _POOL = [
	{ host: 'cloudflare-dns.com', path: '/dns-query', ipv4: '1.1.1.1',        ipv6: '2606:4700:4700:0000:0000:0000:0000:1111' },
	{ host: 'cloudflare-dns.com', path: '/dns-query', ipv4: '1.0.0.1',        ipv6: '2606:4700:4700:0000:0000:0000:0000:1001' },
	{ host: 'dns.google.com',     path: '/resolve',   ipv4: '8.8.8.8',        ipv6: '2001:4860:4860:0000:0000:0000:0000:8888' },
	{ host: 'dns.google.com',     path: '/resolve',   ipv4: '8.8.4.4',        ipv6: '2001:4860:4860:0000:0000:0000:0000:8844' },
	{ host: 'dns.quad9.net',      path: '/dns-query', ipv4: '9.9.9.9',        ipv6: '2620:00fe:0000:0000:0000:0000:0000:00fe' },
	{ host: 'doh-jp.blahdns.com', path: '/dns-query', ipv4: '108.61.201.119', ipv6: '2001:19f0:7001:1ded:5400:01ff:fe90:945b' }
];



const _query = function(server, name, type, callback) {

	let socket = https.request({

		// XXX: This doesn't work in IPv4 environments, so the
		// DNS query itself is done via IPv4 instead of IPv6
		// hostname: type === 'AAAA' ? server.ipv6 : server.ipv4,

		hostname: server.ipv4,
		port:     443,
		method:   'GET',
		path:     server.path + '?name=' + name + '&type=' + type,
		headers:  {
			'Accept': 'application/dns-json'
		}
	}, response => {

		let blob = '';

		response.on('data', chunk => blob += chunk.toString('utf8'));
		response.on('end', () => {

			let data = null;
			try {
				data = JSON.parse(blob);
			} catch (err) {
				data = null;
			}

			if (data instanceof Object) {

				let answer = data['Answer'] || [];
				let result = answer.find(a => a.name === name + '.' && a.data !== '') || null;

				if (result !== null) {

					let forward = answer.find(a => a.name === result.data) || null;
					if (forward !== null) {
						result = forward;
					}

				}

				if (result !== null) {

					let ip = IP.parse(result.data);
					if (type === 'AAAA' && ip.type === 'v6') {
						callback(ip.ip);
					} else if (type === 'A' && ip.type === 'v4') {
						callback(ip.ip);
					} else {
						callback(null);
					}

				} else {
					callback(null);
				}

			} else {
				callback(null);
			}

		});

	});

	socket.on('error', () => callback(null));

	socket.write('');
	socket.end();

};



const DNS = {

	resolve: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let domain    = ref.domain || null;
			let subdomain = ref.subdomain || null;
			if (subdomain !== null) {
				domain = subdomain + '.' + domain;
			}


			let server = _POOL[Math.floor(Math.random() * _POOL.length)] || null;

			if (domain !== null && server !== null) {

				_query(server, domain, 'AAAA', ipv6 => {

					_query(server, domain, 'A', ipv4 => {

						callback({
							headers: {},
							payload: {
								domain: domain,
								ipv4:   ipv4,
								ipv6:   ipv6
							}
						});

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

