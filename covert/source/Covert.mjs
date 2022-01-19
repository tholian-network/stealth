
import process from 'process';

import { console, Emitter, isArray, isBoolean, isNumber, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                              } from '../source/ENVIRONMENT.mjs';
import { Filesystem                                               } from '../source/Filesystem.mjs';
import { Interceptor                                              } from '../source/Interceptor.mjs';
import { Network                                                  } from '../source/Network.mjs';
import { Renderer                                                 } from '../source/Renderer.mjs';
import { isReview                                                 } from '../source/Review.mjs';



export const isCovert = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Covert]';
};

const isError = function(obj) {
	return Object.prototype.toString.call(obj).includes('Error') === true;
};

const isModule = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Module]';
};

const toMessage = function(data) {

	if (isError(data) === true) {

		let type = Object.prototype.toString.call(data);
		if (type.startsWith('[object') === true && type.endsWith(']') === true) {
			type = type.substr(7, type.length - 8).trim();
		}

		let msg    = (data.message || '').trim();
		let result = '';
		let stack  = (data.stack   || '').trim().split('\n');

		if (msg.length > 0 && stack.length > 0) {

			let origin = null;

			for (let s = 0, sl = stack.length; s < sl; s++) {

				let line = stack[s].trim();
				if (line.includes('(file://') === true && line.includes(')') === true) {

					let tmp = line.split('(file://')[1].split(')').shift().trim();
					if (tmp.includes('.mjs') === true) {
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

const sandbox_console_method = function(method) {

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

const sandbox_console = function() {

	return {

		clear: () => {}, // No clear() allowed

		blink: sandbox_console_method('blink'),
		debug: sandbox_console_method('debug'),
		diff:  sandbox_console_method('diff'),
		error: sandbox_console_method('error'),
		info:  sandbox_console_method('info'),
		log:   sandbox_console_method('log'),
		warn:  sandbox_console_method('warn')

	};

};

const init = function(settings) {

	let action   = isString(settings.action)    ? settings.action   : null;
	let inspect  = isString(settings.inspect)   ? settings.inspect  : null;
	let internet = isBoolean(settings.internet) ? settings.internet : false;
	let timeout  = isString(settings.timeout)   ? settings.timeout  : null;
	let include  = {};
	let filtered = false;

	settings.reviews.map((review) => {
		include[review.id] = false;
	});

	settings.patterns.forEach((pattern) => {

		filtered = true;

		settings.reviews.forEach((review) => {

			if (review.matches(pattern) === true) {
				include[review.id] = true;
			}

		});

	});


	// --internet defaulted with true
	if (internet === false) {

		settings.reviews.forEach((review) => {

			if (review.flags.internet === true) {
				include[review.id] = false;
			}

		});

	}


	// --inspect defaulted with null
	if (inspect !== null) {

		filtered = true;


		settings.reviews.forEach((review) => {

			let found = review.tests.find((test) => test.name === inspect) || null;
			if (found === null) {
				include[review.id] = false;
			}

		});

		settings.reviews.forEach((review) => {

			review.tests = review.tests.filter((test) => {
				return test.name === inspect;
			});

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

			}

		}

	}


	if (timeout !== null && timeout.endsWith('s') === true) {

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

		if (review.before.includes(test) === true) {

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

		} else if (review.tests.includes(test) === true) {

			let temp = review.tests[review.tests.indexOf(test) + 1] || null;
			if (temp !== null) {
				next = temp;
			} else if (review.after.length > 0) {
				next = review.after[0];
			} else {
				next = null;
			}

		} else if (review.after.includes(test) === true) {

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
					sandbox_console()
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

				if (test.results.includes(false) === true) {
					state = 'fail';
				} else if (test.results.includes(null) === true) {
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

		if (test.results.includes(false) === true) {
			test.state = 'fail';
		} else if (test.results.includes(null) === true) {
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
		action:   null, // 'scan' or 'time'
		inspect:  null,
		internet: true,
		patterns: [],
		project:  ENVIRONMENT.project,
		report:   null,
		reviews:  [],
		sources:  {},
		timeout:  null
	}, settings));


	console.clear();
	console.log('Covert: Command-Line Arguments:');
	console.log(prettify_settings(this._settings));


	this.interval    = null;
	this.filesystem  = new Filesystem(this._settings);
	this.network     = new Network(this._settings);
	this.renderer    = new Renderer(this._settings);
	this.reviews     = [];

	this.interceptor = new Interceptor({
		report:  this._settings.report,
		reviews: this.reviews
	});

	this.__state = {
		connected: false,
		review:    null,
		test:      null,
		timeout:   10 * 1000
	};


	Emitter.call(this);


	this.on('connect', (reviews) => {

		if (this.__state.connected === false) {

			let need_network  = this.reviews.filter((review) => review.flags.network  === true).length > 0;
			let need_internet = this.reviews.filter((review) => review.flags.internet === true).length > 0;

			if (need_network === true) {
				this.network.connect();
			}

			if (need_network === true || need_internet === true) {
				this.interceptor.connect();
			}

			this.__state.connected = true;

		}

		let interval = this.interval;
		if (interval === null) {

			// XXX: Give the Network and Interceptor some time
			setTimeout(() => {

				this.renderer.render(reviews, 'complete');
				this.interval = setInterval(() => {

					let is_busy = update.call(this);
					if (is_busy === false) {

						clearInterval(this.interval);
						this.interval = null;

						this.disconnect();

					} else {
						this.emit('render', [ this.reviews ]);
					}

				}, 100);

			}, 500);

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
						sandbox_console()
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


		if (reviews.length > 0) {

			this.renderer.render(reviews, 'complete');

			if (this._settings.report !== null) {

				let buffer = this.renderer.buffer(reviews, 'errors');
				if (buffer !== null) {
					this.filesystem.write(this._settings.report + '.report', buffer, 'utf8');
				}

			}

		}


		if (this.__state.connected === true) {

			this.interceptor.disconnect();
			this.network.disconnect();

			this.__state.connected = false;

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

	process.on('uncaughtException', (err) => {

		if (isError(err) === true) {

			let message = toMessage(err);
			if (message !== null) {

				let review  = this.__state.review || null;
				let test    = this.__state.test   || null;
				if (review !== null && test !== null) {

					review.errors.push(test.name + ' throws ' + message);
					this.disconnect();

				} else {

					console.error(err);
					this.disconnect();

				}

			}

		}

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

			this.__state.review = review;
			this.__state.test   = test;


			let required_ports = [];

			this.reviews.forEach((review) => {

				if (isArray(review.flags.ports) === true) {

					review.flags.ports.forEach((port) => {

						this.network.check(port, (result) => {

							if (result === false) {
								required_ports.push(port);
							}

						});

					});

				}

			});

			this.network.check(65432, (result) => {

				if (result === false) {
					required_ports.push(65432);
				}

			});

			setTimeout(() => {

				if (required_ports.length > 0) {

					required_ports.forEach((port) => {
						console.error('Covert: Cannot bind to Network Port ' + port + '.');
					});

					this.emit('disconnect', [[]]);

				} else {

					this.emit('connect', [ this.reviews ]);

				}

			}, 1000);

			return true;

		} else {

			if (this._settings.inspect !== null) {
				console.error('Covert: No Review(s) match the patterns "' + this._settings.patterns.join('" or "') + '" that contain a Test "' + this._settings.inspect + '".');
			} else {
				console.error('Covert: No Review(s) match the patterns "' + this._settings.patterns.join('" or "') + '".');
			}

			this.emit('disconnect', [[]]);

			return false;

		}

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

			if (this._settings.action === 'time') {

				this.reviews.forEach((review) => {
					console.log('');
					this.renderer.render(review, 'complete');
				});

			}

			return 0;

		}

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			this.__state.connected = false;
			this.emit('disconnect', [ this.reviews ]);

		}

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

	}

});


export { Covert };

