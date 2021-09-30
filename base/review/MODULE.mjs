
import { describe, finish } from '../../covert/index.mjs';
import BASE                 from '../../base/index.mjs';



describe('MODULE', function(assert) {

	assert(typeof BASE['console'], 'object');

	assert(typeof BASE['Array'],    'function');
	assert(typeof BASE['Boolean'],  'function');
	assert(typeof BASE['Buffer'],   'function');
	assert(typeof BASE['Date'],     'function');
	assert(typeof BASE['Emitter'],  'function');
	assert(typeof BASE['Function'], 'function');
	assert(typeof BASE['Map'],      'function');
	assert(typeof BASE['Number'],   'function');
	assert(typeof BASE['Object'],   'function');
	assert(typeof BASE['RegExp'],   'function');
	assert(typeof BASE['Set'],      'function');
	assert(typeof BASE['String'],   'function');

	assert(typeof BASE['isArray'],    'function');
	assert(typeof BASE['isBoolean'],  'function');
	assert(typeof BASE['isBuffer'],   'function');
	assert(typeof BASE['isDate'],     'function');
	assert(typeof BASE['isEmitter'],  'function');
	assert(typeof BASE['isFunction'], 'function');
	assert(typeof BASE['isMap'],      'function');
	assert(typeof BASE['isNumber'],   'function');
	assert(typeof BASE['isObject'],   'function');
	assert(typeof BASE['isRegExp'],   'function');
	assert(typeof BASE['isSet'],      'function');
	assert(typeof BASE['isString'],   'function');

	assert(Object.keys(BASE), [

		'console',

		'Array',
		'Boolean',
		'Buffer',
		'Date',
		'Emitter',
		'Function',
		'Map',
		'Number',
		'Object',
		'RegExp',
		'Set',
		'String',

		'isArray',
		'isBoolean',
		'isBuffer',
		'isDate',
		'isEmitter',
		'isFunction',
		'isMap',
		'isNumber',
		'isObject',
		'isRegExp',
		'isSet',
		'isString'

	]);

});


export default finish('base/MODULE', {
	internet: false,
	network:  false
});

