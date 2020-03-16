
import { isFunction, isObject } from './POLYFILLS.mjs';

import { console  } from './console.mjs';
import { Network  } from './Network.mjs';
import { Renderer } from './Renderer.mjs';


const TIMEOUT = 30 * 1000;

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

	let prefix = id + ' > ';

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

			test.timeline.time(true);

			try {

				test.callback.call(
					review.scope,
					assert.bind(review.scope, test.timeline, test.results),
					console_sandbox(test.name)
				);

			} catch (err) {
				next.call(this);
			}

		} else {

			let complete = test.results.complete();
			let progress = test.timeline.progress();

			if (complete === true) {
				next.call(this);
			} else if (progress > TIMEOUT) {

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



export const Covert = function(settings) {

	this.settings = Object.assign({}, settings);
	this.interval = null;
	this.network  = new Network(this.settings);
	this.renderer = new Renderer(this.settings);
	this.reviews  = [];

	this.__state  = {
		review: null,
		test:   null
	};

};


Covert.prototype = {

	connect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.interval === null && callback !== null) {

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


				this.interval = setInterval(() => {

					let is_busy = false;

					if (this.settings.debug === true) {
						this.renderer.render(this.reviews, 'complete');
					}

					is_busy = update.call(this);

					if (this.settings.debug === false) {
						this.renderer.render(this.reviews, 'complete');
					}


					if (is_busy === false) {

						clearInterval(this.interval);
						this.interval = null;

						this.network.disconnect();

						callback.call(null, this.reviews);

					}

				}, 100);

				this.network.connect();


				return true;

			}

		}


		return false;

	},

	disconnect: function() {

		this.network.disconnect();

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

	}

};

