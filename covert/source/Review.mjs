
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
	this.after  = [];
	this.before = [];
	this.errors = [];
	this.flags  = {};
	this.scope  = {};
	this.state  = null;
	this.tests  = [];

};


Review.isReview = isReview;


Review.prototype = {

	[Symbol.toStringTag]: 'Review',

	flatten: function() {

		let array = [];

		if (this.before.length > 0) {
			this.before.forEach((test) => {
				array.push(test);
			});
		}

		if (this.tests.length > 0) {
			this.tests.forEach((test) => {
				array.push(test);
			});
		}

		if (this.after !== null) {
			this.after.forEach((test) => {
				array.push(test);
			});
		}

		return array;

	}

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

			CURRENT_REVIEW.after.push(test);

		} else {

			CURRENT_REVIEW = new Review();
			CURRENT_REVIEW.after.push(test);

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

		if (CURRENT_REVIEW !== null) {

			if (CURRENT_REVIEW.tests.length > 0 || CURRENT_REVIEW.after.length > 0) {

				CURRENT_REVIEW = new Review();
				CURRENT_REVIEW.before.push(test);

			} else {

				CURRENT_REVIEW.before.push(test);

			}

		} else {

			CURRENT_REVIEW = new Review();
			CURRENT_REVIEW.before.push(test);

		}

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

