
import { console, isArray, isBoolean, isString } from '../extern/base.mjs';
import { isReview                              } from './Review.mjs';



const indent = (data) => {

	let dummy = '';

	if (isArray(data)) {

		data.forEach((value) => {

			if (value.length > dummy.length) {
				dummy = new Array(value.length).fill(' ').join('');
			}

		});

	}

	return function(str) {

		if (isString(str)) {
			return dummy.substr(0, dummy.length - str.length);
		}

		return '';

	};

};

const render_complete = function(review, is_current) {

	is_current = isBoolean(is_current) ? is_current : false;


	if (review.state === null) {

		if (is_current === true) {
			console.blink(review.id);
		} else {
			console.log(review.id);
		}

	} else if (review.state === 'okay') {
		console.info(review.id);
	} else if (review.state === 'wait') {
		console.warn(review.id);
	} else if (review.state === 'fail') {
		console.error(review.id);
	}


	let action  = this._settings.action || null;
	let tests   = review.flatten();
	let current = tests.find((test) => test.state === null) || null;
	let div1    = indent(tests.map((test) => test.name));
	let div2    = indent(tests.map((test) => test.results.render()));

	tests.forEach((test) => {

		let message = '>';

		message += ' ' + test.name;
		message += ' ' + div1(test.name);

		if (action === 'scan') {

			message += test.results.render();

		} else if (action === 'time') {

			message += test.timeline.render();

		} else if (action === 'watch') {

			let str1 = test.results.render();
			let str2 = test.timeline.render();

			message += str1;
			message += div2(str1);
			message += str2;

		}

		if (
			is_current === true
			&& (test === current || test.state === null)
		) {
			console.blink(message);
		} else if (test.state === null) {
			console.log(message);
		} else if (test.state === 'okay') {
			console.info(message);
		} else if (test.state === 'wait') {
			console.warn(message);
		} else if (test.state === 'fail') {
			console.error(message);
		}

		let errors = review.errors.filter((msg) => msg.startsWith(test.name));
		if (errors.length > 0) {
			errors.forEach((error) => {
				error.split('\n').forEach((line) => {
					console.error('> ' + line);
				});
			});
		}

	});

	if (review.state === null) {

		if (is_current === true) {
			console.blink('running ...');
		} else {
			console.log('what?');
		}

	} else if (review.state === 'okay') {
		console.info('okay.');
	} else if (review.state === 'wait') {
		console.warn('wait ...');
	} else if (review.state === 'fail') {
		console.error('fail!');
	}

};

const render_errors = function(review, is_current) {

	is_current = isBoolean(is_current) ? is_current : false;


	if (review.state === null) {

		if (is_current === true) {
			console.blink(review.id);
		} else {
			console.log(review.id);
		}

	} else if (review.state === 'okay') {
		console.info(review.id);
	} else if (review.state === 'wait') {
		console.warn(review.id);
	} else if (review.state === 'fail') {
		console.error(review.id);
	} else if (review.state === 'none') {
		console.warn(review.id);
	}

	review.errors.forEach((error) => {

		let message = '>';

		message += ' ' + error;

		if (review.state === null) {

			if (is_current === true) {
				console.blink(message);
			} else {
				console.log(message);
			}

		} else if (review.state === 'okay') {
			console.info(message);
		} else if (review.state === 'wait') {
			console.warn(message);
		} else if (review.state === 'fail') {
			console.error(message);
		} else if (review.state === 'none') {
			console.warn(message);
		}

	});

};

const render_partial = function(reviews, prev_state, curr_state) {

	let candidates         = [];
	let unrendered_reviews = [];
	let unrendered_tests   = [];

	if (prev_state.review === null && curr_state.review !== null) {

		let index1 = 0;
		let index2 = reviews.indexOf(curr_state.review);

		if (index1 !== -1 && index2 !== -1) {
			candidates = reviews.slice(index1, index2 + 1);
		}

	} else if (prev_state.review !== null && curr_state.review !== null) {

		let index1 = reviews.indexOf(prev_state.review);
		let index2 = reviews.indexOf(curr_state.review);
		if (index1 !== -1 && index2 !== -1) {
			candidates = reviews.slice(index1, index2 + 1);
		}

	}


	if (candidates.length > 0) {

		candidates.forEach((review) => {

			let tests  = review.flatten();
			let index1 = -1;
			let index2 = -1;

			if (prev_state.test !== null) {

				let check = tests.indexOf(prev_state.test);
				if (check !== -1) {
					index1 = tests.indexOf(prev_state.test);
				} else {
					index1 = 0;
				}

			} else {
				index1 = 0;
			}

			if (curr_state.test !== null) {

				let check = tests.indexOf(curr_state.test);
				if (check !== -1) {
					index2 = check + 1;
				} else {
					index2 = tests.length;
				}

			} else {

				let current = tests.find((test) => test.state === null) || null;
				if (current !== null) {
					index2 = tests.indexOf(current) + 1;
				} else {
					index2 = tests.length;
				}

			}


			if (index1 !== -1 && index2 !== -1) {

				tests.slice(index1, index2).forEach((test) => {
					unrendered_reviews.push(review);
					unrendered_tests.push(test);
				});

			}

		});

	}


	if (unrendered_reviews.length > 0 && unrendered_tests.length > 0) {

		let action      = this._settings.action || null;
		let last_review = prev_state.review    || null;
		let last_test   = prev_state.test      || null;
		let last_result = prev_state.result    || null;

		unrendered_tests.forEach((test, t) => {

			let review = unrendered_reviews[t] || null;
			if (review !== last_review) {

				if (review.state === null) {
					console.log(review.id);
				} else if (review.state === 'okay') {
					console.info(review.id);
				} else if (review.state === 'wait') {
					console.warn(review.id);
				} else if (review.state === 'fail') {
					console.error(review.id);
				}

				last_review = review;

			}

			let result = test.results.current();

			if (
				test !== last_test
				|| (test === last_test && result !== last_result)
			) {

				let message = '>';

				message += ' ' + test.name;
				message += ' ';

				if (action === 'scan') {

					message += test.results.render();

				} else if (action === 'time') {

					message += test.timeline.render();

				} else if (action === 'watch') {

					let str1 = test.results.render();
					let str2 = test.timeline.render();

					message += str1;
					message += ' ';
					message += str2;

				}

				if (test.state === null) {
					console.log(message);
				} else if (test.state === 'okay') {
					console.info(message);
				} else if (test.state === 'wait') {
					console.warn(message);
				} else if (test.state === 'fail') {
					console.error(message);
				}

			}

		});


		prev_state.review = curr_state.review;
		prev_state.test   = curr_state.test;
		prev_state.result = curr_state.test.results.current();

	}

};

