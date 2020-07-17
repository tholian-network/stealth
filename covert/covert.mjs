
import process from 'process';

import { console     } from '../base/index.mjs';
import { Covert      } from './source/Covert.mjs';
import { Linter      } from './source/Linter.mjs';
import { ENVIRONMENT } from './source/ENVIRONMENT.mjs';

import BASE    from '../base/review/index.mjs';
import COVERT  from '../covert/review/index.mjs';
import STEALTH from '../stealth/review/index.mjs';



const REVIEWS = [
	...BASE.reviews,
	...COVERT.reviews,
	...STEALTH.reviews
];

const SOURCES = {
	base:    BASE.sources,
	covert:  COVERT.sources,
	stealth: STEALTH.sources
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
	console.log('    Flag       | Default | Values         | Description                                          ');
	console.log('    -----------|---------|----------------|------------------------------------------------------');
	console.log('    --debug    | false   | true, false    | Enable/Disable debug messages. Defaulted with false. ');
	console.log('    --internet | true    | true, false    | Enable/Disable internet usage. Defaulted with true.  ');
	console.log('    --network  | null    | 1G, 2G, 3G, 4G | Simulate network behaviour. Defaulted with null.     ');
	console.log('    --timeout  | 10s     | (Number)s      | Override test completion timeout. Defaulted with 10s.');
	console.log('');
	console.log('Examples:');
	console.log('');
	console.log('    covert check stealth/client/* --debug=true');
	console.log('    covert scan stealth/connection/*;');
	console.log('    covert time stealth/connection/DNS --network=2G;');
	console.log('    covert watch stealth/connection/DNS stealth/connection/HTTPS;');
	console.log('');

};



if (ENVIRONMENT.action === 'check') {

	let linter = new Linter({
		action:   ENVIRONMENT.action         || null,
		debug:    ENVIRONMENT.flags.debug    || false,
		internet: ENVIRONMENT.flags.internet || null,
		patterns: ENVIRONMENT.patterns       || [],
		reviews:  REVIEWS,
		sources:  SOURCES
	});

	linter.on('disconnect', () => {
		process.exit(linter.destroy() || 0);
	});

	if (ENVIRONMENT.patterns.length > 0 && linter.reviews.length === 0) {

		console.warn('Linter: No Review(s) matching the patterns "' + ENVIRONMENT.patterns.join('" or "') + '" found.');
		process.exit(2);

	} else {
		linter.connect();
	}

} else if (ENVIRONMENT.action === 'watch') {

	let covert = new Covert({
		action:   ENVIRONMENT.action         || null,
		debug:    ENVIRONMENT.flags.debug    || false,
		internet: ENVIRONMENT.flags.internet || null,
		network:  ENVIRONMENT.flags.network  || null,
		patterns: ENVIRONMENT.patterns       || [],
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

	covert.on('disconnect', () => {

		let stub = setInterval(() => {
			// Do nothing
		}, 500);

		covert.once('connect', () => {

			if (stub !== null) {
				clearInterval(stub);
				stub = null;
			}

		});

	});

	covert.on('change', (reviews, review) => {

		covert.once('disconnect', () => {
			reset(review);
			covert.connect();
		});

		covert.disconnect();

	});

	if (ENVIRONMENT.patterns.length > 0 && covert.reviews.length === 0) {

		console.warn('Covert: No Review(s) matching the patterns "' + ENVIRONMENT.patterns.join('" or "') + '" found.');
		process.exit(2);

	} else {
		covert.connect();
	}

} else if (ENVIRONMENT.action === 'scan' || ENVIRONMENT.action === 'time') {

	let covert = new Covert({
		action:   ENVIRONMENT.action         || null,
		debug:    ENVIRONMENT.flags.debug    || false,
		internet: ENVIRONMENT.flags.internet || null,
		network:  ENVIRONMENT.flags.network  || null,
		patterns: ENVIRONMENT.patterns       || [],
		reviews:  REVIEWS,
		sources:  SOURCES,
		timeout:  ENVIRONMENT.flags.timeout  || null
	});

	covert.on('disconnect', () => {
		process.exit(covert.destroy() || 0);
	});

	if (ENVIRONMENT.patterns.length > 0 && covert.reviews.length === 0) {

		console.warn('Covert: No Review(s) matching the patterns "' + ENVIRONMENT.patterns.join('" or "') + '" found.');
		process.exit(2);

	} else {
		covert.connect();
	}

} else {

	show_help();
	process.exit(1);

}

