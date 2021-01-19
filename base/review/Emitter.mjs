
import { describe, finish   } from '../../covert/index.mjs';
import { isArray            } from '../source/Array.mjs';
import { Emitter, isEmitter } from '../source/Emitter.mjs';
import { isObject           } from '../source/Object.mjs';



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

describe('Emitter.prototype.toJSON()', function(assert) {

	let emitter = new Emitter();

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.on('bar', () => {
		assert(true);
	});

	setTimeout(() => {
		emitter.emit('foo');
	}, 100);

	setTimeout(() => {
		emitter.emit('bar');
	}, 200);

	setTimeout(() => {

		let json = emitter.toJSON();

		assert(isObject(json), true);
		assert(json.type,      'Emitter');

		assert(isObject(json.data),        true);
		assert(isArray(json.data.events),  true);
		assert(json.data.events,           [ 'foo', 'bar' ]);
		assert(isArray(json.data.journal), true);
		assert(json.data.journal[0].event, 'foo');
		assert(json.data.journal[1].event, 'bar');

	}, 300);

});

describe('Emitter.prototype.emit()', function(assert) {

	let emitter = new Emitter();

	emitter.on('foo', () => {
		assert(true);
	});

	emitter.on('foo', () => {
		assert(true);
	});

	assert(emitter.emit('foo'), null);

});

describe('Emitter.prototype.emit()/data', function(assert) {

	let emitter = new Emitter();

	emitter.on('foo', () => {
		assert(true);
		return { result: 'foo-1' };
	});

	emitter.on('foo', () => {
		assert(true);
		return { result: 'foo-2' };
	});

	assert(emitter.emit('foo'), { result: 'foo-2' });

});

describe('Emitter.prototype.emit()/Error', function(assert) {

	let emitter = new Emitter();

	emitter.on('foo', () => {
		assert(true);
		return { result: 'foo-1' };
	});

	emitter.on('foo', () => {
		throw new Error('Should be caught.');
	});

	emitter.on('foo', () => {
		assert(true);
		return { result: 'foo-3' };
	});

	assert(emitter.emit('foo'), { result: 'foo-3' });

});

describe('Emitter.prototype.has()', function(assert) {

	let callback = () => {};
	let emitter  = new Emitter();

	emitter.on('foo', () => {
		return { result: 'foo' };
	});

	emitter.once('qux', () => {
		return { result: 'qux' };
	});

	emitter.on('doo', callback);


	assert(emitter.has('foo'),           true);
	assert(emitter.has('bar'),           false);
	assert(emitter.has('qux'),           true);
	assert(emitter.has('doo', callback), true);

	assert(emitter.emit('foo'), { result: 'foo' });
	assert(emitter.emit('bar'), null);
	assert(emitter.emit('qux'), { result: 'qux' });
	assert(emitter.emit('doo'), null);

	assert(emitter.has('foo'),           true);
	assert(emitter.has('bar'),           false);
	assert(emitter.has('qux'),           false);
	assert(emitter.has('doo', callback), true);

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


export default finish('base/Emitter', {
	internet: false,
	network:  false
});

