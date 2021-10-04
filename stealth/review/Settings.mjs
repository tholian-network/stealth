
import { isArray, isFunction    } from '../../base/index.mjs';
import { describe, finish       } from '../../covert/index.mjs';
import { ENVIRONMENT as SANDBOX } from '../../covert/index.mjs';
import { ENVIRONMENT            } from '../../stealth/source/ENVIRONMENT.mjs';
import { Settings, isSettings   } from '../../stealth/source/Settings.mjs';
import { VERSION                } from '../../stealth/source/Stealth.mjs';



const read = (sandbox, url) => {

	let data = null;

	let buffer = SANDBOX.read(sandbox, url);
	if (buffer !== null) {

		try {
			data = JSON.parse(buffer);
		} catch (err) {
			data = null;
		}

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

	assert(isFunction(Settings.from), true);

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
					certificate: null,
					connection: 'mobile',
					version:    VERSION
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
		assistant: false,
		theme:     'dark',
		enforce:   false,
		opentab:   'stealth:welcome'
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
			certificate: null,
			connection: 'mobile',
			version:    VERSION
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

	assert(isFunction(Settings.isSettings), true);

	assert(Settings.isSettings(settings), true);

});

describe('isSettings()', function(assert) {

	let settings = new Settings();

	assert(isFunction(isSettings), true);

	assert(isSettings(settings), true);

});

describe('Settings.prototype.toJSON()', function(assert) {

	let sandbox  = SANDBOX.mktemp('stealth/Settings', 8);
	let settings = Settings.from({
		type: 'Settings',
		data: {
			'interface': {
				assistant: true,
				theme:     'light',
				enforce:   true,
				opentab:   'stealth:blank'
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
			assistant: true,
			theme:     'light',
			enforce:   true,
			opentab:   'stealth:blank'
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
		'blockers': [],
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
				assistant: true,
				theme:     'light',
				enforce:   true,
				opentab:   'stealth:welcome'
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

		assert(read(sandbox, '/interface.json'), {
			assistant: true,
			theme:     'light',
			enforce:   true,
			opentab:   'stealth:welcome'
		});

		assert(read(sandbox, '/internet.json'), {
			connection: 'mobile',
			history:    'forever',
			useragent:  'spider-desktop'
		});

		assert(read(sandbox, '/beacons.json'), [{
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}]
		}]);

		assert(read(sandbox, '/blockers.json'), [{
			domain: 'malicious.example.com'
		}]);

		assert(read(sandbox, '/hosts.json'), [{
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		}]);

		assert(read(sandbox, '/modes.json'), [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}]);

		assert(read(sandbox, '/peers.json'), [{
			domain: 'covert.localdomain',
			peer:   {
				connection: 'mobile'
			}
		}]);

		assert(read(sandbox, '/policies.json'), [{
			domain:   'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		}]);

		assert(read(sandbox, '/redirects.json'), [{
			domain:   'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		}]);

		assert(read(sandbox, '/sessions.json'), [{
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

		assert(read(sandbox, '/interface.json'), {
			assistant: false,
			theme:     'dark',
			enforce:   false,
			opentab:   'stealth:welcome'
		});

		assert(read(sandbox, '/internet.json'), {
			connection: 'mobile',
			history:    'stealth',
			useragent:  'stealth'
		});

		assert(read(sandbox, '/beacons.json'),   []);
		assert(read(sandbox, '/blockers.json'),  []);

		// Native Hosts (/etc/hosts) differ on machines
		assert(isArray(read(sandbox, '/hosts.json')), true);

		assert(read(sandbox, '/modes.json'),     []);
		assert(read(sandbox, '/peers.json'),     []);
		assert(read(sandbox, '/policies.json'),  []);
		assert(read(sandbox, '/redirects.json'), []);
		assert(read(sandbox, '/sessions.json'),  []);

	}, 100);

	setTimeout(() => {

		settings['interface'] = {
			assistant: true,
			theme:     'light',
			enforce:   true,
			opentab:   'stealth:blank'
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
				certificate: null,
				connection: 'broadband',
				version:    VERSION
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

		assert(read(sandbox, '/interface.json'), {
			assistant: true,
			theme:     'light',
			enforce:   true,
			opentab:   'stealth:blank'
		});

		assert(read(sandbox, '/internet.json'), {
			connection: 'mobile',
			history:    'forever',
			useragent:  'spider-desktop'
		});

		assert(read(sandbox, '/beacons.json'), [{
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}]
		}]);

		assert(read(sandbox, '/blockers.json'), []);

		assert(read(sandbox, '/hosts.json'), [{
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		}]);

		assert(read(sandbox, '/modes.json'), [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}]);

		assert(read(sandbox, '/peers.json'), [{
			domain: 'covert.localdomain',
			peer:   {
				certificate: null,
				connection: 'broadband',
				version:    VERSION
			}
		}]);

		assert(read(sandbox, '/policies.json'), [{
			domain:   'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		}]);

		assert(read(sandbox, '/redirects.json'), [{
			domain:   'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		}]);

		assert(read(sandbox, '/sessions.json'), [{
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


export default finish('stealth/Settings', {
	internet: false,
	network:  true
});

