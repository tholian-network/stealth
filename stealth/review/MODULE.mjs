
import { describe, finish } from '../../covert/index.mjs';
import * as STEALTH         from '../../stealth/index.mjs';



describe('MODULE', function(assert) {

	assert(typeof STEALTH['Browser'],     'function');
	assert(typeof STEALTH['Client'],      'function');
	assert(typeof STEALTH['ENVIRONMENT'], 'object');
	assert(typeof STEALTH['Request'],     'function');
	assert(typeof STEALTH['Server'],      'function');
	assert(typeof STEALTH['Session'],     'function');
	assert(typeof STEALTH['Settings'],    'function');
	assert(typeof STEALTH['Stealth'],     'function');
	assert(typeof STEALTH['Tab'],         'function');

	assert(typeof STEALTH['isBrowser'],  'function');
	assert(typeof STEALTH['isClient'],   'function');
	assert(typeof STEALTH['isConfig'],   'function');
	assert(typeof STEALTH['isRequest'],  'function');
	assert(typeof STEALTH['isServer'],   'function');
	assert(typeof STEALTH['isSession'],  'function');
	assert(typeof STEALTH['isSettings'], 'function');
	assert(typeof STEALTH['isStealth'],  'function');
	assert(typeof STEALTH['isTab'],      'function');

	assert(Object.keys(STEALTH), [
		'Browser',
		'Client',
		'ENVIRONMENT',
		'Request',
		'Server',
		'Session',
		'Settings',
		'Stealth',
		'Tab',
		'isBrowser',
		'isClient',
		'isConfig',
		'isRequest',
		'isServer',
		'isSession',
		'isSettings',
		'isStealth',
		'isTab'
	]);

});


export default finish('stealth/MODULE');

