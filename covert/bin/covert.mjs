
import process from 'process';

import { console                       } from '../../stealth/source/BASE.mjs';
import { Covert                        } from '../source/Covert.mjs';
import { Filesystem                    } from '../source/Filesystem.mjs';
import { action, flags, patterns, root } from '../source/ENVIRONMENT.mjs';
import { REVIEWS as BASE               } from '../../base/review/index.mjs';
import { REVIEWS as COVERT             } from '../../covert/review/index.mjs';
import { REVIEWS as STEALTH            } from '../../stealth/review/index.mjs';



const REVIEWS = [
	...BASE,
	...COVERT,
	...STEALTH
];

const lint_test = (test) => {

	let errors = [];

	let body = test.callback.toString().split('\n').slice(1, -1);
	if (body.length > 0) {

		let wrong_compare = body.map((line) => line.trim()).filter((line) => {
			return line.startsWith('assert(') && line.endsWith(' === undefined);') === false;
		}).find((line) => {
			return line.startsWith('assert(') && (line.includes(' === ') || line.includes(' == ') || line.includes(' && '));
		}) || null;

		if (wrong_compare !== null) {
			errors.push(test.name + ' should use assert(value, expect).');
		}

	}

	return errors;

};

const lint = (review) => {

	let errors = [];

	if (review.before !== null) {

		if (review.before.results.length === 0) {
			errors.push(review.before.name + ' has no assert() calls.');
		}

		lint_test(review.before).forEach((error) => {
			errors.push(error);
		});

	}

	if (review.tests.length === 0) {

		errors.push('no describe() calls.');

	} else {

		review.tests.forEach((test) => {

			if (test.results.length === 0) {

				errors.push(test.name + ' has no assert() calls.');

			} else {

				lint_test(test).forEach((error) => {
					errors.push(error);
				});

			}

		});

	}

	if (review.after !== null) {

		if (review.after.results.length === 0) {
			errors.push(review.after.name + ' has no assert() calls.');
		}

		lint_test(review.after).forEach((error) => {
			errors.push(error);
		});

	}

	return errors;

};

const reset = (review) => {

	review.state = null;

	if (review.before !== null) {
		review.before.state = null;
		review.before.results.reset();
		review.before.timeline.reset();
	}

	if (review.tests.length > 0) {
		review.tests.forEach((test) => {
			test.state = null;
			test.results.reset();
			test.timeline.reset();
		});
	}

	if (review.after !== null) {
		review.after.state = null;
		review.after.results.reset();
		review.after.timeline.reset();
	}

};

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
	console.log('    check      | Checks reviews and lists tests with no assert() calls.   ');
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
	console.log('    covert scan stealth/protocol/*;');
	console.log('    covert time stealth/protocol/DNS --network=2G;');
	console.log('    covert watch stealth/protocol/DNS protocol/HTTPS;');
	console.log('');

};

