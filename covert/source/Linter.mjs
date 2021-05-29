
import process from 'process';

import { console, Emitter, isArray, isBoolean, isFunction, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                                          } from './ENVIRONMENT.mjs';
import { Filesystem                                                           } from './Filesystem.mjs';
import { Renderer                                                             } from './Renderer.mjs';
import { Review, isReview                                                     } from './Review.mjs';



export const isLinter = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Linter]';
};

const isModule = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Module]';
};

const init = function(settings) {

	let action   = isString(settings.action)    ? settings.action                             : null;
	let internet = isBoolean(settings.internet) ? settings.internet                           : false;
	let project  = isString(settings.project)   ? settings.project                            : ENVIRONMENT.project;
	let reviews  = isArray(settings.reviews)    ? settings.reviews.filter((r) => isReview(r)) : [];
	let sources  = isObject(settings.sources)   ? settings.sources                            : {};
	let filtered = false;
	let include  = {};


	reviews.forEach((review) => {
		include[review.id] = false;
	});

	this.filesystem.scan(project + '/source', true).filter((file) => {
		return file.endsWith('.mjs') === true;
	}).map((file) => {

		let path      = file.substr(project.length + '/source'.length + 1);
		let source_id = project.split('/').pop() + '/' + path.split('.').slice(0, -1).join('.');
		let review_id = sources[source_id];

		if (review_id === undefined) {
			return source_id;
		} else if (review_id !== null) {
			return review_id;
		} else if (review_id === null) {
			return null;
		}

	}).filter((id) => id !== null).forEach((id) => {

		if (include[id] === undefined) {

			let review = new Review();

			review.id    = id;
			review.state = 'none';
			review.errors.push('Review is an invalid ECMAScript Module.');

			include[review.id] = false;
			reviews.push(review);

		}

	});


	settings.patterns.forEach((pattern) => {

		filtered = true;


		if (pattern.startsWith('*') === true) {

			reviews.forEach((review) => {

				if (review.id.endsWith(pattern.substr(1)) === true) {
					include[review.id] = true;
				}

			});

		} else if (pattern.endsWith('*') === true) {

			reviews.forEach((review) => {

				if (review.id.startsWith(pattern.substr(0, pattern.length - 1)) === true) {
					include[review.id] = true;
				}

			});

		} else if (pattern.includes('*') === true) {

			let prefix = pattern.split('*').shift();
			let suffix = pattern.split('*').pop();

			reviews.forEach((review) => {

				if (review.id.startsWith(prefix) === true && review.id.endsWith(suffix) === true) {
					include[review.id] = true;
				}

			});

		} else {

			reviews.forEach((review) => {

				if (review.id === pattern) {
					include[review.id] = true;
				}

			});

		}

	});


	// --internet defaulted with true
	if (internet === false) {

		reviews.forEach((review) => {

			if (review.flags.internet === true) {
				include[review.id] = false;
			}

		});

	}


	if (filtered === true) {

		if (action === 'check') {

			reviews.sort((a, b) => {
				if (a.id < b.id) return -1;
				if (b.id < a.id) return  1;
				return 0;
			}).filter((review) => {
				return include[review.id] === true;
			}).forEach((review) => {
				this.check(review);
			});

		}

	} else {

		if (action === 'check') {

			reviews.sort((a, b) => {
				if (a.id < b.id) return -1;
				if (b.id < a.id) return  1;
				return 0;
			}).forEach((review) => {
				this.check(review);
			});

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

const update_review_index = async function() {

	let namespace = this._settings.project.split('/').pop();
	let review    = new Review();

	review.id    = namespace + '/review/index.mjs';
	review.state = 'none';


	let module = await import(this._settings.project + '/review/index.mjs').then((mod) => mod).catch(() => {});
	if (isModule(module) === true) {

		let reviews = module['REVIEWS'] || [];
		if (reviews.length > 0) {

			reviews.forEach((data, r) => {

				if (isReview(data) === false) {
					review.errors.push('REVIEWS[' + r + '] must be a Review.');
				}

			});

		} else {
			review.errors.push('Exported constant REVIEWS must be an Array of Reviews.');
		}

		let sources = module['SOURCES'] || {};
		if (Object.keys(sources).length > 0) {

			Object.keys(sources).forEach((key) => {

				let val = sources[key];

				if (isString(val) === true) {

					if (key.startsWith(namespace + '/') === false) {
						review.errors.push('SOURCES["' + key + '"] must start with the project namespace.');
					}

					if (val.startsWith(namespace + '/') === false) {
						review.errors.push('SOURCES["' + key + '"]\'s value must start with the project namespace.');
					}

				} else if (val !== null) {
					review.errors.push('SOURCES["' + key + '"] must be a String or Null.');
				}

			});

		} else {
			review.errors.push('Exported constant SOURCES must be an Object of Identifier Mappings.');
			review.errors.push('Example: { "' + namespace + '/$platform_specific_path/Module": "' + namespace + '/Module" }');
		}

	} else {
		review.errors.push('The index.mjs is an invalid ECMAScript Module.');
	}


	if (review.errors.length > 0) {
		this.reviews.splice(0, 0, review);
	}

};

const update_review = async function(review) {

	if (this.modules[review.id] === undefined) {

		let sources   = this._settings.sources;
		let path      = null;
		let review_id = review.id;
		let source_id = sources[review_id];

		if (source_id === undefined) {

			let tmp = review_id.split('/');
			tmp.splice(0, 1);           // remove namespace
			tmp.splice(0, 0, 'source'); // insert source
			path = tmp.join('/') + '.mjs';

		} else if (source_id !== null) {

			let tmp = source_id.split('/');
			tmp.splice(0, 1);           // remove namespace
			tmp.splice(0, 0, 'source'); // insert source
			path = tmp.join('/') + '.mjs';

		} else if (source_id === null) {

			path = null;

		}

		if (path !== null) {

			let module = await import(this._settings.project + '/' + path).then((mod) => mod).catch(() => {});
			if (isModule(module) === true && Object.keys(module).length > 0) {
				this.modules[review.id] = module;
			} else {
				review.errors.push('Implementation is an invalid ECMAScript Module.');
			}

		}

	}


	let expect = [];
	let module = this.modules[review.id] || null;
	if (module !== null) {

		for (let name in module) {

			// Ignore .mjs files that export JSON data
			if (name === 'default') continue;

			let exported = module[name];

			if (isFunction(exported) === true) {

				let custom  = null;
				let statics = [];
				let methods = [];


				statics = Object.keys(exported).filter((key) => {
					return isFunction(exported[key]) === true;
				}).map((key) => {
					return name + '.' + key + '()';
				});

				if (exported.prototype !== undefined && exported.prototype !== null) {

					custom = exported.prototype[Symbol.toStringTag] || null;

					if (custom === 'Map' || custom === 'Set') {
						custom = null;
					}


					methods = Object.keys(exported.prototype).filter((key) => {

						if (name !== 'Emitter') {

							if (isFunction(exported.prototype[key]) === true) {

								if (isFunction(Emitter.prototype[key]) === true) {

									if (exported.prototype[key].toString() !== Emitter.prototype[key].toString()) {
										return true;
									}

								} else {
									return true;
								}

							}

						} else {
							return isFunction(exported.prototype[key]) === true;
						}


						return false;

					}).map((key) => {
						return name + '.prototype.' + key + '()';
					});

				}


				if (statics.length > 0 || methods.length > 0) {

					if (custom !== null) {

						if (expect.includes('new ' + name + '()') === false) {
							expect.push('new ' + name + '()');
						}

					} else if (review.id.startsWith('base/') === false) {

						review.errors.push(name + '.prototype[Symbol.toStringTag] not set.');

					}

					statics.forEach((method) => {

						if (expect.includes(method) === false) {
							expect.push(method);
						}

					});

					methods.forEach((method) => {

						if (expect.includes(method) === false) {
							expect.push(method);
						}

					});

				} else if (custom !== null) {

					if (expect.includes('new ' + name + '()') === false) {
						expect.push('new ' + name + '()');
					}

				} else {

					if (expect.includes(name + '()') === false) {
						expect.push(name + '()');
					}

				}

			} else if (isObject(exported) === true) {

				let statics = Object.keys(exported).filter((key) => {
					return isFunction(exported[key]) === true;
				}).map((key) => {
					return name + '.' + key + '()';
				});

				if (statics.length > 0) {

					statics.forEach((method) => {

						if (expect.includes(method) === false) {
							expect.push(method);
						}

					});

				}

			}

		}

	}


	let state = 'okay';
	let tests = review.flatten();

	expect.forEach((name) => {

		let check = tests.find((t) => {
			return t.name.startsWith(name) === true;
		}) || null;

		if (check === null) {
			review.errors.push(name + ' is not tested via describe().');
			state = 'none';
		}

	});

	tests.forEach((test) => {

		if (test.results.length === 0) {
			review.errors.push(test.name + ' has no assert() calls.');
			state = 'fail';
		}

		let body = test.callback.toString().split('\n').slice(1, -1);
		if (body.length > 0) {

			let wrong_compare = body.map((line) => line.trim()).filter((line) => {
				return line.startsWith('assert(') === true && line.endsWith(' === undefined);') === false;
			}).find((line) => {
				return line.startsWith('assert(') === true && (line.includes(' === ') === true || line.includes(' == ') === true || line.includes(' && ') === true);
			}) || null;

			if (wrong_compare !== null) {
				review.errors.push(test.name + ' should use assert(value, expect).');
				state = 'fail';
			}

			let wrong_null = body.map((line) => line.trim()).filter((line) => {
				return line.startsWith('assert(') === true && line.includes(' !== null);') === true;
			}).find((line) => {
				return line.startsWith('assert(this.') === false;
			}) || null;

			if (wrong_null !== null) {
				review.errors.push(test.name + ' should use assert(value, expect) instead of assert(value !== null).');
				state = 'fail';
			}

		}

	});

	if (review.state !== 'none') {
		review.state = state;
	}


	return true;

};

const update_source_index = async function() {

	let namespace = this._settings.project.split('/').pop();
	let review    = new Review();

	review.id    = namespace + '/index.mjs';
	review.state = 'none';


	let module = await import(this._settings.project + '/index.mjs').then((mod) => mod).catch(() => {});
	if (isModule(module) === true) {

		let exported = Object.keys(module);
		let expected = this.filesystem.scan(this._settings.project + '/source').filter((path) => {
			return path.endsWith('.mjs') === true;
		}).map((path) => {
			return path.split('/').pop().split('.').slice(0, -1).join('.');
		}).filter((expect) => {
			return expect !== 'MODULE';
		});

		if (expected.length > 0) {

			expected.forEach((expect) => {

				let format_constructor = (expect.charAt(0).toUpperCase() + expect.substr(1).toLowerCase());
				let format_method      = expect.toLowerCase();
				let format_singleton   = expect.toUpperCase();

				if (expect === format_constructor) {

					if (exported.includes(expect) === false) {
						review.errors.push('Exported constant "' + expect + '" is missing.');
					}

					if (exported.includes('is' + expect) === false) {
						review.errors.push('Exported constant "is' + expect + '" is missing.');
					}

					if (isFunction(module[expect]) === false) {
						review.errors.push('Exported constant "' + expect + '" is not a Constructor.');
					}

					if (isFunction(module['is' + expect]) === false) {
						review.errors.push('Exported constant "' + expect + '" is not a Function.');
					}

				} else if (expect === format_singleton) {

					if (exported.includes(expect) === false) {
						review.errors.push('Exported constant "' + expect + '" is missing.');
					}

					if (isObject(module[expect]) === false) {
						review.errors.push('Exported constant "' + expect + '" is not an Object.');
					}

				} else if (expect === format_method) {

					// Do Nothing

				} else {

					// XXX: Has to be CamelCase

					if (exported.includes(expect) === false) {
						review.errors.push('Exported constant "' + expect + '" is missing.');
					}

					if (exported.includes('is' + expect) === false) {
						review.errors.push('Exported constant "is' + expect + '" is missing.');
					}

					if (isFunction(module[expect]) === false) {
						review.errors.push('Exported constant "' + expect + '" is not a Constructor.');
					}

					if (isFunction(module['is' + expect]) === false) {
						review.errors.push('Exported constant "' + expect + '" is not a Function.');
					}

				}

			});

		}

	} else {
		review.errors.push('The index.mjs is an invalid ECMAScript Module.');
	}


	if (review.errors.length > 0) {
		this.reviews.splice(0, 0, review);
	}

};

const update = function() {

	this.reviews.forEach((review) => {
		update_review.call(this, review);
	});

	setTimeout(() => {
		update_review_index.call(this);
		update_source_index.call(this);
	}, 500);

	setTimeout(() => {
		this.disconnect();
	}, 1000);

};



const Linter = function(settings) {

	this._settings = Object.freeze(Object.assign({
		action:   null, // 'check'
		internet: true,
		patterns: [],
		project:  ENVIRONMENT.project,
		report:   null,
		reviews:  [],
		sources:  {},
	}, settings));


	console.clear();
	console.log('Linter: Command-Line Arguments:');
	console.log(prettify(this._settings));


	this.filesystem = new Filesystem(this._settings);
	this.renderer   = new Renderer(this._settings);
	this.modules    = {};
	this.reviews    = [];

	this.__state = {
		connected: false
	};


	Emitter.call(this);


	this.on('connect', () => {

		if (this.__state.connected === false) {
			this.__state.connected = true;
		}

		update.call(this);

	});

	this.on('disconnect', (reviews) => {

		if (reviews.length > 0) {

			if (this._settings.report !== null) {

				let buffer = this.renderer.buffer(reviews, 'errors');
				if (buffer !== null) {
					this.filesystem.write(this._settings.report + '.report', buffer, 'utf8');
				}

			}

		}


		if (this.__state.connected === true) {
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


	init.call(this, this._settings);

};


Linter.isLinter = isLinter;


Linter.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Linter',

	check: function(review) {

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

	connect: function() {

		let review = this.reviews[0] || null;
		if (review !== null) {

			console.info('');
			console.info('Linter: ' + this._settings.action + ' mode');
			console.warn('Linter: This mode only validates Reviews and does not execute them!');
			console.info('');

			this.emit('connect', [ this.reviews ]);

			return true;

		} else {

			console.error('Linter: No Review(s) match the patterns "' + this._settings.patterns.join('" or "') + '".');
			this.emit('disconnect', [[]]);

			return false;

		}

	},

	destroy: function() {

		this.reviews.filter((r) => r.state === 'fail').forEach((review) => {
			review.state = 'okay';
		});




		let nones = this.reviews.filter((r) => r.state === 'none');
		let fails = this.reviews.filter((r) => r.state === 'fail');


		if (this._settings.debug === true) {
			console.log('');
		} else {
			console.clear();
		}


		if (fails.length > 0) {

			console.error('');
			console.error('Linter: Some Reviews refuted.');
			console.error('');

			nones.forEach((review) => {
				console.log('');
				this.renderer.render(review, 'errors');
			});

			fails.forEach((review) => {
				console.log('');
				this.renderer.render(review, 'errors');
			});

			return 1;

		} else if (nones.length > 0) {

			console.warn('');
			console.warn('Linter: Some Reviews missing.');
			console.warn('');

			nones.forEach((review) => {
				console.log('');
				this.renderer.render(review, 'errors');
			});

			return 2;

		} else {

			console.info('');
			console.info('Linter: All Reviews verified.');
			console.info('');

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

	}

});


export { Linter };

