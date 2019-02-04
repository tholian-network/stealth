
import { Buffer } from 'buffer';
import { URL    } from './URL.mjs';



const _parse = function(payload) {

	let buffer = payload.toString('utf8').split('\n');
	if (buffer.length > 0) {

		let lines = buffer.map(b => b.trim()).filter(b => b !== '' && !b.startsWith('!') && !b.startsWith('#'));
		if (lines.length > 0) {

            let blockers = {
				hosts:      [],
				filters:    [],
				optimizers: []
			};

			lines.forEach(line => {

				if (line.startsWith('||')) {

					let tmp = line.substr(2);

					if (tmp.includes('^')) {
						tmp = tmp.split('^')[0];
					}

					if (tmp.includes('*')) {

						if (tmp.includes('$')) {
							tmp = tmp.split('$')[0];
						}

						if (tmp.includes(';')) {
							tmp = tmp.split(';')[0];
						}

						let domain = tmp.split('/')[0];
						if (domain.includes('*') === false) {

							let path = tmp.split('/').slice(1).join('/').split('?')[0].split('#')[0] || '';
							if (path.startsWith('/') === false) {
								path = '/'  + path;
							}

							let ref = URL.parse(domain + path);
							if (ref.domain !== null) {

								if (ref.subdomain !== null && ref.subdomain.includes('*')) {
									// TODO: Wildcard Domain Support
								} else if (ref.path.endsWith('.js')) {
									// Stealth ignores js files anyways
								} else if (ref.path !== '') {

									let chunks = ref.path.split('*');
									if (chunks.length > 2) {

										let prefix = chunks.shift();
										let suffix = chunks.pop();
										let midfix = chunks.sort((a, b) => {
											if (a.length > b.length) return -1;
											if (b.length > a.length) return  1;
											return 0;
										})[0];

										let check = blockers.filters.find(f => {
											return (
												f.domain === ref.domain
												&& f.subdomain === ref.subdomain
												&& f.prefix === prefix
												&& f.midfix === midfix
												&& f.suffix === suffix
											);
										}) || null;

										if (check === null) {
											blockers.filters.push({
												domain:    ref.domain,
												subdomain: ref.subdomain,
												prefix:    prefix,
												midfix:    midfix,
												suffix:    suffix
											});
										}

									} else if (chunks.length === 2) {

										let prefix = chunks[0];
										let midfix = chunks[1];
										let suffix = null;

										if (midfix.includes('.') && midfix !== '.') {
											suffix = midfix;
											midfix = null;
										}

										let check = blockers.filters.find(f => {
											return (
												f.domain === ref.domain
												&& f.subdomain === ref.subdomain
												&& f.prefix === prefix
												&& f.suffix === suffix
											);
										}) || null;

										if (check === null) {
											blockers.filters.push({
												domain:    ref.domain,
												subdomain: ref.subdomain,
												prefix:    prefix,
												midfix:    midfix,
												suffix:    suffix
											});
										}

									}

								}

							}

						}

					} else {

						if (tmp.includes('$')) {
							tmp = tmp.split('$')[0];
						}

						if (tmp.includes(';')) {
							tmp = tmp.split(';')[0];
						}

						let domain = tmp.split('/')[0];
						let path = tmp.split('/').slice(1).join('/').split('?')[0].split('#')[0] || '';
						if (path.startsWith('/') === false) {
							path = '/'  + path;
						}

						let ref = URL.parse(domain + path);
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



const AdGuard = {

	parse: function(payload) {

		payload = payload instanceof Buffer ? payload : null;


		if (payload !== null) {
			return _parse(payload);
		}


		return null;

	}

};


export { AdGuard };

