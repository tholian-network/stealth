
import process from 'process';

import { console, Emitter, isBoolean, isNumber, isString } from '../extern/base.mjs';
import { root                                            } from './ENVIRONMENT.mjs';
import { Filesystem                                      } from './Filesystem.mjs';
import { Network                                         } from './Network.mjs';
import { Renderer                                        } from './Renderer.mjs';
import { isReview                                        } from './Review.mjs';



export const isCovert = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Covert]';
};

const isError = function(obj) {
	return Object.prototype.toString.call(obj).includes('Error');
};

const isModule = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Module]';
};

const toMessage = function(data) {

	if (isError(data) === true) {

		let type = Object.prototype.toString.call(data);
		if (type.startsWith('[object') && type.endsWith(']')) {
			type = type.substr(7, type.length - 8).trim();
		}

		let msg    = (data.message || '').trim();
		let result = '';
		let stack  = (data.stack   || '').trim().split('\n');

		if (msg.length > 0 && stack.length > 0) {

			let origin = null;

			for (let s = 0, sl = stack.length; s < sl; s++) {

				let line = stack[s].trim();
				if (line.includes('(file://') && line.includes(')')) {

					let tmp = line.split('(file://')[1].split(')').shift().trim();
					if (tmp.includes('.mjs')) {
						origin = tmp;
						break;
					}

				}

			}

			result += type + ': "' + msg + '"';

			if (origin !== null) {
				result += '\n';
				result += origin;
			}

		} else if (msg.length > 0) {

			result += type + ': "' + msg + '"';

		}

		return result;

	}


	return null;

};

const assert = function(timeline, results, result, expect) {

	result = result !== undefined ? result : undefined;
	expect = expect !== undefined ? expect : undefined;

	timeline.time();
	results.assert(result, expect);

};

