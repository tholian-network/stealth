
import { describe, finish } from '../../covert/index.mjs';
import { console          } from '../source/node/console.mjs';



describe('console.clear()', function(assert, _console) {

	assert(typeof console.clear,  'function');
	assert(typeof _console.clear, 'function');

	console.clear('foo');
	assert(true);

	_console.clear('bar');
	assert(true);

});

describe('console.blink()', function(assert, _console) {

	assert(typeof console.blink,  'function');
	assert(typeof _console.blink, 'function');

	console.blink('foo');
	assert(true);

	_console.blink('bar');
	assert(true);

});

describe('console.diff()', function(assert, _console) {

	assert(typeof console.diff,  'function');
	assert(typeof _console.diff, 'function');

	console.diff('foo bar qux', 'foo qux qux');
	assert(true);

	console.diff('foo bar qux', 'foo bar qux');
	assert(true);

});

describe('console.debug()', function(assert, _console) {

	assert(typeof console.debug,  'function');
	assert(typeof _console.debug, 'function');

	console.debug('foo');
	assert(true);

});

describe('console.error()', function(assert, _console) {

	assert(typeof console.error,  'function');
	assert(typeof _console.error, 'function');

	console.error('foo');
	assert(true);

	_console.error('bar');
	assert(true);

});

describe('console.info()', function(assert, _console) {

	assert(typeof console.info,  'function');
	assert(typeof _console.info, 'function');

	console.info('foo');
	assert(true);

	_console.info('bar');
	assert(true);

});

describe('console.log()', function(assert, _console) {

	assert(typeof console.log,  'function');
	assert(typeof _console.log, 'function');

	console.log('foo');
	assert(true);

	_console.log('bar');
	assert(true);

});

describe('console.warn()', function(assert, _console) {

	assert(typeof console.warn,  'function');
	assert(typeof _console.warn, 'function');

	console.warn('foo');
	assert(true);

	_console.warn('bar');
	assert(true);

});


export default finish('base/console', {
	internet: false,
	network:  false
});

