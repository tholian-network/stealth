
const _TESTS = [];
let   _TEST  = null;



export const assert = function(result) {
};

export const expect = function(callback) {
	callback = typeof callback === 'function' ? callback : null;
};


export const before = function(name, callback) {

	name     = typeof name === 'string'       ? name     : null;
	callback = typeof callback === 'function' ? callback : null;


	if (name !== null && callback !== null) {

		let test = {
			name:     name,
			callback: callback,
			results:  [ 0, 0 ]
		};

		_TEST = {
			before: test,
			after:  null,
			scope:  {},
			suite:  []
		};

		_TESTS.push(_TEST);

		return test;

	}


	return null;

};

export const describe = function(name, callback) {

	name     = typeof name === 'string'       ? name     : null;
	callback = typeof callback === 'function' ? callback : null;


	if (name !== null && callback !== null) {

		let test = {
			name:     name,
			callback: callback,
			results:  [ 0, 0 ]
		};

		if (_TEST !== null) {
			_TEST.suite.push(test);
		} else {
			_TESTS.push({
				before: null,
				after:  null,
				scope:  {},
				suite:  [ test ]
			});
		}

		return test;

	}


	return null;

};

export const after = function(name, callback) {

	name     = typeof name === 'string'       ? name     : null;
	callback = typeof callback === 'function' ? callback : null;


	if (name !== null && callback !== null) {

		let test = {
			name:     name,
			callback: callback,
			results:  [ 0, 0 ]
		};

		if (_TEST !== null) {
			_TEST.after = test;
			_TEST       = null;
		} else if (_TESTS.length > 0) {
			_TESTS[_TESTS.length - 1].after = test;
		} else {
			_TESTS.push({
				before: null,
				after:  test,
				scope:  {},
				suite:  []
			});
		}

		return test;

	}


	return null;

};

export const attach = function(callback, test) {

	callback = typeof callback === 'function' ? callback : null;
	test     = test instanceof Object         ? test     : null;


	if (callback !== null && test !== null) {
		callback(test.name || null, test.callback || null);
	}

};

export const initialize = function(callback) {

	callback = typeof callback === 'function' ? callback : null;


	if (callback !== null) {

		_TESTS.forEach((testsuite) => {

			console.log(testsuite);

		});

	}

};

