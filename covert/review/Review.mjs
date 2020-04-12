
import { after, before, describe, finish } from '../source/Review.mjs';



before('before', function(assert, console) {

	console.log('before.synchronous');
	assert(true);

	setTimeout(() => {
		console.log('before.asynchronous');
		assert(true);
	}, 1000);

});

describe('assert', function(assert) {

	assert(true);

});

describe('assert/expect', function(assert) {

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

	assert(typeof console,       'object');
	assert(typeof console.blink, 'function');
	assert(typeof console.clear, 'function');
	assert(typeof console.debug, 'function');
	assert(typeof console.error, 'function');
	assert(typeof console.info,  'function');
	assert(typeof console.log,   'function');
	assert(typeof console.warn,  'function');

});

describe('describe', function(assert, console) {

	console.log('describe.synchronous');
	assert(true);

	setTimeout(() => {
		console.log('describe.asynchronous');
		assert(true);
	}, 1000);

	console.info('describe.info');
	console.warn('describe.warn');
	console.error('describe.error');

});

after('after', function(assert, console) {

	console.log('after.synchronous');
	assert(true);

	setTimeout(() => {
		console.log('after.asynchronous');
		assert(true);
	}, 1000);

});


export default finish('covert/Review');

