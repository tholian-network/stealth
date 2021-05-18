
import { console, isFunction, isObject                     } from '../../covert/extern/base.mjs';
import { after, before, describe, finish, Review, isReview } from '../../covert/source/Review.mjs';



before('before()', function(assert, console) {

	assert(isFunction(before), true);

	console.log('before.synchronous');
	assert(true);

	setTimeout(() => {
		console.log('before.asynchronous');
		assert(true);
	}, 100);

});

describe('assert()', function(assert) {

	assert(isFunction(assert), true);

	assert(true);

});

describe('assert()/expect', function(assert) {

	let callback1 = function() {
		console.log('This is a test!');
	};
	let callback2 = function() {
		console.log('This is a test!');
	};

	assert(true, true);
	assert(callback1, callback2);
	assert(1337, 1337);
	assert(13.37, 13.37);
	assert('example.com', 'example.com');

	assert([ 1, 3, 3, 7 ], [ 1, 3, 3, 7 ]);
	assert({ foo: 'bar' }, { foo: 'bar' });
	assert({ foo: { qux: 'bar' } }, { foo: { qux: 'bar' } });

	assert(new Date('01.02.20 13:37'), new Date('01.02.20 13:37'));
	assert(new RegExp('/foo/bar', 'g'), new RegExp('/foo/bar', 'g'));

	assert([ { foo: { qux: 'bar' } } ], [ { foo: { qux: 'bar' } } ]);
	assert([ { foo: { qux: [ 1, 3.3, 7 ] } } ], [ { foo: { qux: [ 1, 3.3, 7 ] } } ]);

});

describe('console', function(assert, console) {

	assert(isObject(console),         true);
	assert(isFunction(console.blink), true);
	assert(isFunction(console.clear), true);
	assert(isFunction(console.debug), true);
	assert(isFunction(console.error), true);
	assert(isFunction(console.info),  true);
	assert(isFunction(console.log),   true);
	assert(isFunction(console.warn),  true);

});

describe('describe()', function(assert, console) {

	assert(isFunction(describe), true);

	console.log('describe.synchronous');
	assert(true);

	setTimeout(() => {
		console.log('describe.asynchronous');
		assert(true);
	}, 100);

	console.info('describe.info');
	console.warn('describe.warn');
	console.error('describe.error');

});

describe('new Review()', function(assert) {

	let review = new Review();

	assert(review.id !== null);
	assert(review.after,  []);
	assert(review.before, []);
	assert(review.errors, []);
	assert(review.flags,  {});
	assert(review.scope,  {});
	assert(review.state,  null);
	assert(review.tests,  []);

});

describe('Review.isReview()', function(assert) {

	assert(isFunction(Review.isReview), true);

	let review = new Review();

	assert(Review.isReview(review), true);
	assert(Review.isReview(null),   false);

});

describe('isReview()', function(assert) {

	assert(isFunction(isReview), true);

	let review = new Review();

	assert(isReview(review), true);
	assert(isReview(null),   false);

});

describe('Review.prototype.toString()', function(assert) {

	let review = new Review();

	assert(review.toString(),                      '[object Review]');
	assert(Object.prototype.toString.call(review), '[object Review]');

});

after('after()', function(assert, console) {

	assert(isFunction(after), true);

	console.log('after.synchronous');
	assert(true);

	setTimeout(() => {
		console.log('after.asynchronous');
		assert(true);
	}, 100);

});


export default finish('covert/Review', {
	internet: false,
	network:  false
});

