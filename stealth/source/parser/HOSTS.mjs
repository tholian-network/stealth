
import { Buffer } from '../POLYFILLS.mjs';
import { IP     } from './IP.mjs';
import { URL    } from './URL.mjs';



const parse_payload = function(payload) {

	let hosts = [];

	let buffer = payload.toString('utf8').split('\n');
	if (buffer.length > 0) {

		let lines = [];

		for (let b = 0, bl = buffer.length; b < bl; b++) {

			let chunk = buffer[b].trim();
			if (chunk.length > 0 && chunk[0] !== '#' && chunk[0] !== '!') {

				let index = chunk.indexOf('#');
				if (index !== -1) {
					chunk = chunk.substr(0, index).trim();
				}

				lines.push(chunk);

			}

		}

		if (lines.length > 0) {

			let map = {};

			for (let l = 0, ll = lines.length; l < ll; l++) {

				let domains = [];
				let ip      = null;

				let line = lines[l];
				if (line.includes('\t')) {

					let tmp = line.split('\t');
					for (let t = 0, tl = tmp.length; t < tl; t++) {

						let chunk = tmp[t].trim();
						if (chunk !== '' && t === 0) {

							ip = chunk;

						} else if (
							chunk !== ''
							&& chunk !== 'localhost'
							&& chunk !== 'localhost.localdomain'
							&& chunk !== 'ipv6-localhost'
							&& chunk !== 'ipv6-localhost.localdomain'
						) {

							domains.push(chunk);

						}

					}

				} else {

					let tmp = line.split(' ');
					if (tmp.length > 1) {

						for (let t = 0, tl = tmp.length; t < tl; t++) {

							let chunk = tmp[t].trim();
							if (chunk !== '' && t === 0) {

								ip = chunk;

							} else if (
								chunk !== ''
								&& chunk !== 'localhost'
								&& chunk !== 'localhost.localdomain'
								&& chunk !== 'ipv6-localhost'
								&& chunk !== 'ipv6-localhost.localdomain'
							) {

								domains.push(chunk);

							}

						}

					} else {

						let chunk = tmp[0];
						if (chunk.includes('.')) {

							// Allow third-party domain lists that
							// are not in /etc/hosts format
							ip = '0.0.0.0';
							domains.push(tmp[0]);

						}

					}

				}


				if (ip !== null && domains.length > 0) {

					// RFC1122
					if (ip === '0.0.0.0') {
						ip = '127.0.0.1';
					}

					for (let d = 0, dl = domains.length; d < dl; d++) {

						let domain = domains[d];

						let entry = map[domain] || null;
						if (entry === null) {
							entry = map[domain] = [];
						}

						if (entry.includes(ip) === false) {
							entry.push(ip);
						}

					}

				}

			}

			for (let fqdn in map) {

				let ips = map[fqdn].map((v) => IP.parse(v)).filter((ip) => ip.type !== null);
				if (ips.length > 0) {

					let ref = URL.parse(fqdn);
					if (ref.domain !== null) {

						if (ref.subdomain !== null) {
							hosts.push({
								domain: ref.subdomain + '.' + ref.domain,
								hosts:  ips
							});
						} else {
							hosts.push({
								domain: ref.domain,
								hosts:  ips
							});
						}

					}

				}

			}

		}

	}

	return hosts;

};



const HOSTS = {

	parse: function(payload) {

		payload = Buffer.isBuffer(payload) ? payload : null;


		if (payload !== null) {
			return parse_payload(payload);
		}


		return null;

	}

};


export const parse = HOSTS.parse;

export { HOSTS };

