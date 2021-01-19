
import { describe, finish } from '../../covert/index.mjs';
import { Map, isMap       } from '../source/Map.mjs';



describe('Map.isMap()', function(assert) {

	let map1 = new Map();
	let map2 = new Map([
		[ 1, 'l' ],
		[ 3, 'e' ],
		[ 3, 'e' ],
		[ 7, 't' ]
	]);

	assert(typeof Map.isMap, 'function');

	assert(Map.isMap(map1), true);
	assert(Map.isMap(map2), true);

});

describe('isMap()', function(assert) {

	let map1 = new Map();
	let map2 = new Map([
		[ 1, 'l' ],
		[ 3, 'e' ],
		[ 3, 'e' ],
		[ 7, 't' ]
	]);

	assert(typeof isMap, 'function');

	assert(isMap(map1), true);
	assert(isMap(map2), true);

});

describe('Map.prototype.toString()', function(assert) {

	let map1 = new Map();
	let map2 = new Map([
		[ 1, 'l' ],
		[ 3, 'e' ],
		[ 3, 'e' ],
		[ 7, 't' ]
	]);

	assert(Object.prototype.toString.call(map1), '[object Map]');
	assert(Object.prototype.toString.call(map2), '[object Map]');

	assert((map1).toString(), '[object Map]');
	assert((map2).toString(), '[object Map]');

});

describe('Map.prototype.valueOf()', function(assert) {

	let map1 = new Map();
	let map2 = new Map([
		[ 1, 'l' ],
		[ 3, 'e' ],
		[ 3, 'e' ],
		[ 7, 't' ]
	]);

	assert((map1).valueOf(), new Map());
	assert((map2).valueOf(), new Map([ [1,'l'], [3,'e'], [7,'t'] ]));

	assert(JSON.stringify(map1), '{}');
	assert(JSON.stringify(map2), '{}');

});


export default finish('base/Map', {
	internet: false,
	network:  false
});

