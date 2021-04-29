
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
	assert(typeof STEALTH['isMode'],     'function');
	assert(typeof STEALTH['isRequest'],  'function');
	assert(typeof STEALTH['isServer'],   'function');
	assert(typeof STEALTH['isSession'],  'function');
	assert(typeof STEALTH['isSettings'], 'function');
	assert(typeof STEALTH['isStealth'],  'function');
	assert(typeof STEALTH['isTab'],      'function');

	assert(typeof STEALTH['client'],             'object');
	assert(typeof STEALTH['client']['Beacon'],   'function');
	assert(typeof STEALTH['client']['Blocker'],  'function');
	assert(typeof STEALTH['client']['Cache'],    'function');
	assert(typeof STEALTH['client']['Host'],     'function');
	assert(typeof STEALTH['client']['Mode'],     'function');
	assert(typeof STEALTH['client']['Peer'],     'function');
	assert(typeof STEALTH['client']['Policy'],   'function');
	assert(typeof STEALTH['client']['Redirect'], 'function');
	assert(typeof STEALTH['client']['Session'],  'function');
	assert(typeof STEALTH['client']['Settings'], 'function');
	assert(typeof STEALTH['client']['Stash'],    'function');

	assert(typeof STEALTH['connection'],          'object');
	assert(typeof STEALTH['connection']['DNS'],   'object');
	assert(typeof STEALTH['connection']['HTTP'],  'object');
	assert(typeof STEALTH['connection']['HTTPS'], 'object');
	assert(typeof STEALTH['connection']['SOCKS'], 'object');
	assert(typeof STEALTH['connection']['WS'],    'object');
	assert(typeof STEALTH['connection']['WSS'],   'object');

	assert(typeof STEALTH['parser'],             'object');
	assert(typeof STEALTH['parser']['CSS'],      'object');
	assert(typeof STEALTH['parser']['DATETIME'], 'object');
	assert(typeof STEALTH['parser']['HOSTS'],    'object');
	assert(typeof STEALTH['parser']['HTML'],     'object');
	assert(typeof STEALTH['parser']['IP'],       'object');
	assert(typeof STEALTH['parser']['UA'],       'object');
	assert(typeof STEALTH['parser']['URL'],      'object');

	assert(typeof STEALTH['server'],             'object');
	assert(typeof STEALTH['server']['Beacon'],   'function');
	assert(typeof STEALTH['server']['Blocker'],  'function');
	assert(typeof STEALTH['server']['Cache'],    'function');
	assert(typeof STEALTH['server']['Host'],     'function');
	assert(typeof STEALTH['server']['Mode'],     'function');
	assert(typeof STEALTH['server']['Peer'],     'function');
	assert(typeof STEALTH['server']['Policy'],   'function');
	assert(typeof STEALTH['server']['Redirect'], 'function');
	assert(typeof STEALTH['server']['Session'],  'function');
	assert(typeof STEALTH['server']['Settings'], 'function');
	assert(typeof STEALTH['server']['Stash'],    'function');

	assert(Object.keys(STEALTH).sort(), [
		'Browser',
		'Client',
		'ENVIRONMENT',
		'Request',
		'Server',
		'Session',
		'Settings',
		'Stealth',
		'Tab',
		'client',
		'connection',
		'isBrowser',
		'isClient',
		'isMode',
		'isRequest',
		'isServer',
		'isSession',
		'isSettings',
		'isStealth',
		'isTab',
		'parser',
		'server'
	]);

});


export default finish('stealth/MODULE', {
	internet: false,
	network:  false
});

