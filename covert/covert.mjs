
import process from 'process';

import { console     } from '../base/index.mjs';
import { Covert      } from './source/Covert.mjs';
import { Linter      } from './source/Linter.mjs';
import { ENVIRONMENT } from './source/ENVIRONMENT.mjs';



const REVIEWS = [];
const SOURCES = {};

const init = (callback) => {

	import(process.cwd() + '/review/index.mjs').then((mod) => {

		let reviews = mod['REVIEWS'] || [];
		if (reviews.length > 0) {
			reviews.forEach((review) => {
				REVIEWS.push(review);
			});
		}

		let sources = mod['SOURCES'] || {};
		if (Object.keys(sources).length > 0) {

			Object.keys(sources).forEach((id) => {
				SOURCES[id] = sources[id];
			});

		}

		callback(true);

	}).catch(() => {
		callback(false);
	});

};

const reset = (review) => {

	review.state = null;
	review.flatten().forEach((test) => {
		test.results.reset();
		test.timeline.reset();
		test.state = null;
	});

};

const show_help = () => {

	console.info('');
	console.info('Covert');
	console.info('');

	console.log('');
	console.log('Usage: covert [Action] [Identifier...] [--Flag=Value...]');
	console.log('');
	console.log('Usage Notes:');
	console.log('');
	console.log('    Identifier can also have a wildcard ("*") prefix or suffix.  ');
	console.log('    If no Identifier is given, all available Reviews are matched.');
	console.log('');
	console.log('Available Actions:');
	console.log('');
	console.log('    Action     | Description                                       ');
	console.log('    -----------|---------------------------------------------------');
	console.log('    check      | Checks reviews and lints and their tests.         ');
	console.log('    scan       | Scans reviews and executes their tests.           ');
	console.log('    time       | Scans reviews and benchmarks their test timelines.');
	console.log('    watch      | Watches filesystem and scans reviews on changes.  ');
	console.log('');
	console.log('Available Flags:');
	console.log('');
	console.log('    Flag       | Default | Values         | Description                                                          ');
	console.log('    -----------|---------|----------------|----------------------------------------------------------------------');
	console.log('    --debug    | false   | true, false    | Enable/Disable debug messages. Defaulted with false.                 ');
	console.log('    --inspect  | null    | "(Test Name)"  | Enable/Disable inspector to debug a single test. Defaulted with null.');
	console.log('    --internet | true    | true, false    | Enable/Disable internet usage. Defaulted with true.                  ');
	console.log('    --network  | null    | 1G, 2G, 3G, 4G | Simulate network behaviour. Defaulted with null.                     ');
	console.log('    --report   | null    | "(File Path)"  | Save a copy of the Covert Report to a file. Defaulted with null.     ');
	console.log('    --timeout  | 10s     | (Number)s      | Override test completion timeout. Defaulted with 10s.                ');
	console.log('');
	console.log('Examples:');
	console.log('');
	console.log('    cd /path/to/stealth;');
	console.log('    cd ./stealth;');
	console.log('');
	console.log('    covert check stealth/client/* --debug=true;');
	console.log('    covert scan stealth/connection/*;');
	console.log('    covert time stealth/connection/DNS --network=2G;');
	console.log('    covert watch stealth/connection/DNS stealth/connection/HTTPS;');
	console.log('');
	console.log('    covert scan stealth/Session --debug=true --inspect="Session.prototype.get()";');
	console.log('    covert scan --internet=false;');
	console.log('');


	if (ENVIRONMENT.flags.debug === true) {

		console.log('Available Reviews:');
		console.log('');

		let namespace = null;

		REVIEWS.forEach((review) => {

			let ns = review.id.split('/')[0];

			console.log('    ' + review.id);

			if (namespace === null) {
				namespace = ns;
			} else if (namespace !== ns) {
				console.log('');
				namespace = ns;
			}

		});

		console.log('');

	}

};



init((result) => {

	if (result === false || REVIEWS.length === 0) {

		console.error('');
		console.error('covert: Could not read "./review/index.mjs".');
		console.error('covert: Could not import "SOURCES" and "REVIEWS" constant.');
		console.error('');

		console.log('');
		console.info('covert: Change the current working directory to the project\'s root folder.');
		console.log('');

		process.exit(1);

	} else if (ENVIRONMENT.action === 'check') {

		let linter = new Linter({
			action:   ENVIRONMENT.action       || null,
			debug:    ENVIRONMENT.flags.debug  || false,
			patterns: ENVIRONMENT.patterns     || [],
			report:   ENVIRONMENT.flags.report || null,
			reviews:  REVIEWS,
			sources:  SOURCES
		});

		linter.on('disconnect', (reviews) => {

			if (ENVIRONMENT.flags.report !== null) {

				linter.destroy();
				process.exit(0);

			} else {

				if (reviews.length > 0) {
					process.exit(linter.destroy() || 0);
				} else {
					process.exit(1);
				}

			}

		});

		linter.connect();

	} else if (ENVIRONMENT.action === 'watch') {

		let covert = new Covert({
			action:   ENVIRONMENT.action         || null,
			debug:    ENVIRONMENT.flags.debug    || false,
			inspect:  ENVIRONMENT.flags.inspect  || null,
			internet: ENVIRONMENT.flags.internet || null,
			network:  ENVIRONMENT.flags.network  || null,
			patterns: ENVIRONMENT.patterns       || [],
			report:   ENVIRONMENT.flags.report   || null,
			reviews:  REVIEWS,
			sources:  SOURCES,
			timeout:  ENVIRONMENT.flags.timeout  || null
		});

		process.on('SIGINT', () => {
			setTimeout(() => covert.destroy(), 1000);
		});

		process.on('SIGQUIT', () => {
			setTimeout(() => covert.destroy(), 1000);
		});

		process.on('SIGABRT', () => {
			setTimeout(() => covert.destroy(), 1000);
		});

		process.on('SIGTERM', () => {
			setTimeout(() => covert.destroy(), 1000);
		});

		covert.on('disconnect', (reviews) => {

			if (reviews.length > 0) {

				let stub = setInterval(() => {
					// Do nothing
				}, 500);

				covert.once('connect', () => {

					if (stub !== null) {
						clearInterval(stub);
						stub = null;
					}

				});

			} else {

				process.exit(1);

			}

		});

		covert.on('change', (reviews, review) => {

			covert.once('disconnect', () => {
				reset(review);
				covert.connect();
			});

			covert.disconnect();

		});

		covert.connect();

	} else if (ENVIRONMENT.action === 'scan' || ENVIRONMENT.action === 'time') {

		let covert = new Covert({
			action:   ENVIRONMENT.action         || null,
			debug:    ENVIRONMENT.flags.debug    || false,
			inspect:  ENVIRONMENT.flags.inspect  || null,
			internet: ENVIRONMENT.flags.internet || null,
			network:  ENVIRONMENT.flags.network  || null,
			patterns: ENVIRONMENT.patterns       || [],
			report:   ENVIRONMENT.flags.report   || null,
			reviews:  REVIEWS,
			sources:  SOURCES,
			timeout:  ENVIRONMENT.flags.timeout  || null
		});

		covert.on('disconnect', (reviews) => {

			if (ENVIRONMENT.flags.report !== null) {

				covert.destroy();
				process.exit(0);

			} else {

				if (reviews.length > 0) {
					process.exit(covert.destroy() || 0);
				} else {
					process.exit(1);
				}

			}

		});

		covert.connect();

	} else {

		show_help();
		process.exit(1);

	}

});

