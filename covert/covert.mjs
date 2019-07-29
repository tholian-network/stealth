
import process from 'process';

import { console } from './source/console.mjs';
import { Covert  } from './source/Covert.mjs';

import Server          from './review/Server.mjs';
import Request         from './review/Request.mjs';
import Parser_HOSTS    from './review/parser/HOSTS.mjs';
import Parser_IP       from './review/parser/IP.mjs';
import Parser_URL      from './review/parser/URL.mjs';
import Protocol_DNS    from './review/protocol/DNS.mjs';
import Protocol_HTTP   from './review/protocol/HTTP.mjs';
import Protocol_HTTPS  from './review/protocol/HTTPS.mjs';
import Protocol_SOCKS  from './review/protocol/SOCKS.mjs';
import Protocol_WS     from './review/protocol/WS.mjs';
import Protocol_WSS    from './review/protocol/WSS.mjs';
import Client          from './review/Client.mjs';
import Client_Cache    from './review/client/Cache.mjs';
import Client_Filter   from './review/client/Filter.mjs';
import Client_Host     from './review/client/Host.mjs';
import Client_Mode     from './review/client/Mode.mjs';
import Client_Peer     from './review/client/Peer.mjs';
import Client_Redirect from './review/client/Redirect.mjs';
import Client_Settings from './review/client/Settings.mjs';
import Client_Stash    from './review/client/Stash.mjs';
import Peer            from './review/Peer.mjs';
import Peer_Cache      from './review/peer/Cache.mjs';


const ARGV  = Array.from(process.argv).slice(2).map((v) => v.trim()).filter((v) => v !== '');
const ARGS  = Array.from(ARGV).filter((v) => v.startsWith('--') === false);
const FLAGS = (() => {

	let flags = {
		debug:    false,
		internet: true
	};

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

			// Parsers
			Parser_HOSTS,
			Parser_IP,
			Parser_URL,

			// Network Protocols
			Protocol_DNS,
			Protocol_HTTP,
			Protocol_HTTPS,
			Protocol_SOCKS,
			Protocol_WS,
			Protocol_WSS,

			// Server/Client
			Server,
			Client,

			// Network Services
			Client_Cache,
			Client_Filter,
			Client_Host,
			Client_Mode,
			Client_Peer,
			Client_Redirect,
			Client_Settings,
			Client_Stash,

			// Request
			Request,

			// Peer-to-Peer
			Peer,
			Peer_Cache

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

		} else if (FLAGS.internet === false) {


			reviews.forEach((review) => {

				review.tests = review.tests.filter((test) => {
					return test.flags.internet !== true;
				});

			});

		}


		if (reviews.length > 0) {

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

		} else {

			console.warn('Covert: No matching reviews found.');
			process.exit(2);

		}

	}

})(global);

