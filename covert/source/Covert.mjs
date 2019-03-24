
import { isFunction, isObject } from './POLYFILLS.mjs';

import { console } from './console.mjs';


const TIMEOUT = 30 * 1000;

const isModule = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Module]';
};

const assert = function(timeline, results, result) {

	result = typeof result === 'boolean' ? result : false;


	timeline.time();
	results.assert(result);

};

const debug = function(data) {

	console.error(data);
	process.exit(1);

};

const map_to_data = function(review, type) {

	type = typeof type === 'string' ? type : 'results';


	let before = [];
	let tests  = [];
	let after  = [];


	if (type === 'results' || type === 'timeline') {

		if (review.before !== null) {
			before = Array.from(review.before[type].data);
		}

		if (review.after !== null) {
			after = Array.from(review.after[type].data);
		}

		if (review.tests.length > 0) {
			tests = review.tests.map((test) => Array.from(test[type].data));
		}

	}


	return {
		before: before,
		tests:  tests,
		after:  after
	};

};

const map_to_state = function(review) {

	let state = {
		id:    review.id    || null,
		scope: review.scope || {},
		test:  null,
		tests: []
	};


	if (review.before !== null) {
		state.tests.push(review.before);
	}

	if (review.tests.length > 0) {
		review.tests.forEach((test) => state.tests.push(test));
	}

	if (review.after !== null) {
		state.tests.push(review.after);
	}

	state.test = state.tests[0] || null;


	return state;

};

const render = function(data) {

	console.clear();


	let blank = '';

	data.states.forEach((state) => {

		state.tests.forEach((test) => {

			if (test.name.length > blank.length) {
				blank = new Array(test.name.length).fill(' ').join('');
			}

		});

	});


	data.states.forEach((state, s) => {

		if (s > 0) console.log('');


		let status = 'unknown';

		if (data.state === state) {
			console.warn('review/' + state.id + '.mjs:');
		} else {
			console.log('review/' + state.id + '.mjs:');
		}


		let all_ok = true;

		state.tests.forEach((test) => {

			let indent  = blank.substr(0, blank.length - test.name.length);
			let message = '> ' + test.name + ' ' + indent + test.results.render();


			if (data.state === state && data.state.test === test) {

				console.warn(message);

			} else {

				let fails = test.results.data.includes(false);
				let nulls = test.results.data.includes(null);

				if (fails === true) {
					all_ok = false;
					status = 'fail';
					console.error(message);
				} else if (nulls === false) {
					console.info(message);
				} else if (nulls === true && test.results.index > 0) {
					all_ok = false;
					status = 'fail';
					console.warn(message);
				} else {
					all_ok = false;
					console.log(message);
				}

			}

		});

		if (all_ok === true) {
			status = 'okay';
		}


		if (data.state === state) {
			console.warn('running ...');
		} else if (status === 'okay') {
			console.info('okay.');
		} else if (status === 'fail') {
			console.error('fail!');
		} else {
			console.log('unknown?');
		}

	});

};

const update = function(data) {

	let state = data.state || null;
	if (state !== null && state.test !== null) {

		let test = state.test;
		if (test.timeline.start === null) {

			test.timeline.time(true);

			try {

				test.callback.call(
					state.scope,
					assert.bind(state.scope, test.timeline, test.results),
					debug.bind(state.scope)
				);

			} catch (err) {

				let next = state.tests[state.tests.indexOf(state.test) + 1] || null;
				if (next !== null) {
					state.test = next;
				} else {
					state.test = null;
				}

			}

		} else {

			let complete = test.results.complete();
			let progress = test.timeline.progress();

			if (complete === true) {

				let next = state.tests[state.tests.indexOf(state.test) + 1] || null;
				if (next !== null) {
					state.test = next;
				} else {
					state.test = null;
				}

			} else if (progress > TIMEOUT) {

				let next = state.tests[state.tests.indexOf(state.test) + 1] || null;
				if (next !== null) {
					state.test = next;
				} else {
					state.test = null;
				}

			}

		}


		return true;

	} else if (state !== null && state.test === null) {

		let next = data.states[data.states.indexOf(state) + 1] || null;
		if (next !== null) {
			data.state = next;
		} else {
			data.state = null;
		}


		return true;

	}


	return false;

};



export const Covert = function() {

	this.callback = null;
	this.interval = null;
	this.reviews  = [];

};


Covert.prototype = {

	connect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.interval === null && callback !== null) {

			this.callback = callback;


			let data = {
				state:  null,
				states: this.reviews.map((review) => map_to_state(review))
			};

			data.state = data.states[0] || null;


			this.interval = setInterval(() => {

				let busy = update.call(this, data);
				if (busy === false) {

					clearInterval(this.interval);
					this.interval = null;

					this.callback(
						this.reviews.map((review) => map_to_data(review, 'results')),
						this.reviews.map((review) => map_to_data(review, 'timeline'))
					);

				} else {
					render.call(this, data);
				}

			}, 100);


			return true;

		} else {
			return false;
		}

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

			this.reviews.push(review);

			return true;

		}


		return false;

	}

};

