
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { Optimizer                                } from '../../../stealth/source/optimizer/CSS.mjs';



before('prepare', function(assert) {

	this.simple = {
		ref:    EXAMPLE.sketch('css/simple.css'),
		config: EXAMPLE.config('css/simple.css')
	};

	this.complex = {
		ref:    EXAMPLE.sketch('css/complex.css'),
		config: EXAMPLE.config('css/complex.css')
	};

	this.minified = {
		ref:    EXAMPLE.sketch('css/minified.css'),
		config: EXAMPLE.config('css/minified.css')
	};

	assert(this.simple !== null);
	assert(this.complex !== null);
	assert(this.minified !== null);

});

describe('optimize/simple', function(assert) {

	assert(this.simple !== null);
	assert(typeof Optimizer.optimize === 'function');

	Optimizer.optimize(this.simple.ref, this.simple.config, (response) => {

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


export default finish('stealth/optimizer/CSS');

