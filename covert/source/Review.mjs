
import { isFunction, isObject, isString } from '../extern/base.mjs';
import { Results                        } from './Results.mjs';
import { Timeline                       } from './Timeline.mjs';



let CURRENT_REVIEW = null;
let REVIEW_ID      = 0;

export const isReview = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Review]';
};

export const Review = function() {

	this.id     = ('Review-' + REVIEW_ID++);
	this.after  = null;
	this.before = null;
	this.flags  = {};
	this.scope  = {};
	this.state  = null;
	this.tests  = [];

};

Review.prototype = {
	[Symbol.toStringTag]: 'Review'
};



export const after = function(name, callback) {

	if (isObject(name) === true) {
		callback = isFunction(name.callback) ? name.callback : null;
		name     = isString(name.name)       ? name.name     : null;
	} else {
		name     = isString(name)       ? name     : null;
		callback = isFunction(callback) ? callback : null;
	}


	if (name !== null && callback !== null) {

		let test = {
			name:     name,
			callback: callback,
			results:  Results.from(callback),
			state:    null,
			timeline: Timeline.from(callback)
		};

		if (CURRENT_REVIEW !== null) {

			CURRENT_REVIEW.after = test;

		} else {

			CURRENT_REVIEW       = new Review();
			CURRENT_REVIEW.after = test;

		}

		return test;

	}


	return null;

};

export const before = function(name, callback) {

	if (isObject(name) === true) {
		callback = isFunction(name.callback) ? name.callback : null;
		name     = isString(name.name)       ? name.name     : null;
	} else {
		name     = isString(name)       ? name     : null;
		callback = isFunction(callback) ? callback : null;
	}


	if (name !== null && callback !== null) {

		let test = {
			name:     name,
			callback: callback,
			results:  Results.from(callback),
			state:    null,
			timeline: Timeline.from(callback)
		};

		CURRENT_REVIEW        = new Review();
		CURRENT_REVIEW.before = test;

		return test;

	}


	return null;

};

export const describe = function(name, callback) {

	if (isObject(name) === true) {
		callback = isFunction(name.callback) ? name.callback : null;
		name     = isString(name.name)       ? name.name     : null;
	} else {
		name     = isString(name)       ? name     : null;
		callback = isFunction(callback) ? callback : null;
	}


	if (name !== null && callback !== null) {

		let test = {
			name:     name,
			callback: callback,
			results:  Results.from(callback),
			state:    null,
			timeline: Timeline.from(callback)
		};

		if (CURRENT_REVIEW !== null) {

			CURRENT_REVIEW.tests.push(test);

		} else {

			CURRENT_REVIEW = new Review();
			CURRENT_REVIEW.tests.push(test);

		}

		return test;

	}


	return null;

};

export const finish = function(id, flags) {

	id    = isString(id)    ? id    : null;
	flags = isObject(flags) ? flags : {};


	let review = CURRENT_REVIEW || null;
	if (review !== null) {

		if (id !== null) {
			review.id = id;
		}

		if (flags !== null) {
			review.flags = flags;
		}

		CURRENT_REVIEW = null;

		return review;

	}


	return null;

};



const REVIEW = {

	after:    after,
	before:   before,
	describe: describe,
	finish:   finish

};


export { REVIEW };

