
import _console  from './console.mjs';
import _Array    from './Array.mjs';
import _Boolean  from './Boolean.mjs';
import _Buffer   from './Buffer.mjs';
import _Date     from './Date.mjs';
import Emitter   from './Emitter.mjs';
import _Function from './Function.mjs';
import _Map      from './Map.mjs';
import MODULE    from './MODULE.mjs';
import _Number   from './Number.mjs';
import _Object   from './Object.mjs';
import _RegExp   from './RegExp.mjs';
import _Set      from './Set.mjs';
import _String   from './String.mjs';



export const REVIEWS = [

	MODULE,

	_console,

	_Array,
	_Boolean,
	_Buffer,
	_Date,
	Emitter,
	_Function,
	_Map,
	_Number,
	_Object,
	_RegExp,
	_Set,
	_String

];

export const SOURCES = {

	// Map source.id to review.id
	'base/browser/Buffer':  'base/Buffer',
	'base/browser/console': 'base/console',
	'base/node/Buffer':     'base/Buffer',
	'base/node/console':    'base/console',

	// Map review.id to source.id
	'base/Buffer':          'base/browser/Buffer',
	'base/console':         'base/node/console'

};

