
import { describe, finish } from '../../covert/index.mjs';
import { Emitter          } from '../source/Emitter.mjs';



describe('emitter.emit', function(assert) {

	let emitter = new Emitter();

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.emit('foo');

});

describe('emitter.emit/Error', function(assert) {

	let emitter = new Emitter();

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.on('foo', () => {
		throw new Error('Should be caught.');
	});

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.emit('foo');

});

describe('emitter.on', function(assert) {

	let emitter = new Emitter();

	emitter.on('foo', () => {

		assert(this !== emitter);
		assert(true);

	});

	emitter.on('bar', function() {

		assert(this !== emitter);
		assert(true);

	});

	emitter.emit('foo');
	emitter.emit('bar');

});

describe('emitter.off', function(assert) {

	let emitter = new Emitter();
	let fired   = { foo: false, bar: false };

	emitter.on('foo', () => {
		fired.foo = true;
	});

	emitter.on('bar', () => {
		fired.bar = true;
	});

	emitter.off('foo');

	emitter.emit('foo');
	emitter.emit('bar');

	assert(fired.foo, false);
	assert(fired.bar, true);

});

describe('emitter.once', function(assert) {

	let emitter = new Emitter();
	let fired   = { foo: 0, bar: 0 };

	emitter.once('foo', () => {
		fired.foo++;
	});

	emitter.on('bar', () => {
		fired.bar++;
	});

	emitter.emit('foo');
	emitter.emit('bar');

	emitter.emit('foo');
	emitter.emit('bar');

	assert(fired.foo, 1);
	assert(fired.bar, 2);

});


export default finish('base/Emitter');

