
import { Buffer } from 'buffer';
import { URL    } from '../parser/URL.mjs';



const _parse_buffer = function(buffer, blockers) {

	let lines = buffer.toString('utf8').split('\n');
	if (lines.length > 0) {

		lines
			.map(line => line.trim())
			.filter(line => line !== '')
			.filter(line => !line.startsWith('#'))
			.forEach(line => {

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

	}

};



const Blocker = {

	check: function(blockers, ref, callback) {

		blockers = blockers instanceof Object     ? blockers : {};
		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let blocked = false;
			let hosts   = blockers.hosts   || [];
			let filters = blockers.filters || [];

			if (blocked === false && hosts.length > 0) {

				for (let h = 0, hl = hosts.length; h < hl; h++) {

					// TODO: If host.domain === ref.domain

				}

			}

			if (blocked === false && filters.length > 0) {

				for (let f = 0, fl = filters.length; f < fl; f++) {

					// TODO: If ref.path.includes(filter.chunk)
					// TODO: If ref.path.startsWith(filter.prefix)
					// TODO: If ref.path.endsWith(filter.suffix)

				}

			}


			callback(blocked);

		} else if (callback !== null) {
			// Blocked by default
			callback(true);
		}

	},

	refresh: function(payloads, callback) {

		payloads = payloads instanceof Array      ? payloads : null;
		callback = typeof callback === 'function' ? callback : null;


		if (payloads !== null && callback !== null) {

			let blockers = {
				hosts:   [],
				filters: []
			};

			let buffers = payloads.filter(payload => Buffer.isBuffer(payload));
			if (buffers.length > 0) {
				buffers.forEach(buffer => _parse_buffer(buffer, blockers));
			}

			callback(blockers);

		} else if (callback !== null) {
			callback(null);
		}

	}

};


export { Blocker };

