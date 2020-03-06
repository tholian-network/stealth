
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

const debug = function(data) {

	console.error(data);
	process.exit(1);

};

const map_to_result = function(review) {

	let result = {
		id:    review.id || null,
		state: 'okay',
		tests: []
	};


	if (review.before !== null) {

		result.tests.push({
			name:     review.before.name,
			results:  review.before.results,
			timeline: review.before.timeline
		});

		if (review.before.results.includes(null)) {
			result.state = 'wait';
		} else if (review.before.results.includes(false)) {
			result.state = 'fail';
		}

	}

	if (review.tests.length > 0) {

		review.tests.forEach((test) => {

			result.tests.push({
				name:     test.name,
				results:  test.results,
				timeline: test.timeline
			});

			if (test.results.includes(null)) {
				result.state = 'wait';
			} else if (test.results.includes(false)) {
				result.state = 'fail';
			}

		});

	}

	if (review.after !== null) {

		result.tests.push({
			name:     review.after.name,
			results:  review.after.results,
			timeline: review.after.timeline
		});

		if (review.after.results.includes(null)) {
			result.state = 'wait';
		} else if (review.after.results.includes(false)) {
			result.state = 'fail';
		}

	}


	return result;

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



export const Covert = function(settings) {

	this.settings = Object.assign({}, settings);
	this.callback = null;
	this.interval = null;
	this.network  = new Network(this.settings);
	this.renderer = new Renderer(this.settings);
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

					this.network.disconnect();
					this.callback(this.reviews.map((review) => map_to_result(review)));

				} else {
					this.renderer.render(data);
				}

			}, 100);

			this.network.connect();


			return true;

		} else {
			return false;
		}

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

			this.reviews.push(review);

			return true;

		}


		return false;

	}

};

