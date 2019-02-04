
import { Buffer } from 'buffer';



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

					let host = hosts[h];
					if (host.domain === ref.domain) {

						if (host.subdomain === null || host.subdomain === ref.subdomain) {
							blocked = true;
							break;
						}

					}

				}

			}

			if (blocked === false && filters.length > 0) {

				for (let f = 0, fl = filters.length; f < fl; f++) {

					let filter = filters[f];
					if (filter.domain === ref.domain) {

						if (filter.subdomain === null || filter.subdomain === ref.subdomain) {

							let prefix = filter.prefix || null;
							let midfix = filter.midfix || null;
							let suffix = filter.suffix || null;

							if (prefix !== null || midfix !== null || suffix !== null) {

								if (prefix === null || (prefix !== null && ref.path.startsWith(prefix))) {
									if (midfix === null || (midfix !== null && ref.path.includes(midfix))) {
										if (suffix === null || (suffix !== null && ref.path.endsWith(suffix))) {
											blocked = true;
											break;
										}
									}
								}

							}

						}

					}

				}

			}


			callback(blocked);

		} else if (callback !== null) {
			// Blocked by default
			callback(true);
		}

	}

};


export { Blocker };