const on_complete = (covert) => {

	let fails = covert.reviews.filter((r) => r.state === 'fail');
	let skips = covert.reviews.filter((r) => r.state === null);
	let waits = covert.reviews.filter((r) => r.state === 'wait');

	if (skips.length > 0 || waits.length > 0) {

		if (covert._settings.debug === true) {
			console.log('');
		} else {
			console.clear();
		}

		console.warn('');
		console.warn('Covert: Some reviews didn\'t complete.');
		console.warn('');

		skips.forEach((review, r) => {

			if (r > 0) console.log('');

			covert.renderer.render(review, 'complete');

		});

		if (waits.length > 0) {
			console.log('');
		}

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

		if (covert._settings.debug === true) {
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

		if (covert._settings.debug === true) {
			console.log('');
		} else {
			console.clear();
		}


		console.info('');
		console.info('Covert: All reviews did succeed.');
		console.info('');

		let action = covert._settings.action || null;
		if (action === 'time' || action === 'watch') {

			console.log('');

			covert.reviews.forEach((review, r) => {

				if (r > 0) console.log('');

				covert.renderer.render(review, 'complete');

			});

		}

		process.exit(0);

	}

};



if (action === 'check') {

	console.log('');
	console.info('Covert: Check Mode only validates Reviews and does not execute Covert!');
	console.log('');


	let reviews         = [];
	let implementations = new Filesystem().scan(root + '/stealth/source', true).filter((path) => {

		if (
			path.endsWith('.mjs') === true
			&& path.endsWith('/BASE.mjs') == false
			&& path.endsWith('/ENVIRONMENT.mjs') === false
		) {

			return true;

		}

		return false;

	}).map((path) => {
		let id = 'stealth/' + path.substr((root + '/stealth/source/').length);
		return id.substr(0, id.length - 4);
	});

	if (implementations.length > 0) {

		implementations.forEach((id) => {

			let review = REVIEWS.find((r) => r.id === id) || null;
			if (review === null) {

				reviews.push({
					id:     id,
					before: null,
					tests:  [],
					after:  null,
					state:  'none'
				});

			}

		});

	}

	REVIEWS.forEach((review) => {

		let errors = lint(review);
		if (errors.length > 0) {

			if (reviews.includes(review) === false) {
				reviews.push(review);
			}

		}

	});


	if (reviews.length > 0) {

		let none = reviews.find((review) => review.state === 'none') || null;
		if (none !== null) {

			console.error('');
			console.error('Covert: Some implementations have no reviews.');
			console.error('');

		} else {

			console.warn('');
			console.warn('Covert: Some reviews are incomplete.');
			console.warn('');

		}


		reviews.sort((a, b) => {
			if (a.id < b.id) return -1;
			if (b.id < a.id) return  1;
			return 0;
		}).forEach((review) => {

			console.log('');

			if (
				review.before === null
				&& review.tests.length === 0
				&& review.after === null
			) {

				console.error(review.id);
				console.error('> No Review found.');

			} else {

				let errors = lint(review);
				if (errors.length > 0) {

					console.warn(review.id);

					errors.forEach((error) => {
						console.warn('> ' + error);
					});

				}

			}

		});

		process.exit(1);

	} else {

		console.info('Covert: Stealth is reviewed correctly.');
		process.exit(0);

	}

} else if (action === 'watch') {

	console.log('');
	console.info('Covert: Watch Mode');
	console.log('');


	let covert = new Covert({
		action:   action         || null,
		debug:    flags.debug    || false,
		internet: flags.internet || null,
		network:  flags.network  || null,
		patterns: patterns       || [],
		reviews:  REVIEWS
	});

	process.on('SIGINT', () => {

		setTimeout(() => {
			on_complete(covert);
		}, 1000);

	});

	process.on('SIGQUIT', () => {

		setTimeout(() => {
			on_complete(covert);
		}, 1000);

	});

	process.on('SIGABRT', () => {

		setTimeout(() => {
			on_complete(covert);
		}, 1000);

	});

	process.on('SIGTERM', () => {

		setTimeout(() => {
			on_complete(covert);
		}, 1000);

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

	if (patterns.length > 0 && covert.reviews.length === 0) {

		console.warn('Covert: No Review(s) matching the patterns "' + patterns.join('" or "') + '" found.');
		process.exit(2);

	} else {
		covert.connect();
	}

} else if (action === 'scan' || action === 'time') {

	console.log('');
	console.info('Covert: ' + action[0].toUpperCase() + action.substr(1) + ' Mode');
	console.log('');


	let covert = new Covert({
		action:   action         || null,
		debug:    flags.debug    || false,
		internet: flags.internet || null,
		network:  flags.network  || null,
		patterns: patterns       || [],
		reviews:  REVIEWS
	});

	covert.on('disconnect', () => {
		on_complete(covert);
	});

	if (patterns.length > 0 && covert.reviews.length === 0) {

		console.warn('Covert: No Review(s) matching the patterns "' + patterns.join('" or "') + '" found.');
		process.exit(2);

	} else {
		covert.connect();
	}

} else {

	show_help();
	process.exit(1);

}

