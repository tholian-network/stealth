
import { Buffer } from 'buffer';
import { URL    } from './URL.mjs';



const _parse = function(payload) {

	let buffer = payload.toString('utf8').split('\n');
	if (buffer.length > 0) {

		let lines = buffer.map((b) => b.trim()).filter((b) => b !== '').filter((b) => {
			return b.startsWith('!') === false && b.startsWith('#') === false;
		});

		if (lines.length > 0) {

			let domains = {};

			lines.forEach((line) => {

				let i0 = line.indexOf('#');
				if (i0 !== -1) {
					line = line.substr(0, i0).trim();
				}

				let tmp = '';

				if (line.includes('\t')) {
					tmp = line.split('\t').filter((v) => v !== '');
				} else {
					tmp = line.split(' ').filter((v) => v !== '');
				}

				let ip    = tmp[0].trim();
				let hosts = tmp.slice(1).map((h) => h.trim()).filter((host) => {
					return host !== 'localhost' && host !== 'localhost.localdomain';
				});

				if (ip === '0.0.0.0' || ip === '127.0.0.1') {

					if (hosts.length > 1) {

						hosts.forEach((host) => {
							domains[host] = true;
						});

					} else if (hosts.length === 1) {
						domains[hosts[0]] = true;
					}

				} else if (ip.includes(':')) {
					// ignore localhost bindings
				} else if (ip.includes('.')) {
					domains[ip] = true;
				}

			});


			return Object.keys(domains).map((domain) => {

				let ref = URL.parse(domain);
				if (ref.domain !== null && ref.subdomain !== null) {
					return {
						domain:    ref.domain,
						subdomain: ref.subdomain
					};
				} else if (ref.domain !== null) {
					return {
						domain: ref.domain
					};
				} else {
					return null;
				}

			}).filter((r) => r !== null);

		}

	}


	return null;

};



const Hosts = {

	parse: function(payload) {

		payload = Buffer.isBuffer(payload) ? payload : null;


		if (payload !== null) {
			return _parse(payload);
		}


		return null;

	}

};


export const parse = Hosts.parse;

export { Hosts };

