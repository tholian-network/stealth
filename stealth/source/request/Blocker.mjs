
const Blocker = {

	check: function(blockers, ref, callback) {

		blockers = blockers instanceof Array      ? blockers : [];
		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let blocked = false;

			if (blockers.length > 0) {

				for (let b = 0, bl = blockers.length; b < bl; b++) {

					let host = blockers[b];
					if (host.domain === ref.domain) {
						blocked = true;
						break;
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

