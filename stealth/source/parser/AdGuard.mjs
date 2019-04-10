
import { Buffer } from 'buffer';
import { URL    } from './URL.mjs';



const _parse = function(payload) {

	let buffer = payload.toString('utf8').split('\n');
	if (buffer.length > 0) {

		let lines = buffer.map((b) => b.trim()).filter((b) => b !== '' && !b.startsWith('!') && !b.startsWith('#'));
		if (lines.length > 0) {

			let blockers = [];

			lines.forEach((line) => {

				if (line.startsWith('||')) {

					let tmp = line.substr(2);

					if (tmp.includes('^')) {
						tmp = tmp.split('^')[0];
					}

					if (tmp.includes('*') === false) {

						if (tmp.includes('$')) {
							tmp = tmp.split('$')[0];
						}

						if (tmp.includes(';')) {
							tmp = tmp.split(';')[0];
						}

						let domain = tmp.split('/')[0];
						let path   = tmp.split('/').slice(1).join('/').split('?')[0].split('#')[0] || '';
						if (path === '') {

							let ref = URL.parse(domain);
							if (ref.domain !== null) {

								let check = blockers.find((f) => f.domain === ref.domain && f.subdomain === ref.subdomain) || null;
								if (check === null) {
									blockers.push({
										domain:    ref.domain,
										subdomain: ref.subdomain
									});
								}

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



const AdGuard = {

	parse: function(payload) {

		payload = Buffer.isBuffer(payload) ? payload : null;


		if (payload !== null) {
			return _parse(payload);
		}


		return null;

	}

};


export const parse = AdGuard.parse;

export { AdGuard };

