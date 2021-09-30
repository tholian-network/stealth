
import { describe, finish } from '../../covert/index.mjs';
import STEALTH              from '../../stealth/index.mjs';



describe('MODULE', function(assert) {

	assert(typeof STEALTH['Browser'],     'function');
	assert(typeof STEALTH['Client'],      'function');
	assert(typeof STEALTH['Download'],    'function');
	assert(typeof STEALTH['ENVIRONMENT'], 'object');
	assert(typeof STEALTH['Request'],     'function');
	assert(typeof STEALTH['Server'],      'function');
	assert(typeof STEALTH['Session'],     'function');
	assert(typeof STEALTH['Settings'],    'function');
	assert(typeof STEALTH['Stealth'],     'function');
	assert(typeof STEALTH['Tab'],         'function');
	assert(typeof STEALTH['VERSION'],     'string');

	assert(typeof STEALTH['isBrowser'],  'function');
	assert(typeof STEALTH['isClient'],   'function');
	assert(typeof STEALTH['isDownload'], 'function');
	assert(typeof STEALTH['isMode'],     'function');
	assert(typeof STEALTH['isRequest'],  'function');
	assert(typeof STEALTH['isServer'],   'function');
	assert(typeof STEALTH['isSession'],  'function');
	assert(typeof STEALTH['isSettings'], 'function');
	assert(typeof STEALTH['isStealth'],  'function');
	assert(typeof STEALTH['isTab'],      'function');

	assert(typeof STEALTH['client'],                        'object');
	assert(typeof STEALTH['client']['service'],             'object');
	assert(typeof STEALTH['client']['service']['Beacon'],   'function');
	assert(typeof STEALTH['client']['service']['Blocker'],  'function');
	assert(typeof STEALTH['client']['service']['Cache'],    'function');
	assert(typeof STEALTH['client']['service']['Host'],     'function');
	assert(typeof STEALTH['client']['service']['Mode'],     'function');
	assert(typeof STEALTH['client']['service']['Peer'],     'function');
	assert(typeof STEALTH['client']['service']['Policy'],   'function');
	assert(typeof STEALTH['client']['service']['Redirect'], 'function');
	assert(typeof STEALTH['client']['service']['Session'],  'function');
	assert(typeof STEALTH['client']['service']['Settings'], 'function');

	assert(typeof STEALTH['connection'],          'object');
	assert(typeof STEALTH['connection']['DNS'],   'object');
	assert(typeof STEALTH['connection']['DNSH'],  'object');
	assert(typeof STEALTH['connection']['DNSS'],  'object');
	assert(typeof STEALTH['connection']['HTTP'],  'object');
	assert(typeof STEALTH['connection']['HTTPS'], 'object');
	assert(typeof STEALTH['connection']['MDNS'],  'object');
	assert(typeof STEALTH['connection']['SOCKS'], 'object');
	assert(typeof STEALTH['connection']['WS'],    'object');
	assert(typeof STEALTH['connection']['WSS'],   'object');

	assert(typeof STEALTH['packet'],          'object');
	assert(typeof STEALTH['packet']['DNS'],   'object');
	assert(typeof STEALTH['packet']['HTTP'],  'object');
	assert(typeof STEALTH['packet']['SOCKS'], 'object');
	assert(typeof STEALTH['packet']['WS'],    'object');

	assert(typeof STEALTH['parser'],             'object');
	assert(typeof STEALTH['parser']['CSS'],      'object');
	assert(typeof STEALTH['parser']['DATETIME'], 'object');
	assert(typeof STEALTH['parser']['HOSTS'],    'object');
	assert(typeof STEALTH['parser']['HTML'],     'object');
	assert(typeof STEALTH['parser']['IP'],       'object');
	assert(typeof STEALTH['parser']['UA'],       'object');
	assert(typeof STEALTH['parser']['URL'],      'object');

	assert(typeof STEALTH['server'],                        'object');
	assert(typeof STEALTH['server']['Peerer'] ,             'function');
	assert(typeof STEALTH['server']['Proxy'],               'function');
	assert(typeof STEALTH['server']['Router'],              'function');
	assert(typeof STEALTH['server']['Services'],            'function');
	assert(typeof STEALTH['server']['Webproxy'],            'function');
	assert(typeof STEALTH['server']['Webserver'],           'function');
	assert(typeof STEALTH['server']['service'],             'object');
	assert(typeof STEALTH['server']['service']['Beacon'],   'function');
	assert(typeof STEALTH['server']['service']['Blocker'],  'function');
	assert(typeof STEALTH['server']['service']['Cache'],    'function');
	assert(typeof STEALTH['server']['service']['Host'],     'function');
	assert(typeof STEALTH['server']['service']['Mode'],     'function');
	assert(typeof STEALTH['server']['service']['Peer'],     'function');
	assert(typeof STEALTH['server']['service']['Policy'],   'function');
	assert(typeof STEALTH['server']['service']['Redirect'], 'function');
	assert(typeof STEALTH['server']['service']['Session'],  'function');
	assert(typeof STEALTH['server']['service']['Settings'], 'function');

	assert(Object.keys(STEALTH), [

		'client',
		'connection',
		'packet',
		'parser',
		'server',

		'isBrowser',
		'isClient',
		'isDownload',
		'isMode',
		'isRequest',
		'isServer',
		'isSession',
		'isSettings',
		'isStealth',
		'isTab',

		'Browser',
		'Client',
		'Download',
		'ENVIRONMENT',
		'Request',
		'Server',
		'Session',
		'Settings',
		'Stealth',
		'Tab',
		'VERSION'

	]);

});


export default finish('stealth/MODULE', {
	internet: false,
	network:  false
});

