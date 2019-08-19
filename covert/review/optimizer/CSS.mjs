
import { config, sketch } from '../../EXAMPLE.mjs';
import { isArray, isObject, isString } from '../../source/POLYFILLS.mjs';

import { after, before, describe, finish } from '../../source/Review.mjs';

import { Optimizer } from '../../../stealth/source/optimizer/CSS.mjs';

const SIMPLE_CFG = config('css/simple.css');
const SIMPLE_REF = sketch('css/simple.css');


const PAYLOAD_SIMPLE   = sketch('css/simple.css');
const PAYLOAD_COMPLEX  = sketch('css/complex.css');
const PAYLOAD_MINIFIED = sketch('css/complex.min.css');



before('prepare', function(assert) {

	this.simple   = Optimizer.optimize(SIMPLE_REF, SIMPLE_CFG);
	this.complex  = Optimizer.optimize(PAYLOAD_COMPLEX);
	this.minified = Optimizer.optimize(PAYLOAD_MINIFIED);

	assert(this.simple !== null);
	assert(this.complex !== null);
	assert(this.minified !== null);

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

