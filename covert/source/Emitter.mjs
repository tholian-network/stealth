
import { after, before, describe } from './TESTSUITE.mjs';

import { Emitter } from '../../stealth.source/Emitter.mjs';



before('emitter', (assert, expect) => {
	this.emitter = new Emitter();
});

after('emitter', (assert, expect) => {
	this.emitter = null;
});

