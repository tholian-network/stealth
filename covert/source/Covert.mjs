
import process from 'process';

import { console, isBoolean, isObject, isString } from '../../stealth/source/BASE.mjs';
import { Emitter                                } from '../../stealth/source/Emitter.mjs';
import { root                                   } from './ENVIRONMENT.mjs';
import { Filesystem                             } from './Filesystem.mjs';
import { Network                                } from './Network.mjs';
import { Renderer                               } from './Renderer.mjs';



const isModule = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Module]';
};

const assert = function(timeline, results, result, expect) {

	result = result !== undefined ? result : undefined;
	expect = expect !== undefined ? expect : undefined;

	timeline.time();
	results.assert(result, expect);

};

const rebind_console_method = function(method, prefix) {

	return function() {

		let al   = arguments.length;
		let args = [ prefix ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		if (typeof console[method] === 'function') {
			console[method].apply(console, args);
		}

		if (method === 'debug') {
			process.exit(1);
		}

	};

};

const console_sandbox = function(id) {

	let prefix = '  ' + (new Array(id.length)).fill(' ').join('') + ' |>';

	return {

		clear: () => {}, // No clear() allowed

		blink: rebind_console_method('blink', prefix),
		debug: rebind_console_method('debug', prefix),
		error: rebind_console_method('error', prefix),
		info:  rebind_console_method('info',  prefix),
		log:   rebind_console_method('log',   prefix),
		warn:  rebind_console_method('warn',  prefix),

	};

};

const flatten_tests = (review) => {

	let array = [];

	if (review.before !== null) {
		array.push(review.before);
	}

	if (review.tests.length > 0) {
		review.tests.forEach((test) => {
			array.push(test);
		});
	}

	if (review.after !== null) {
		array.push(review.after);
	}

	return array;

};

const init = function(settings) {

	let action   = isString(settings.action)    ? settings.action   : null;
	let internet = isBoolean(settings.internet) ? settings.internet : false;
	let include  = settings.reviews.map(() => false);
	let filtered = false;

	settings.patterns.forEach((pattern) => {

		filtered = true;


		if (pattern.startsWith('*')) {

			settings.reviews.forEach((review, r) => {

				if (review.id.endsWith(pattern.substr(1))) {
					include[r] = true;
				}

			});

		} else if (pattern.endsWith('*')) {

			settings.reviews.forEach((review, r) => {

				if (review.id.startsWith(pattern.substr(0, pattern.length - 1))) {
					include[r] = true;
				}

			});

		} else if (pattern.includes('*')) {

			let prefix = pattern.split('*').shift();
			let suffix = pattern.split('*').pop();

			settings.reviews.forEach((review, r) => {

				if (review.id.startsWith(prefix) && review.id.endsWith(suffix)) {
					include[r] = true;
				}

			});

		} else {

			settings.reviews.forEach((review, r) => {

				if (review.id === pattern) {
					include[r] = true;
				}

			});

		}

	});


	// --internet defaulted with true
	if (internet === false) {

		settings.reviews.forEach((review, r) => {

			if (review.flags.internet === true) {
				include[r] = false;
			}

		});

	}


	if (filtered === true) {

		let reviews = include.map((inc, i) => (inc === true ? settings.reviews[i] : null)).filter((r) => r !== null);
		if (reviews.length > 0) {

			if (action === 'scan') {

				reviews.forEach((review) => {
					this.scan(review);
				});

			} else if (action === 'time') {

				reviews.forEach((review) => {
					this.scan(review);
				});

			} else if (action === 'watch') {

				reviews.forEach((review) => {
					this.scan(review);
					this.watch(review);
				});

			}

		}

	}

};

const next_review = function(reviews, review) {

	let next = null;

	if (review !== null) {

		let undone = reviews.filter((review) => review.state === null);
		if (undone.length > 0) {

			let temp = undone[undone.indexOf(review) + 1] || null;
			if (temp !== null) {
				next = temp;
			}

		}

	} else {

		let undone = reviews.filter((review) => review.state === null);
		if (undone.length > 0) {
			next = undone[0];
		}

	}

	return next;

};

const next_test = function(review, test) {

	let next = null;

	if (test !== null) {

		if (review.before === test) {

			if (review.tests.length > 0) {
				next = review.tests[0];
			} else {
				next = review.after || null;
			}

		} else if (review.tests.includes(test)) {

			let temp = review.tests[review.tests.indexOf(test) + 1] || null;
			if (temp !== null) {
				next = temp;
			} else {
				next = review.after || null;
			}

		} else if (review.after === test) {

			next = null;

		}

	} else {

		if (next === null && review.before !== null) {
			next = review.before;
		}

		if (next === null && review.tests.length > 0) {
			next = review.tests[0];
		}

		if (next === null && review.after !== null) {
			next = review.after;
		}

	}

	return next;

};

const next = function() {

	let review = this.__state.review || null;
	let test   = this.__state.test   || null;

	if (review !== null && test !== null) {
		update_test(test);
	}

	if (review !== null) {

		if (test !== null) {

			let next = next_test(review, test);
			if (next !== null) {

				update_review(this.__state.review);
				this.__state.test = next;

			} else {

				let next = next_review(this.reviews, this.__state.review);
				if (next !== null) {

					update_review(this.__state.review);

					this.__state.review = next;
					this.__state.test   = next_test(next, null);

				} else {

					update_review(this.__state.review);

					this.__state.review = null;
					this.__state.test   = null;

				}

			}

		} else {

			let next = next_review(this.reviews, this.__state.review);
			if (next !== null) {

				update_review(this.__state.review);

				this.__state.review = next;
				this.__state.test   = next_test(next, null);

			} else {

				update_review(this.__state.review);

				this.__state.review = null;
				this.__state.test   = null;

			}

		}

	} else {

		this.__state.review = null;
		this.__state.test   = null;

	}

};

const update = function() {

	let review = this.__state.review || null;
	let test   = this.__state.test   || null;

	if (review !== null && test !== null) {

		if (test.timeline.start === null) {

			test.timeline.time();

			try {

				test.callback.call(
					review.scope,
					assert.bind(review.scope, test.timeline, test.results),
					console_sandbox(test.name)
				);

			} catch (err) {

				if (this._settings.debug === true) {
					console.error(err);
				}

				next.call(this);

			}

		} else {

			let complete = test.results.complete();
			let progress = test.timeline.progress();

			if (complete === true) {
				next.call(this);
			} else if (progress > this._settings.timeout) {

				test.state = 'wait';
				next.call(this);

			}

		}


		return true;

	} else if (review !== null && test === null) {

		next.call(this);

		return true;

	}


	return false;

};

const update_review = function(review) {

	let tests = flatten_tests(review);
	if (tests.length > 0) {

		let check = tests.filter((test) => test.state !== null);
		if (check.length === tests.length) {

			let state = 'okay';

			tests.forEach((test) => {

				if (test.results.includes(false)) {
					state = 'fail';
				} else if (test.results.includes(null)) {
					state = 'wait';
				}

			});

			review.state = state;


			return true;

		}

	}


	return false;

};

const update_test = function(test) {

	let is_complete = test.results.complete();
	if (is_complete === true) {

		if (test.results.includes(false)) {
			test.state = 'fail';
		} else if (test.results.includes(null)) {
			test.state = 'wait';
		} else {
			test.state = 'okay';
		}

	}

};

const prettify = (object) => {

	let result = {};

	Object.keys(object).filter((key) => key !== 'reviews').forEach((key) => {
		result[key] = object[key];
	});

	return result;

};


const Covert = function(settings) {

	this._settings = Object.freeze(Object.assign({
		action:   null, // 'scan', 'time' or 'watch'
		internet: true,
		patterns: [],
		reviews:  [],
		root:     root,
		timeout:  10 * 1000
	}, settings));


	console.log('Covert: Command-Line Arguments:');
	console.log(prettify(this._settings));


	this.interval   = null;
	this.filesystem = new Filesystem(this._settings);
	this.network    = new Network(this._settings);
	this.renderer   = new Renderer(this._settings);
	this.reviews    = [];

	this.__state = {
		connected: false,
		review:    null,
		test:      null,
		watch:     {}
	};


	Emitter.call(this);


	this.on('connect', (reviews) => {

		let interval = this.interval;
		if (interval === null) {

			this.interval = setInterval(() => {

				let is_busy = update.call(this);
				if (is_busy === false) {

					clearInterval(this.interval);
					this.interval = null;

					this.emit('disconnect', [ this.reviews ]);

				} else {
					this.emit('render', [ this.reviews ]);
				}

			}, 100);

		}

		if (this.__state.connected === false) {

			this.renderer.render(reviews, 'complete');

			this.filesystem.connect();
			this.network.connect();

			this.__state.connected = true;

		}

	});

	this.on('render', (reviews) => {

		this.renderer.render(reviews, 'complete');

	});

	this.on('disconnect', (reviews) => {

		let interval = this.interval;
		if (interval !== null) {

			clearInterval(interval);
			this.interval = null;

		}

		let review = this.__state.review || null;
		if (review !== null) {

			if (review.tests.length > 0) {
				review.tests.forEach((test) => {

					if (test.state === null) {
						test.state = 'wait';
					}

				});
			}

			let test = review.after || null;
			if (test.state === null && test.timeline.start === null) {

				test.timeline.time();

				try {

					test.callback.call(
						review.scope,
						assert.bind(review.scope, test.timeline, test.results),
						console_sandbox(test.name)
					);

				} catch (err) {

					if (this._settings.debug === true) {
						console.error(err);
					}

					review.after.state = 'wait';

				}

			}

		}


		this.renderer.render(reviews, 'complete');

		if (this.__state.connected === true) {

			if (this._settings.action === 'watch') {
				// Do nothing
			} else {

				this.network.disconnect();
				this.filesystem.disconnect();

				this.__state.connected = false;

			}

		}

	});

	this.filesystem.on('change', (source) => {

		let review = this.__state.watch[source] || null;
		if (review !== null) {
			this.emit('change', [ this.reviews, review ]);
		}

	});


	process.on('SIGHUP', () => {
		this.disconnect();
	});

	process.on('SIGINT', () => {
		this.disconnect();
	});

	process.on('SIGQUIT', () => {
		this.disconnect();
	});

	process.on('SIGABRT', () => {
		this.disconnect();
	});

	process.on('SIGTERM', () => {
		this.disconnect();
	});

	process.on('error', () => {
		this.disconnect();
	});


	init.call(this, this._settings);

};


Covert.prototype = Object.assign({}, Emitter.prototype, {

	connect: function() {

		let review = this.reviews[0] || null;
		let test   = null;

		if (review !== null) {

			if (review.before !== null) {
				test = review.before;
			} else if (review.tests.length > 0) {
				test = review.tests[0];
			} else if (review.after !== null) {
				test = review.after;
			}

		}


		if (review !== null && test !== null) {

			this.__state.review = review;
			this.__state.test   = test;

			this.emit('connect', [ this.reviews ]);

			return true;

		}


		return false;

	},

	disconnect: function() {

		this.emit('disconnect', [ this.reviews ]);

		return true;

	},

	scan: function(review) {

		// Allow import * syntax
		if (isModule(review)) {

			if ('default' in review) {
				review = review['default'] || null;
			}

		}


		review = isObject(review) ? review : null;


		if (review !== null) {

			if (
				review.before !== null
				|| review.tests.length > 0
				|| review.after !== null
			) {

				if (this.reviews.includes(review) === false) {
					this.reviews.push(review);
				}

				return true;

			}

		}


		return false;

	},

	watch: function(review) {

		// Allow import * syntax
		if (isModule(review)) {

			if ('default' in review) {
				review = review['default'] || null;
			}

		}


		review = isObject(review) ? review : null;


		if (review !== null) {

			let name   = review.id.split('/').shift();
			let id     = review.id.split('/').slice(1).join('/');
			let source = this._settings.root + '/' + name + '/source/' + id + '.mjs';

			if (this.filesystem.exists(source) === true) {

				let result = this.filesystem.watch(source);
				if (result === true) {

					this.__state.watch[source] = review;

					return true;

				}

			}

		}


		return false;

	}

});


export { Covert };

