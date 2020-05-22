
import { describe, finish       } from '../../covert/index.mjs';
import { ENVIRONMENT as SANDBOX } from '../../covert/index.mjs';
import { ENVIRONMENT            } from '../../stealth/source/ENVIRONMENT.mjs';
import { Settings, isSettings   } from '../../stealth/source/Settings.mjs';



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
			internet: {
				connection: 'mobile',
				history:    'forever',
				useragent:  'spider-desktop'
			},
			hosts: [{
				domain: 'covert.localdomain',
				hosts: [{
					ip:    '127.0.0.1',
					scope: 'private',
					type:  'v4'
				}]
			}],
			modes: [{
				domain: 'covert.localdomain',
				mode: {
					text:  true,
					image: true,
					audio: true,
					video: true,
					other: true
				}
			}],
			peers: [{
				domain:     'covert.localdomain',
				connection: 'mobile'
			}],
			profile: sandbox,
			redirects: [{
				domain:   'covert.localdomain',
				path:     '/redirect',
				location: 'https://covert.localdomain/location.html'
			}],
			sessions: [{
				type: 'Session',
				data: {
					domain:  'covert-two.localdomain',
					warning: 1
				}
			}],
			vendor: null
		}
	});

	assert(settings.profile, sandbox);
	assert(settings.vendor,  null);

	assert(settings.internet, {
		connection: 'mobile',
		history:    'forever',
		useragent:  'spider-desktop'
	});

	assert(settings.hosts, [{
		domain: 'covert.localdomain',
		hosts: [{
			ip:    '127.0.0.1',
			scope: 'private',
			type:  'v4'
		}]
	}]);

	assert(settings.modes, [{
		domain: 'covert.localdomain',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	}]);

	assert(settings.peers, [{
		domain:     'covert.localdomain',
		connection: 'mobile'
	}]);

	assert(settings.redirects, [{
		domain:   'covert.localdomain',
		path:     '/redirect',
		location: 'https://covert.localdomain/location.html'
	}]);

	assert(settings.sessions.length,     1);
	assert(settings.sessions[0].domain,  'covert-two.localdomain');
	assert(settings.sessions[0].warning, 1);

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
			internet: {
				connection: 'mobile',
				history:    'forever',
				useragent:  'spider-desktop'
			},
			hosts: [{
				domain: 'covert.localdomain',
				hosts: [{
					ip:    '127.0.0.1',
					scope: 'private',
					type:  'v4'
				}]
			}],
			modes: [{
				domain: 'covert.localdomain',
				mode: {
					text:  true,
					image: true,
					audio: true,
					video: true,
					other: true
				}
			}],
			peers: [{
				domain:     'covert.localdomain',
				connection: 'mobile'
			}],
			profile: sandbox,
			redirects: [{
				domain:   'covert.localdomain',
				path:     '/redirect',
				location: 'https://covert.localdomain/location.html'
			}],
			sessions: [{
				type: 'Session',
				data: {
					domain:  'covert-two.localdomain',
					warning: 1
				}
			}],
			vendor: null
		}
	});

	let json = settings.toJSON();

	assert(json.type, 'Settings');
	assert(json.data, {
		internet: {
			connection: 'mobile',
			history:    'forever',
			useragent:  'spider-desktop'
		},
		blockers: null,
		hosts: [{
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		}],
		modes: [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}],
		peers: [{
			domain:     'covert.localdomain',
			connection: 'mobile'
		}],
		profile: sandbox,
		redirects: null,
		sessions: [{
			type: 'Session',
			data: {
				agent:   null,
				domain:  'covert-two.localdomain',
				tabs:    [],
				warning: 1
			}
		}],
		vendor: null
	});

});


export default finish('stealth/Settings');

