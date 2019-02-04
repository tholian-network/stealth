
import { Buffer } from 'buffer';
import { URL    } from './URL.mjs';



const _parse = function(payload) {

	let buffer = payload.toString('utf8').split('\n');
	if (buffer.length > 0) {

		let lines = buffer.map(b => b.trim()).filter(b => b !== '' && !b.startsWith('#'));
		if (lines.length > 0) {

			let blockers = {
				hosts:      [],
				filters:    [],
				optimizers: []
			};

			lines.forEach(line => {

				if (line.includes('#')) {
					line = line.split('#')[0].trim();
				}

				let tmp   = line.split(' ');
				let ip    = tmp[0].trim();
				let hosts = tmp.slice(1).map(h => h.trim()).filter(host => {
					return host !== 'localhost' && host !== 'localhost.localdomain';
				});

				if (ip === '0.0.0.0' || ip === '127.0.0.1') {

					if (hosts.length > 1) {

						hosts.forEach(host => {

							let ref = URL.parse(host);
							if (ref.domain !== null) {

								let check = blockers.hosts.find(f => f.domain === ref.domain && f.subdomain === ref.subdomain) || null;
								if (check === null) {
									blockers.hosts.push({
										domain:    ref.domain,
										subdomain: ref.subdomain
									});
								}

							}

						});

					} else if (hosts.length === 1) {

						let ref = URL.parse(hosts[0]);
						if (ref.domain !== null) {

							let check = blockers.hosts.find(f => f.domain === ref.domain && f.subdomain === ref.subdomain) || null;
							if (check === null) {
								blockers.hosts.push({
									domain:    ref.domain,
									subdomain: ref.subdomain
								});
							}

						}

					}

				}

			});

			return blockers;

		}

	}


	return null;

};



const Hosts = {

	parse: function(payload) {

		payload = payload instanceof Buffer ? payload : null;


		if (payload !== null) {
			return _parse(payload);
		}


		return null;

	}

};


export { Hosts };