const rebind_console_method = function(method) {

	return function() {

		let al   = arguments.length;
		let args = [];
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

const console_sandbox = function() {

	return {

		clear: () => {}, // No clear() allowed

		blink: rebind_console_method('blink'),
		debug: rebind_console_method('debug'),
		error: rebind_console_method('error'),
		info:  rebind_console_method('info'),
		log:   rebind_console_method('log'),
		warn:  rebind_console_method('warn')

	};

};

const init = function(settings) {

	let action   = isString(settings.action)    ? settings.action   : null;
	let internet = isBoolean(settings.internet) ? settings.internet : false;
	let timeout  = isString(settings.timeout)   ? settings.timeout  : null;
	let include  = {};
	let filtered = false;

	settings.reviews.map((review) => {
		include[review.id] = false;
	});

	settings.patterns.forEach((pattern) => {

		filtered = true;


		if (pattern.startsWith('*')) {

			settings.reviews.forEach((review) => {

				if (review.id.endsWith(pattern.substr(1))) {
					include[review.id] = true;
				}

			});

		} else if (pattern.endsWith('*')) {

			settings.reviews.forEach((review) => {

				if (review.id.startsWith(pattern.substr(0, pattern.length - 1))) {
					include[review.id] = true;
				}

			});

		} else if (pattern.includes('*')) {

			let prefix = pattern.split('*').shift();
			let suffix = pattern.split('*').pop();

			settings.reviews.forEach((review) => {

				if (review.id.startsWith(prefix) && review.id.endsWith(suffix)) {
					include[review.id] = true;
				}

			});

		} else {

			settings.reviews.forEach((review) => {

				if (review.id === pattern) {
					include[review.id] = true;
				}

			});

		}

	});


	// --internet defaulted with true
	if (internet === false) {

		settings.reviews.forEach((review) => {

			if (review.flags.internet === true) {
				include[review.id] = false;
			}

		});

	}


	if (filtered === true) {

		let reviews = [];

		settings.reviews.forEach((review) => {

			if (include[review.id] === true) {
				reviews.push(review);
			}

		});

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

	} else {

		let reviews = settings.reviews;
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


	if (timeout !== null && timeout.endsWith('s')) {

		let num = parseInt(timeout.substr(0, timeout.length - 1), 10);
		if (isNumber(num) === true && Number.isNaN(num) === false) {
			this.__state.timeout = num * 1000;
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

		if (review.before.includes(test)) {

			let temp = review.before[review.before.indexOf(test) + 1] || null;
			if (temp !== null) {
				next = temp;
			} else if (review.tests.length > 0) {
				next = review.tests[0];
			} else if (review.after.length > 0) {
				next = review.after[0];
			} else {
				next = null;
			}

		} else if (review.tests.includes(test)) {

			let temp = review.tests[review.tests.indexOf(test) + 1] || null;
			if (temp !== null) {
				next = temp;
			} else if (review.after.length > 0) {
				next = review.after[0];
			} else {
				next = null;
			}

		} else if (review.after.includes(test)) {

			let temp = review.after[review.after.indexOf(test) + 1] || null;
			if (temp !== null) {
				next = temp;
			} else {
				next = null;
			}

		}

	} else {

		if (next === null && review.before.length > 0) {
			next = review.before[0];
		}

		if (next === null && review.tests.length > 0) {
			next = review.tests[0];
		}

		if (next === null && review.after.length > 0) {
			next = review.after[0];
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
					console_sandbox()
				);

			} catch (err) {

				if (this._settings.debug === true) {
					console.error(err);
				}

				if (isError(err) === true) {

					let message = toMessage(err);
					if (message !== null) {
						review.errors.push(test.name + ' throws ' + message);
					}

				}

				next.call(this);

			}

		} else {

			let complete = test.results.complete();
			let progress = test.timeline.progress();

			if (complete === true) {

				next.call(this);

			} else if (progress > this.__state.timeout) {

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

	let errors = review.errors;
	let tests  = review.flatten();

	if (errors.length > 0) {

		review.state = 'fail';

		return true;

	} else if (tests.length > 0) {

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

		return true;

	}


	return false;

};

const prettify_settings = (object) => {

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
		timeout:  null
	}, settings));


	console.log('Covert: Command-Line Arguments:');
	console.log(prettify_settings(this._settings));


	this.interval   = null;
	this.filesystem = new Filesystem(this._settings);
	this.network    = new Network(this._settings);
	this.renderer   = new Renderer(this._settings);
	this.reviews    = [];

	this.__state = {
		connected: false,
		review:    null,
		test:      null,
		timeout:   10 * 1000,
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
						console_sandbox()
					);

				} catch (err) {

					if (this._settings.debug === true) {
						console.error(err);
					}

					if (isError(err) === true) {

						let message = toMessage(err);
						if (message !== null) {
							review.errors.push(test.name + ' throws ' + message);
						}

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


Covert.isCovert = isCovert;


Covert.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Covert',

	connect: function() {

		let review = this.reviews[0] || null;
		let test   = null;

		if (review !== null) {

			if (review.before.length > 0) {
				test = review.before[0];
			} else if (review.tests.length > 0) {
				test = review.tests[0];
			} else if (review.after.length > 0) {
				test = review.after[0];
			}

		}


		if (review !== null && test !== null) {

			console.info('');
			console.info('Covert: ' + this._settings.action + ' mode');
			console.info('');

			this.__state.review = review;
			this.__state.test   = test;

			this.emit('connect', [ this.reviews ]);

			return true;

		}


		return false;

	},

	destroy: function() {

		let fails = this.reviews.filter((r) => r.state === 'fail');
		let skips = this.reviews.filter((r) => r.state === null);
		let waits = this.reviews.filter((r) => r.state === 'wait');


		if (this._settings.debug === true) {
			console.log('');
		} else {
			console.clear();
		}


		if (fails.length > 0) {

			console.error('');
			console.error('Covert: Some Reviews failed.');
			console.error('');

			skips.forEach((review) => {
				console.log('');
				this.renderer.render(review, 'complete');
			});

			waits.forEach((review) => {
				console.log('');
				this.renderer.render(review, 'summary');
			});

			fails.forEach((review) => {
				console.log('');
				this.renderer.render(review, 'summary');
			});

			return 1;

		} else if (skips.length > 0 || waits.length > 0) {

			console.warn('');
			console.warn('Covert: Some Reviews failed.');
			console.warn('');

			skips.forEach((review) => {
				console.log('');
				this.renderer.render(review, 'complete');
			});

			waits.forEach((review) => {
				console.log('');
				this.renderer.render(review, 'summary');
			});

			return 2;

		} else {

			console.info('');
			console.info('Covert: All Reviews succeeded.');
			console.info('');

			if (this._settings.action === 'time' || this._settings.action === 'watch') {

				this.reviews.forEach((review) => {
					console.log('');
					this.renderer.render(review, 'complete');
				});

			}

			return 0;

		}

	},

	disconnect: function() {

		this.emit('disconnect', [ this.reviews ]);

		return true;

	},

	is: function(state) {

		state = isString(state) ? state : null;


		if (state === 'connected') {

			if (this.__state.connected === true) {
				return true;
			}

		}


		return false;

	},

	scan: function(review) {

		// Allow import * syntax
		if (isModule(review)) {

			if ('default' in review) {
				review = review['default'] || null;
			}

		}


		review = isReview(review) ? review : null;


		if (review !== null) {

			if (this.reviews.includes(review) === false) {
				this.reviews.push(review);
			}

			return true;

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


		review = isReview(review) ? review : null;


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

