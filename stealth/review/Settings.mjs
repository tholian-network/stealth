
import { isArray                } from '../../base/index.mjs';
import { describe, finish       } from '../../covert/index.mjs';
import { ENVIRONMENT as SANDBOX } from '../../covert/index.mjs';
import { Filesystem             } from '../../covert/index.mjs';
import { ENVIRONMENT            } from '../../stealth/source/ENVIRONMENT.mjs';
import { Settings, isSettings   } from '../../stealth/source/Settings.mjs';



const FILESYSTEM = new Filesystem();

const read_file = (path) => {

	let data = null;

	try {
		data = JSON.parse(FILESYSTEM.read(path));
	} catch (err) {
		data = null;
	}

	return data;

};



describe('new Settings()', function(assert) {

	let settings1 = new Settings({
		profile: null,
		vendor:  null
	});

	let sandbox   = SANDBOX.mktemp('stealth/Settings', 8);
	let settings2 = new Settings({
		profile: sandbox + '/profile',
		vendor:  sandbox + '/vendor'
	});

	assert(Settings.isSettings(settings1), true);
	assert(isSettings(settings1),          true);
	assert(settings1.profile,              ENVIRONMENT.profile);
	assert(settings1.vendor,               null);

	assert(Settings.isSettings(settings2), true);
	assert(isSettings(settings2),          true);
	assert(settings2.profile,              sandbox + '/profile');
	assert(settings2.vendor,               sandbox + '/vendor');

});

describe('Settings.from()', function(assert) {

	let sandbox  = SANDBOX.mktemp('stealth/Settings', 8);
	let settings = Settings.from({
		type: 'Settings',
		data: {
			'internet': {
				connection: 'mobile',
				history:    'forever',
				useragent:  'spider-desktop'
			},
			'hosts': [{
				domain: 'covert.localdomain',
				hosts: [{
					ip:    '127.0.0.1',
					scope: 'private',
					type:  'v4'
				}]
			}],
			'modes': [{
				domain: 'covert.localdomain',
				mode: {
					text:  true,
					image: true,
					audio: true,
					video: true,
					other: true
				}
			}],
			'peers': [{
				domain: 'covert.localdomain',
				peer:   {
					connection: 'mobile'
				}
			}],
			'policies': [{
				domain:   'covert.localdomain',
				policies: [{
					path:  '/policy',
					query: 'sort&type'
				}]
			}],
			'profile': sandbox,
			'redirects': [{
				domain:   'covert.localdomain',
				redirects: [{
					path:     '/redirect',
					query:    null,
					location: 'https://covert.localdomain/location.html'
				}]
			}],
			'sessions': [{
				type: 'Session',
				data: {
					domain:  'covert-two.localdomain',
					warning: 1
				}
			}],
			'vendor': null
		}
	});

	assert(settings['profile'], sandbox);
	assert(settings['vendor'],  null);

	assert(settings['interface'], {
		theme:   'dark',
		enforce: false,
		opentab: 'stealth:welcome'
	});

	assert(settings['internet'], {
		connection: 'mobile',
		history:    'forever',
		useragent:  'spider-desktop'
	});

	assert(settings['hosts'], [{
		domain: 'covert.localdomain',
		hosts: [{
			ip:    '127.0.0.1',
			scope: 'private',
			type:  'v4'
		}]
	}]);

	assert(settings['modes'], [{
		domain: 'covert.localdomain',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	}]);

	assert(settings['peers'], [{
		domain: 'covert.localdomain',
		peer:   {
			connection: 'mobile'
		}
	}]);

	assert(settings['policies'], [{
		domain:   'covert.localdomain',
		policies: [{
			path:  '/policy',
			query: 'sort&type'
		}]
	}]);

	assert(settings['redirects'], [{
		domain:    'covert.localdomain',
		redirects: [{
			path:     '/redirect',
			query:    null,
			location: 'https://covert.localdomain/location.html'
		}]
	}]);

	assert(settings['sessions'].length,     1);
	assert(settings['sessions'][0].domain,  'covert-two.localdomain');
	assert(settings['sessions'][0].warning, 1);

});

describe('Settings.isSettings()', function(assert) {

	let settings = new Settings();

	assert(typeof Settings.isSettings, 'function');

	assert(Settings.isSettings(settings), true);

});

describe('isSettings()', function(assert) {

	let settings = new Settings();

	assert(typeof isSettings, 'function');

	assert(isSettings(settings), true);

});

