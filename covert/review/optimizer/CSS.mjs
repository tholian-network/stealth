
import { config, sketch } from '../../EXAMPLE.mjs';
import { isArray, isObject, isString } from '../../source/POLYFILLS.mjs';

import { after, before, describe, finish } from '../../source/Review.mjs';

import { Optimizer } from '../../../stealth/source/optimizer/CSS.mjs';

const SIMPLE_CFG = config('css/simple.css');
const SIMPLE_REF = sketch('css/simple.css');

const COMPLEX_CFG = config('css/complex.css');
const COMPLEX_REF = sketch('css/complex.css');

const MINIFIED_CFG = config('css/minified.css');
const MINIFIED_REF = sketch('css/minified.css');



before('prepare', function(assert) {

	this.simple   = { ref: SIMPLE_REF,   cfg: SIMPLE_CFG   };
	this.complex  = { ref: COMPLEX_REF,  cfg: COMPLEX_CFG  };
	this.minified = { ref: MINIFIED_REF, cfg: MINIFIED_CFG };

	assert(this.simple !== null);
	assert(this.complex !== null);
	assert(this.minified !== null);

});

describe('optimize/simple', function(assert) {

	assert(this.simple !== null);
	assert(typeof Optimizer.optimize === 'function');

	Optimizer.optimize(this.simple.ref, this.simple.cfg, (response) => {

		assert(response !== null);

	});

});


after('cleanup', function(assert) {

	this.simple   = null;
	this.complex  = null;
	this.minified = null;

	assert(this.simple === null);
	assert(this.complex === null);
	assert(this.minified === null);

});



export default finish('optimizer/CSS');

