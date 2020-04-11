
import { isFunction, isObject, isString } from '../../stealth/source/BASE.mjs';
import { Results                        } from './Results.mjs';
import { Timeline                       } from './Timeline.mjs';



let CURRENT_ID     = 0;
let CURRENT_REVIEW = null;

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

			CURRENT_REVIEW = {
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

		CURRENT_REVIEW = {
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

		if (CURRENT_REVIEW !== null) {

			CURRENT_REVIEW.tests.push(test);

		} else {

			CURRENT_REVIEW = {
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

	id    = isString(id)    ? id    : ('Review-' + CURRENT_ID++);
	flags = isObject(flags) ? flags : {};


	let review = CURRENT_REVIEW || null;
	if (review !== null) {

		review.id      = id;
		review.flags   = flags;
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