describe('Settings.prototype.toJSON()', function(assert) {

	let sandbox  = SANDBOX.mktemp('stealth/Settings', 8);
	let settings = Settings.from({
		type: 'Settings',
		data: {
			'interface': {
				theme:   'light',
				enforce: true,
				opentab: 'stealth:blank'
			},
			'internet': {
				connection: 'mobile',
				history:    'forever',
				useragent:  'spider-desktop'
			},
			'beacons':  [{
				domain: 'covert.localdomain',
				beacons: [{
					path:   '/news/*',
					query:  null,
					select: 'article h1',
					term:   'title'
				}]
			}],
			'hosts': [{
				domain: 'covert.localdomain',
				hosts: [{
					ip:    '127.0.0.1',
					scope: 'private',
					type:  'v4'
				}]
			}],
			'modes': [{
				domain: 'covert.localdomain',
				mode: {
					text:  true,
					image: true,
					audio: true,
					video: true,
					other: true
				}
			}],
			'peers': [{
				domain: 'covert.localdomain',
				peer:   {
					connection: 'mobile'
				}
			}],
			'policies': [{
				domain:   'covert.localdomain',
				policies: [{
					path:  '/policy',
					query: 'sort&type'
				}]
			}],
			'profile': sandbox,
			'redirects': [{
				domain:   'covert.localdomain',
				redirects: [{
					path:     '/redirect',
					query:    null,
					location: 'https://covert.localdomain/location.html'
				}]
			}],
			'sessions': [{
				type: 'Session',
				data: {
					domain:  'covert-two.localdomain',
					warning: 1
				}
			}],
			'vendor': null
		}
	});

	let json = settings.toJSON();

	assert(json.type, 'Settings');
	assert(json.data, {
		'interface': {
			theme:   'light',
			enforce: true,
			opentab: 'stealth:blank'
		},
		'internet': {
			connection: 'mobile',
			history:    'forever',
			useragent:  'spider-desktop'
		},
		'beacons':  [{
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}]
		}],
		'blockers': null,
		'hosts': [{
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		}],
		'modes': [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}],
		'peers': [{
			domain: 'covert.localdomain',
			peer:   {
				connection: 'mobile'
			}
		}],
		'policies': [{
			domain:   'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		}],
		'profile': sandbox,
		'redirects': [{
			domain:   'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		}],
		'sessions': [{
			type: 'Session',
			data: {
				agent:   null,
				domain:  'covert-two.localdomain',
				tabs:    [],
				warning: 1
			}
		}],
		'vendor': null
	});

});

describe('Settings.prototype.read()', function(assert) {

	let sandbox  = SANDBOX.mktemp('stealth/Settings', 8);
	let settings = Settings.from({
		type: 'Settings',
		data: {
			'interface': {
				theme:   'light',
				enforce: true,
				opentab: 'stealth:welcome'
			},
			'internet': {
				connection: 'mobile',
				history:    'forever',
				useragent:  'spider-desktop'
			},
			'beacons': [{
				domain: 'covert.localdomain',
				beacons: [{
					path:   '/news/*',
					query:  null,
					select: 'article h1',
					term:   'title'
				}]
			}],
			'blockers': [{
				domain: 'malicious.example.com'
			}],
			'hosts': [{
				domain: 'covert.localdomain',
				hosts: [{
					ip:    '127.0.0.1',
					scope: 'private',
					type:  'v4'
				}]
			}],
			'modes': [{
				domain: 'covert.localdomain',
				mode: {
					text:  true,
					image: true,
					audio: true,
					video: true,
					other: true
				}
			}],
			'peers': [{
				domain: 'covert.localdomain',
				peer:   {
					connection: 'mobile'
				}
			}],
			'policies': [{
				domain:   'covert.localdomain',
				policies: [{
					path:  '/policy',
					query: 'sort&type'
				}]
			}],
			'profile': sandbox,
			'redirects': [{
				domain:   'covert.localdomain',
				redirects: [{
					path:     '/redirect',
					query:    null,
					location: 'https://covert.localdomain/location.html'
				}]
			}],
			'sessions': [{
				type: 'Session',
				data: {
					domain:  'covert-two.localdomain',
					warning: 1
				}
			}],
			'vendor': null
		}
	});

	settings.read(false, (result) => {
		assert(result, true);
	});

	setTimeout(() => {

		assert(read_file(sandbox + '/interface.json'), {
			theme:   'light',
			enforce: true,
			opentab: 'stealth:welcome'
		});

		assert(read_file(sandbox + '/internet.json'), {
			connection: 'mobile',
			history:    'forever',
			useragent:  'spider-desktop'
		});

		assert(read_file(sandbox + '/beacons.json'), [{
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}]
		}]);

		assert(read_file(sandbox + '/blockers.json'), [{
			domain: 'malicious.example.com'
		}]);

		assert(read_file(sandbox + '/hosts.json'), [{
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		}]);

		assert(read_file(sandbox + '/modes.json'), [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}]);

		assert(read_file(sandbox + '/peers.json'), [{
			domain: 'covert.localdomain',
			peer:   {
				connection: 'mobile'
			}
		}]);

		assert(read_file(sandbox + '/policies.json'), [{
			domain:   'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		}]);

		assert(read_file(sandbox + '/redirects.json'), [{
			domain:   'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		}]);

		assert(read_file(sandbox + '/sessions.json'), [{
			type: 'Session',
			data: {
				agent:   null,
				domain:  'covert-two.localdomain',
				tabs:    [],
				warning: 1
			}
		}]);

	}, 100);

});

describe('Settings.prototype.save()', function(assert) {

	let sandbox  = SANDBOX.mktemp('stealth/Settings', 8);
	let settings = Settings.from({
		type: 'Settings',
		data: {
			profile: sandbox,
			vendor: null
		}
	});

	settings.save(true, (result) => {
		assert(result, true);
	});

	setTimeout(() => {

		assert(read_file(sandbox + '/interface.json'), {
			theme:   'dark',
			enforce: false,
			opentab: 'stealth:welcome'
		});

		assert(read_file(sandbox + '/internet.json'), {
			connection: 'mobile',
			history:    'stealth',
			useragent:  'stealth'
		});

		assert(read_file(sandbox + '/beacons.json'),   []);
		assert(read_file(sandbox + '/blockers.json'),  []);

		// Native Hosts (/etc/hosts) differ on machines
		assert(isArray(read_file(sandbox + '/hosts.json')), true);

		assert(read_file(sandbox + '/modes.json'),     []);
		assert(read_file(sandbox + '/peers.json'),     []);
		assert(read_file(sandbox + '/policies.json'),  []);
		assert(read_file(sandbox + '/redirects.json'), []);
		assert(read_file(sandbox + '/sessions.json'),  []);

	}, 100);

	setTimeout(() => {

		settings['interface'] = {
			theme:   'light',
			enforce: true,
			opentab: 'stealth:blank'
		};

		settings['internet'] = {
			connection: 'mobile',
			history:    'forever',
			useragent:  'spider-desktop'
		};

		settings['beacons'] = [{
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}]
		}];

		settings['blockers'] = [{
			domain: 'malicious.example.com'
		}];

		settings['hosts'] = [{
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		}];

		settings['modes'] = [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}];

		settings['peers'] = [{
			domain: 'covert.localdomain',
			peer:   {
				connection: 'mobile'
			}
		}];

		settings['policies'] = [{
			domain:   'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		}];

		settings['redirects'] = [{
			domain:   'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		}];

		settings['sessions'] = [{
			type: 'Session',
			data: {
				domain:  'covert-two.localdomain',
				warning: 1
			}
		}];

		settings.save(true, (result) => {
			assert(result, true);
		});

	}, 200);

	setTimeout(() => {

		assert(read_file(sandbox + '/interface.json'), {
			theme:   'light',
			enforce: true,
			opentab: 'stealth:blank'
		});

		assert(read_file(sandbox + '/internet.json'), {
			connection: 'mobile',
			history:    'forever',
			useragent:  'spider-desktop'
		});

		assert(read_file(sandbox + '/beacons.json'), [{
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}]
		}]);

		assert(read_file(sandbox + '/blockers.json'), []);

		assert(read_file(sandbox + '/hosts.json'), [{
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		}]);

		assert(read_file(sandbox + '/modes.json'), [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}]);

		assert(read_file(sandbox + '/peers.json'), [{
			domain: 'covert.localdomain',
			peer:   {
				connection: 'mobile'
			}
		}]);

		assert(read_file(sandbox + '/policies.json'), [{
			domain:   'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		}]);

		assert(read_file(sandbox + '/redirects.json'), [{
			domain:   'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		}]);

		assert(read_file(sandbox + '/sessions.json'), [{
			type: 'Session',
			data: {
				agent:   null,
				domain:  'covert-two.localdomain',
				tabs:    [],
				warning: 1
			}
		}]);

	}, 300);

});


export default finish('stealth/Settings');

