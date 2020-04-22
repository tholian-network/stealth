
import { describe, finish   } from '../../covert/index.mjs';
import { Emitter, isEmitter } from '../source/Emitter.mjs';



describe('new Emitter()', function(assert) {

	let emitter = new Emitter();

	assert(emitter instanceof Emitter);
	assert(Object.prototype.toString.call(emitter), '[object Emitter]');

});

describe('Emitter.isEmitter()', function(assert) {

	let emitter = new Emitter();

	assert(typeof Emitter.isEmitter, 'function');

	assert(Emitter.isEmitter(emitter), true);

});

describe('isEmitter()', function(assert) {

	let emitter = new Emitter();

	assert(typeof isEmitter, 'function');

	assert(isEmitter(emitter), true);

});

describe('Emitter.prototype.emit()', function(assert) {

	let emitter = new Emitter();

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.emit('foo');

});

describe('Emitter.prototype.emit()/Error', function(assert) {

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

describe('Emitter.prototype.off()', function(assert) {

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

describe('Emitter.prototype.on()', function(assert) {

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

describe('Emitter.prototype.once()', function(assert) {

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

