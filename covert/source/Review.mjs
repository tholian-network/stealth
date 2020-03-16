
import { isFunction, isObject, isString } from './POLYFILLS.mjs';

import { Results  } from './Results.mjs';
import { Timeline } from './Timeline.mjs';



let _id    = 0;
let REVIEW = null;


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

		if (REVIEW !== null) {
			REVIEW.after = test;
		} else {
			REVIEW = {
				id:     null,
				flags:  {},
				before: null,
				after:  test,
				scope:  {},
				state:  null,
				tests:  []
			};
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

		REVIEW = {
			id:     null,
			flags:  {},
			before: test,
			after:  null,
			scope:  {},
			state:  null,
			tests:  []
		};

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

		if (REVIEW !== null) {
			REVIEW.tests.push(test);
		} else {
			REVIEW = {
				id:     null,
				flags:  {},
				before: null,
				after:  null,
				scope:  {},
				state:  null,
				tests:  [ test ]
			};
		}

		return test;

	}


	return null;

};

export const finish = function(id, flags) {

	id    = isString(id)    ? id    : ('Review-' + _id++);
	flags = isObject(flags) ? flags : {};


	let review = REVIEW || null;
	if (review !== null) {

		review.id    = id;
		review.flags = flags;
		REVIEW       = null;

		return review;

	}


	return null;

};


