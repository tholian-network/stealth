
import util from 'util';
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
	let reviews  = isArray(settings.reviews)    ? settings.reviews.filter((r) => isReview(r)) : [];
	let sources  = isObject(settings.sources)   ? settings.sources                            : {};
	let filtered = false;
	let include  = {};
	let projects = [];


	reviews.forEach((review) => {

		include[review.id] = false;

		let project = review.id.split('/').shift();
		if (projects.includes(project) === false) {
			projects.push(project);
		}

	});

	projects.forEach((project) => {

		let implementations = this.filesystem.scan(ENVIRONMENT.root + '/' + project + '/source', true).map((path) => {

			let raw = path.substr(ENVIRONMENT.root.length + 1);
			if (raw.endsWith('.mjs')) {

				let tmp = raw.substr(0, raw.length - 4).split('/');
				if (tmp.includes('source')) {

					let index = tmp.indexOf('source');
					if (index === 1) {
						tmp.splice(index, 1);
					}

					if (
						sources[tmp[0]] !== undefined
						&& sources[tmp[0]][tmp.slice(1).join('/')] !== undefined
					) {

						let new_id = sources[tmp[0]][tmp.slice(1).join('/')];
						if (new_id === undefined) {
							// Do nothing
						} else if (new_id !== null) {
							tmp = (tmp[0] + '/' + new_id).split('/');
						} else if (new_id === null) {
							tmp = [];
						}

					}

					if (tmp.length > 0) {
						return tmp.join('/');
					}

				}

			}


			return null;

		}).filter((id) => id !== null);

		if (implementations.length > 0) {

			implementations.forEach((id) => {

				if (include[id] === undefined) {

					let review = new Review();

					review.id    = id;
					review.state = 'none';

					include[review.id] = false;
					reviews.push(review);

				}

			});

		}

	});

	settings.patterns.forEach((pattern) => {

		filtered = true;


		if (pattern.startsWith('*')) {

			reviews.forEach((review) => {

				if (review.id.endsWith(pattern.substr(1))) {
					include[review.id] = true;
				}

			});

		} else if (pattern.endsWith('*')) {

			reviews.forEach((review) => {

				if (review.id.startsWith(pattern.substr(0, pattern.length - 1))) {
					include[review.id] = true;
				}

			});

		} else if (pattern.includes('*')) {

			let prefix = pattern.split('*').shift();
			let suffix = pattern.split('*').pop();

			reviews.forEach((review) => {

				if (review.id.startsWith(prefix) && review.id.endsWith(suffix)) {
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

const update_review = async function(review) {

	if (this.modules[review.id] === undefined) {

		let sources = this._settings.sources;

		let tmp = review.id.split('/');

		if (
			sources[tmp[0]] !== undefined
			&& sources[tmp[0]][tmp.slice(1).join('/')] !== undefined
		) {
			tmp = (tmp[0] + '/' + sources[tmp[0]][tmp.slice(1).join('/')]).split('/');
		} else {
			tmp = review.id.split('/');
		}

		tmp.splice(1, 0, 'source');
		tmp[tmp.length - 1] = tmp[tmp.length - 1] + '.mjs';


		let path   = tmp.join('/');
		let module = await import(ENVIRONMENT.root + '/' + path).then((obj) => {
			return obj;
		}).catch((err) => {
			// Do nothing
		});

		if (isModule(module) === true) {
			this.modules[review.id] = module;
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

				let custom = exported.prototype[Symbol.toStringTag] || null;

				let statics = Object.keys(exported).filter((key) => {
					return isFunction(exported[key]);
				}).map((key) => {
					return name + '.' + key + '()';
				});

				let methods = Object.keys(exported.prototype).filter((key) => {

					if (name !== 'Emitter') {

						if (exported.prototype[key] !== Emitter.prototype[key]) {
							return isFunction(exported.prototype[key]);
						}

					} else {

						return isFunction(exported.prototype[key]);

					}


					return false;

				}).map((key) => {
					return name + '.prototype.' + key + '()';
				});


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
					return isFunction(exported[key]);
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

		let check = tests.find((t) => t.name.startsWith(name)) || null;
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
				return line.startsWith('assert(') && line.endsWith(' === undefined);') === false;
			}).find((line) => {
				return line.startsWith('assert(') && (line.includes(' === ') || line.includes(' == ') || line.includes(' && '));
			}) || null;

			if (wrong_compare !== null) {
				review.errors.push(test.name + ' should use assert(value, expect).');
				state = 'fail';
			}

		}

	});

	review.state = state;

	return true;

};

const update = function() {

	this.reviews.forEach((review) => {
		update_review.call(this, review);
	});

	setTimeout(() => {
		this.disconnect();
	}, 1000);

};



const Linter = function(settings) {

	this._settings = Object.freeze(Object.assign({
		action:   null, // 'check'
		internet: true,
		patterns: [],
		reviews:  [],
		sources:  {},
		root:     ENVIRONMENT.root
	}, settings));


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

			this.filesystem.connect();

			this.__state.connected = true;

		}

		update.call(this);

	});

	this.on('disconnect', () => {

		if (this.__state.connected === true) {

			this.filesystem.disconnect();

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

		}


		return false;

	},

	destroy: function() {

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

