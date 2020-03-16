
import { after, before, describe, finish } from '../source/Review.mjs';



before('before', function(assert, console) {

	console.log('before.synchronous');
	assert(true);

	setTimeout(() => {
		console.log('before.asynchronous');
		assert(true);
	}, 1000);

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


export default finish('Review');

