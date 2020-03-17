
import process from 'process';

import { console } from './source/console.mjs';
import { Covert  } from './source/Covert.mjs';

import Request         from './review/Request.mjs';
import Review          from './review/Review.mjs';
import Server          from './review/Server.mjs';
import Parser_CSS      from './review/parser/CSS.mjs';
import Parser_HOSTS    from './review/parser/HOSTS.mjs';
import Parser_IP       from './review/parser/IP.mjs';
import Parser_URL      from './review/parser/URL.mjs';
import Optimizer_CSS   from './review/optimizer/CSS.mjs';
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



const ACTION = (() => {

	let value = Array.from(process.argv).slice(2)[0] || '';
	if (/^([watch]{5})$/g.test(value)) {
		return 'watch';
	} else if (/^([scan]{4})$/g.test(value)) {
		return 'scan';
	} else if (/^([time]{4})$/g.test(value)) {
		return 'time';
	}

	return 'help';

})();

const FLAGS = (() => {

	let flags = {
		debug:    false,
		internet: true,
		network:  null
	};

	Array.from(process.argv).slice(2).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=').map((v) => v.trim());
		if (tmp.length === 2) {

			let key = tmp[0];
			let val = tmp[1];

			let num = parseInt(val, 10);
			if (!isNaN(num) && (num).toString() === val) {
				val = num;
			} else if (val === 'true') {
				val = true;
			} else if (val === 'false') {
				val = false;
			} else if (val === 'null') {
				val = null;
			}

			flags[key] = val;

		}

	});

	return flags;

})();

const REVIEWS = (() => {

	let reviews = [

		Review,

		// Parsers
		Parser_CSS,
		Parser_HOSTS,
		Parser_IP,
		Parser_URL,

		// Optimizers
		Optimizer_CSS,

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

	let include  = reviews.map(() => false);
	let filtered = false;

	Array.from(process.argv).slice(3).filter((v) => v.startsWith('--') === false).forEach((pattern) => {

		filtered = true;


		if (pattern.startsWith('*')) {

			reviews.forEach((review, r) => {

				if (review.id.endsWith(pattern.substr(1))) {
					include[r] = true;
				}

			});

		} else if (pattern.endsWith('*')) {

			reviews.forEach((review, r) => {

				if (review.id.startsWith(pattern.substr(0, pattern.length - 1))) {
					include[r] = true;
				}

			});

		} else if (pattern.includes('*')) {

			let prefix = pattern.split('*').shift();
			let suffix = pattern.split('*').pop();

			reviews.forEach((review, r) => {

				if (review.id.startsWith(prefix) && review.id.endsWith(suffix)) {
					include[r] = true;
				}

			});

		} else {

			reviews.forEach((review, r) => {

				if (review.id === pattern) {
					include[r] = true;
				}

			});

		}

	});


	// --internet defaulted with true
	if (FLAGS.internet === false) {

		reviews.forEach((review, r) => {

			if (review.flags.internet === true) {
				include[r] = false;
			}

		});

	}


	if (filtered === true) {

		return include.map((inc, i) => {
			return inc === true ? reviews[i] : null;
		}).filter((v) => v !== null);

	}


	return reviews;

})();

const show_help = () => {

	console.log('');
	console.info('Covert');
	console.log('');
	console.log('Usage: covert [Action] [Identifier...] [--Flag=Value...]');
	console.log('');
	console.log('Usage Notes:');
	console.log('');
	console.log('    Identifier can also have a wildcard prefix or suffix.        ');
	console.log('    If no Identifier is given, all available Reviews are matched.');
	console.log('');
	console.log('Available Actions:');
	console.log('');
	console.log('    Action     | Description                                              ');
	console.log('    -----------|----------------------------------------------------------');
	console.log('    scan       | Scans reviews and executes their tests.                  ');
	console.log('    time       | Scans reviews and benchmarks their test timelines.       ');
	console.log('    watch      | Observes Filesystem changes and scans Reviews on changes.');
	console.log('');
	console.log('Available Flags:');
	console.log('');
	console.log('    Flag       | Default | Values      | Description                                         ');
	console.log('    -----------|---------|-------------|-----------------------------------------------------');
	console.log('    --debug    | true    | true, false | Enable/Disable debug messages. Defaulted with false.');
	console.log('    --internet | false   | true, false | Enable/Disable internet usage. Defaulted with true. ');
	console.log('    --network  | null    | 2G, 3G, 4G  | Simulate network behaviour. Defaulted with null.    ');
	console.log('');
	console.log('Examples:');
	console.log('');
	console.log('    covert scan protocol/*;');
	console.log('    covert time protocol/DNS --network=2G;');
	console.log('    covert watch protocol/DNS protocol/HTTPS;');
	console.log('');

};



((settings) => {

	let action = settings.render || null;
	if (action === 'scan' || action === 'time' || action === 'watch') {

		console.log('');
		console.info('Covert: ' + action[0].toUpperCase() + action.substr(1) + ' Mode');
		console.log('');


		let covert = global.covert = new Covert(settings);
		if (covert !== null) {

			process.on('SIGHUP', () => {
				covert.disconnect();
			});

			process.on('SIGINT', () => {
				covert.disconnect();
				process.exit(1);
			});

			process.on('SIGQUIT', () => {
				covert.disconnect();
				process.exit(1);
			});

			process.on('SIGABRT', () => covert.disconnect());

			process.on('SIGTERM', () => {
				covert.disconnect();
			});

			process.on('error', () => {
				covert.disconnect();
				process.exit(1);
			});

			process.on('exit', () => {});

			REVIEWS.forEach((review) => {
				covert.scan(review);
			});

		}


		if (action === 'scan') {

			covert.connect((reviews) => {

				let waits = reviews.filter((r) => r.state === 'wait');
				let fails = reviews.filter((r) => r.state === 'fail');

				if (waits.length > 0) {

					if (settings.debug === true) {
						console.log('');
					} else {
						console.clear();
					}

					console.warn('');
					console.warn('Covert: Some reviews didn\'t complete.');
					console.warn('');

					waits.forEach((review, r) => {

						if (r > 0) console.log('');

						covert.renderer.render(review, 'summary');
					});


					if (fails.length > 0) {
						console.log('');
					}

					fails.forEach((review, r) => {

						if (r > 0) console.log('');

						covert.renderer.render(review, 'summary');

					});


					process.exit(2);

				} else if (fails.length > 0) {

					if (settings.debug === true) {
						console.log('');
					} else {
						console.clear();
					}

					console.error('');
					console.error('Covert: Some reviews didn\'t succeed.');
					console.error('');

					fails.forEach((review) => {
						covert.renderer.render(review, 'summary');
					});

					process.exit(1);

				} else {

					if (settings.debug === true) {
						console.log('');
					} else {
						console.clear();
					}

					console.info('');
					console.info('Covert: All reviews did succeed.');
					console.info('');

					process.exit(0);

				}

				// TODO: review.state to be wait, okay or fail

			});

		} else if (action === 'time') {

			// TODO: Update Loop integration for all Reviews
			// TODO: Final render() call for summary

		} else if (action === 'watch') {

			// TODO: fs.watch() integration
			// TODO: Diff Mode, left old results, right new results

		} else {

			show_help();
			process.exit(1);

		}

	} else {

		show_help();
		process.exit(1);

	}

})({
	render:  ACTION        || null,
	debug:   FLAGS.debug   || false,
	network: FLAGS.network || null
});

