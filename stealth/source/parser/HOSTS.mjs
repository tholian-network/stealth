
import { isBuffer, isArray, isObject, isString } from '../../extern/base.mjs';
import { IP                                    } from '../../source/parser/IP.mjs';
import { URL                                   } from '../../source/parser/URL.mjs';



const HOSTS = {

	compare: function(a, b) {

		let is_host_a = HOSTS.isHost(a) === true;
		let is_host_b = HOSTS.isHost(b) === true;

		if (is_host_a === true && is_host_b === true) {

			let url_a = URL.parse(a.domain);
			let url_b = URL.parse(b.domain);

			if (url_a.domain !== null && url_b.domain !== null) {

				if (url_a.domain < url_b.domain) return -1;
				if (url_b.domain < url_a.domain) return 1;

				if (url_a.subdomain !== null && url_b.subdomain !== null) {

					if (url_a.subdomain < url_b.subdomain) return -1;
					if (url_b.subdomain < url_a.subdomain) return 1;

				} else {

					if (url_a.subdomain !== null) return 1;
					if (url_b.subdomain !== null) return -1;

				}

			} else {

				if (url_a.domain !== null) return -1;
				if (url_b.domain !== null) return 1;

			}


			let a_private = a.hosts.filter((ip) => ip.scope === 'private');
			let b_private = b.hosts.filter((ip) => ip.scope === 'private');

			if (a_private.length > 0 && b_private.length === 0) return -1;
			if (b_private.length > 0 && a_private.length === 0) return 1;

			if (a_private.length > 0 && b_private.length > 0) {

				let a_v4 = a.hosts.filter((ip) => ip.type === 'v4');
				let b_v4 = b.hosts.filter((ip) => ip.type === 'v4');

				if (a_v4.length > 0 && b_v4.length === 0) return -1;
				if (b_v4.length > 0 && a_v4.length === 0) return 1;

				let a_ip = IP.sort(a_v4)[0];
				let b_ip = IP.sort(b_v4)[0];

				if (a_ip.ip < b_ip.ip) return -1;
				if (b_ip.ip < a_ip.ip) return 1;

			}


			let a_public = a.hosts.filter((ip) => ip.scope === 'public');
			let b_public = b.hosts.filter((ip) => ip.scope === 'public');

			if (a_public.length > 0 && b_public.length > 0) {

				let a_v4 = a.hosts.filter((ip) => ip.type === 'v4');
				let b_v4 = b.hosts.filter((ip) => ip.type === 'v4');

				if (a_v4.length > 0 && b_v4.length === 0) return -1;
				if (b_v4.length > 0 && a_v4.length === 0) return 1;

				let a_ip = IP.sort(a_v4)[0];
				let b_ip = IP.sort(b_v4)[0];

				if (a_ip.ip < b_ip.ip) return -1;
				if (b_ip.ip < a_ip.ip) return 1;

			}


			return 0;

		} else if (is_host_a === true) {
			return -1;
		} else if (is_host_b === true) {
			return 1;
		}


		return 0;

	},

	isHost: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			if (
				isString(payload.domain) === true
				&& isArray(payload.hosts) === true
			) {

				let url    = URL.parse(payload.domain);
				let domain = URL.toDomain(url);

				if (domain === payload.domain) {

					let check = payload.hosts.map((ip) => IP.isIP(ip) === true);
					if (check.includes(false) === false) {
						return true;
					}

				}

			}

		}


		return false;

	},

	isHOSTS: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			let check = array.map((host) => HOSTS.isHost(host) === true);
			if (check.includes(false) === false) {
				return true;
			}

		}


		return false;

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
		}


		let hosts = [];

		if (raw !== null) {

			let lines = raw.split('\n').map((raw) => {

				let chunk = raw.trim();
				if (
					chunk.length > 0
					&& chunk !== '#'
					&& chunk[0] !== '!'
				) {

					if (chunk.includes('#') === true) {
						chunk = chunk.split('#')[0].trim();
					}

					if (chunk.length > 0) {
						return chunk;
					}

				}

				return null;

			}).filter((chunk) => chunk !== null);

			if (lines.length > 0) {

				let map = {};

				for (let l = 0, ll = lines.length; l < ll; l++) {

					let domains = [];
					let ip      = null;

					let line = lines[l];
					if (line.includes('\t') === true) {

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
							if (chunk.includes('.') === true) {

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

						let url    = URL.parse(fqdn);
						let domain = URL.toDomain(url);
						if (domain !== null) {

							hosts.push({
								domain: domain,
								hosts:  ips
							});

						}

					}

				}

			}

		}

		return hosts;

	},

	render: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			let lines = [];

			array.forEach((entry) => {

				let domain = entry.domain || null;
				let hosts  = entry.hosts  || null;

				if (isString(domain) === true && isArray(hosts) === true) {

					if (hosts.length > 0) {
						hosts.forEach((ip) => {

							let chunk = IP.render(ip);
							if (chunk !== null) {
								lines.push(chunk + '\t' + domain);
							}

						});
					}

				}

			});

			if (lines.length > 0) {
				return lines.join('\n');
			}

		}


		return null;

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((host) => {
				return HOSTS.isHost(host) === true;
			}).sort((a, b) => {
				return HOSTS.compare(a, b);
			});

		}


		return [];

	}

};


export { HOSTS };

