
import process from 'process';

import { console } from './source/console.mjs';
import { Covert  } from './source/Covert.mjs';

import Server   from './review/Server.mjs';
import Client   from './review/Client.mjs';
import Peers    from './review/Peers.mjs';
import DNS      from './review/protocol/DNS.mjs';
import HTTP     from './review/protocol/HTTP.mjs';
import HTTPS    from './review/protocol/HTTPS.mjs';
import SOCKS    from './review/protocol/SOCKS.mjs';
import Cache    from './review/client/Cache.mjs';
import Filter   from './review/client/Filter.mjs';
import Host     from './review/client/Host.mjs';
import Mode     from './review/client/Mode.mjs';
import Peer     from './review/client/Peer.mjs';
import Redirect from './review/client/Redirect.mjs';
import Stash    from './review/client/Stash.mjs';

const ARGV  = Array.from(process.argv).slice(2).map((v) => v.trim()).filter((v) => v !== '');
const ARGS  = Array.from(ARGV).filter((v) => v.startsWith('--') === false);
const FLAGS = (() => {

	let flags = {};

	Array.from(ARGV).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=');
		if (tmp.length === 2) {

			let key = tmp[0];
			let val = tmp[1];

			let num = parseInt(val, 10);
			if (!isNaN(num) && (num).toString() === val) {
				val = num;
			}

			if (val === 'true')  val = true;
			if (val === 'false') val = false;
			if (val === 'null')  val = null;

			flags[key] = val;

		}

	});

	return flags;

})();



const settings = {
	debug: FLAGS.debug || false
};

(function(global) {

	let covert = global.covert = new Covert(settings);
	if (covert !== null) {

		let reviews = [

			// Network Protocols
			DNS, HTTP, HTTPS, SOCKS,

			// Server/Client
			Server, Client,

			// Client Services
			Cache, Filter, Host, Mode, Peer, Redirect, Stash,

			// Peer-to-Peer Services
			Peers

		];

		let filter = ARGS[0] || null;
		if (filter !== null) {

			if (filter.startsWith('*')) {

				reviews = reviews.filter((review) => {
					return review.id.endsWith(filter.substr(1));
				});

			} else if (filter.endsWith('*')) {

				reviews = reviews.filter((review) => {
					return review.id.startsWith(filter.substr(0, filter.length - 1));
				});

			} else if (filter.includes('*')) {

				let prefix = filter.split('*').shift();
				let suffix = filter.split('*').pop();

				reviews = reviews.filter((review) => {
					return review.id.startsWith(prefix) && review.id.endsWith(suffix);
				});

			} else {

				reviews = reviews.filter((review) => {
					return review.id === filter;
				});

			}

		}


		reviews.forEach((review) => {
			covert.scan(review);
		});


		covert.connect((results, timelines) => {

			let flat_results   = [];
			let flat_timelines = [];


			results.forEach((data) => {
				data.before.forEach((v) => flat_results.push(v));
				data.tests.forEach((v)  => flat_results.push(...v));
				data.after.forEach((v)  => flat_results.push(v));
			});

			timelines.forEach((data) => {
				data.before.forEach((v) => flat_timelines.push(v));
				data.tests.forEach((v)  => flat_timelines.push(...v));
				data.after.forEach((v)  => flat_timelines.push(v));
			});


			console.log('');

			if (flat_results.includes(null)) {

				console.warn('Covert: Some tests incomplete.');
				process.exit(2);

			} else if (flat_results.includes(false)) {

				console.error('Covert: Some tests failed.');
				process.exit(1);

			} else {

				console.info('Covert: All tests okay.');
				process.exit(0);

			}

		});

	}

})(global);