const render_summary = function(review, is_current) {

	is_current = isBoolean(is_current) ? is_current : false;


	if (review.state === 'okay') {

		console.info(review.id + ': okay.');

	} else if (
		review.state === null
		|| review.state === 'wait'
		|| review.state === 'fail'
	) {

		if (review.state === null) {

			if (is_current === true) {
				console.blink(review.id);
			} else {
				console.log(review.id);
			}

		} else if (review.state === 'wait') {
			console.warn(review.id);
		} else if (review.state === 'fail') {
			console.error(review.id);
		}


		let action  = this._settings.action || null;
		let tests   = review.flatten().filter((test) => test.state !== 'okay');
		let current = tests.find((test) => test.state === null) || null;
		let div1    = indent(tests.map((test) => test.name));
		let div2    = indent(tests.map((test) => test.results.render()));

		tests.forEach((test) => {

			let message = '>';

			message += ' ' + test.name;
			message += ' ' + div1(test.name);

			if (action === 'scan') {

				message += test.results.render();

			} else if (action === 'time') {

				message += test.timeline.render();

			} else if (action === 'watch') {

				let str1 = test.results.render();
				let str2 = test.timeline.render();

				message += str1;
				message += div2(str1);
				message += str2;

			}

			if (
				is_current === true
				&& (test === current || test.state === null)
			) {
				console.blink(message);
			} else if (test.state === null) {
				console.log(message);
			} else if (test.state === 'wait') {
				console.warn(message);
			} else if (test.state === 'fail') {
				console.error(message);
			}

			let errors = review.errors.filter((msg) => msg.startsWith(test.name));
			if (errors.length > 0) {
				errors.forEach((error) => {
					error.split('\n').forEach((line) => {
						console.error('> ' + line);
					});
				});
			}

			test.results.stack.forEach((entry, e) => {

				if (entry.diff !== null) {

					console.log('');

					if (entry.assert !== null) {
						console.error('> ' + test.name + div1(test.name) + ' ' + entry.assert + ' differs ...');
						console.diff(entry.diff[0], entry.diff[1]);
					} else {
						console.error('> ' + test.name + div1(test.name) + ' assert() #' + e + ' differs ...');
						console.diff(entry.diff[0], entry.diff[1]);
					}

				}

			});

		});

		if (review.state === null) {

			if (is_current === true) {
				console.blink('running ...');
			} else {
				console.log('what?');
			}

		} else if (review.state === 'wait') {
			console.warn('wait ...');
		} else if (review.state === 'fail') {
			console.error('fail!');
		}

	}

};



const Renderer = function(settings) {

	this._settings = Object.freeze(Object.assign({
		action: null,  // 'scan', 'time' or 'watch'
		debug:  false
	}, settings));

	this.__state = {
		review: null,
		test:   null,
		result: null
	};

};


Renderer.prototype = {

	[Symbol.toStringTag]: 'Renderer',

	render: function(data, mode) {

		mode = isString(mode) ? mode : 'complete';


		if (isArray(data) === true) {

			let reviews = data;
			let state   = {
				review: this.__state.review,
				test:   this.__state.test,
				result: this.__state.result
			};

			if (reviews.length > 0) {

				let tmp = reviews.find((review) => review.state === null) || null;
				if (tmp !== null) {
					state.review = tmp;
				}

			}

			if (state.review !== null) {

				let tmp = state.review.flatten().find((test) => test.state === null) || null;
				if (tmp !== null) {
					state.test = tmp;
				}

			}


			if (this._settings.debug === true) {

				render_partial.call(this, reviews, this.__state, state);

			} else {

				console.clear();


				if (reviews.length === 1) {

					render_complete.call(this, reviews[0], state.review === reviews[0]);

				} else {

					let last_state = null;

					reviews.forEach((review, r) => {

						if (r > 0) {

							if (review.state === null && last_state === null) {
								console.log('');
							} else if (review.state !== last_state) {
								console.log('');
							}

						}


						if (mode === 'complete') {

							if (state.review === review) {
								render_complete.call(this, review, true);
							} else {
								render_summary.call(this, review);
							}

						} else if (mode === 'errors') {

							render_errors.call(this, review);

						} else if (mode === 'summary') {

							render_summary.call(this, review);

						}

						last_state = review.state;

					});

				}

			}

		} else if (isReview(data) === true) {

			if (mode === 'complete') {
				render_complete.call(this, data);
			} else if (mode === 'errors') {
				render_errors.call(this, data);
			} else if (mode === 'summary') {
				render_summary.call(this, data);
			}

		}

	}

};


export { Renderer };

