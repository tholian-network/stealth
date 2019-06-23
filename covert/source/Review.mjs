
import { isBoolean, isFunction, isObject, isString } from './POLYFILLS.mjs';

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
			timeline: Timeline.from(callback)
		};

		if (REVIEW !== null) {
			REVIEW.after = test;
		} else {
			REVIEW = {
				id:     null,
				before: null,
				after:  test,
				scope:  {},
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
			timeline: Timeline.from(callback)
		};

		REVIEW = {
			id:     null,
			before: test,
			after:  null,
			scope:  {},
			tests:  []
		};

		return test;

	}


	return null;

};

export const describe = function(name, callback, flags) {

	if (isObject(name) === true) {
		callback = isFunction(name.callback) ? name.callback : null;
		name     = isString(name.name)       ? name.name     : null;
		flags    = isObject(name.flags)      ? name.flags    : null;
	} else {
		name     = isString(name)       ? name     : null;
		callback = isFunction(callback) ? callback : null;
		flags    = isObject(flags)      ? flags    : null;
	}


	if (name !== null && callback !== null) {

		if (flags !== null) {

			for (let key in flags) {

				let val = flags[key];
				if (isBoolean(val) === false) {
					delete flags[key];
				}

			}

		} else {
			flags = {};
		}


		let test = {
			name:     name,
			callback: callback,
			results:  Results.from(callback),
			flags:    flags,
			timeline: Timeline.from(callback)
		};

		if (REVIEW !== null) {
			REVIEW.tests.push(test);
		} else {
			REVIEW = {
				id:     null,
				before: null,
				after:  null,
				scope:  {},
				tests:  [ test ]
			};
		}

		return test;

	}


	return null;

};

export const finish = function(id) {

	id = isString(id) ? id : ('Review-' + _id++);


	let review = REVIEW || null;
	if (review !== null) {

		review.id = id;
		REVIEW = null;

		return review;

	}


	return null;

};


