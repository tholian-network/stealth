
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

	// Map sources to review.id
	'browser/Buffer':  'Buffer',
	'browser/console': 'console',

	'node/Buffer':     'Buffer',
	'node/console':    'console',

	// Map review.id to sources
	'Buffer':          'browser/Buffer',
	'console':         'node/console',

	// Ignore
	'MODULE':          null

};

