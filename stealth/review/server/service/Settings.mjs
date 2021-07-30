
import { isArray, isFunction, isObject   } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { Settings                        } from '../../../../stealth/source/server/service/Settings.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



before(connect);

describe('new Settings()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.settings instanceof Settings, true);

});

describe('Settings.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.toJSON), true);

	assert(this.server.services.settings.toJSON(), {
		type: 'Settings Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Settings.prototype.info()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.info), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.info(null, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'info'
			},
			payload: {
				profile: defaults.profile,
				vendor:  defaults.vendor
			}
		});

	});

});

describe('Settings.prototype.read()/all', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read(null, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': defaults['interface'],
				'internet':  defaults['internet'],
				'beacons':   defaults['beacons'],
				'blockers':  defaults['blockers'],
				'hosts':     defaults['hosts'],
				'modes':     defaults['modes'],
				'peers':     defaults['peers'],
				'policies':  defaults['policies'],
				'redirects': defaults['redirects'],
				'sessions':  defaults['sessions']
			}
		});

	});

});

describe('Settings.prototype.read()/interface', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'interface': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': defaults['interface'],
				'internet':  null,
				'beacons':   null,
				'blockers':  null,
				'hosts':     null,
				'modes':     null,
				'peers':     null,
				'policies':  null,
				'redirects': null,
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/internet', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'internet': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  defaults['internet'],
				'beacons':   null,
				'blockers':  null,
				'hosts':     null,
				'modes':     null,
				'peers':     null,
				'policies':  null,
				'redirects': null,
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/beacons', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'beacons': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  null,
				'beacons':   defaults['beacons'],
				'blockers':  null,
				'hosts':     null,
				'modes':     null,
				'peers':     null,
				'policies':  null,
				'redirects': null,
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/blockers', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'blockers': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  null,
				'beacons':   null,
				'blockers':  defaults['blockers'],
				'hosts':     null,
				'modes':     null,
				'peers':     null,
				'policies':  null,
				'redirects': null,
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/hosts', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'hosts': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  null,
				'beacons':   null,
				'blockers':  null,
				'hosts':     defaults['hosts'],
				'modes':     null,
				'peers':     null,
				'policies':  null,
				'redirects': null,
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/modes', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'modes': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  null,
				'beacons':   null,
				'blockers':  null,
				'hosts':     null,
				'modes':     defaults['modes'],
				'peers':     null,
				'policies':  null,
				'redirects': null,
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/peers', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'peers': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  null,
				'beacons':   null,
				'blockers':  null,
				'hosts':     null,
				'modes':     null,
				'peers':     defaults['peers'],
				'policies':  null,
				'redirects': null,
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/policies', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'policies': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  null,
				'beacons':   null,
				'blockers':  null,
				'hosts':     null,
				'modes':     null,
				'peers':     null,
				'policies':  defaults['policies'],
				'redirects': null,
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/redirects', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'redirects': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  null,
				'beacons':   null,
				'blockers':  null,
				'hosts':     null,
				'modes':     null,
				'peers':     null,
				'policies':  null,
				'redirects': defaults['redirects'],
				'sessions':  null
			}
		});

	});

});

describe('Settings.prototype.read()/sessions', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		'sessions': true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				'interface': null,
				'internet':  null,
				'beacons':   null,
				'blockers':  null,
				'hosts':     null,
				'modes':     null,
				'peers':     null,
				'policies':  null,
				'redirects': null,
				'sessions':  defaults['sessions']
			}
		});

	});

});

describe('Settings.prototype.save()/all', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'interface': {
			theme:   'light',
			enforce: true,
			opentab: 'stealth:search'
		},
		'internet': {
			connection: 'mobile',
			history:    'week',
			useragent:  'stealth'
		},
		'beacons': [{
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}, {
				path:   '/news/*',
				query:  null,
				select: 'article p,article div',
				term:   'article'
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
			domain: 'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		}],
		'redirects': [{
			domain:   'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/all', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'interface': true,
		'internet':  true,
		'beacons':   true,
		'blockers':  true,
		'hosts':     true,
		'modes':     true,
		'peers':     true,
		'policies':  true,
		'redirects': true,
		'sessions':  true  // private
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isObject(response.payload), true);

		assert(response.headers, {
			service: 'settings',
			event:   'read'
		});

		assert(response.payload['interface'], {
			theme:   'light',
			enforce: true,
			opentab: 'stealth:search'
		});

		assert(response.payload['internet'], {
			connection: 'mobile',
			history:    'week',
			useragent:  'stealth'
		});

		let beacon   = response.payload['beacons'].find((b) => b.domain === 'covert.localdomain') || null;
		let blocker  = response.payload['blockers'].find((b) => b.domain === 'malicious.example.com') || null;
		let host     = response.payload['hosts'].find((h) => h.domain === 'covert.localdomain') || null;
		let mode     = response.payload['modes'].find((m) => m.domain === 'covert.localdomain') || null;
		let policy   = response.payload['policies'].find((p) => p.domain === 'covert.localdomain') || null;
		let redirect = response.payload['redirects'].find((r) => r.domain === 'covert.localdomain') || null;

		assert(beacon, {
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}, {
				path:   '/news/*',
				query:  null,
				select: 'article p,article div',
				term:   'article'
			}]
		});

		assert(blocker, null);

		assert(host, {
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		});

		assert(mode, {
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		});

		assert(response.payload['peers'], [{
			domain: 'covert.localdomain',
			peer:   {
				connection: 'mobile'
			}
		}]);

		assert(policy, {
			domain: 'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		});

		assert(redirect, {
			domain:    'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		});

		assert(response.payload['sessions'], []);

	});

});

describe('Settings.prototype.save()/interface', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'interface': {
			theme:   'dark',
			enforce: false,
			opentab: 'stealth:blank'
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/interface', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'interface': true
	}, (response) => {

		assert(response.payload['interface'], {
			theme:   'dark',
			enforce: false,
			opentab: 'stealth:blank'
		});

	});

});

describe('Settings.prototype.save()/internet', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'internet': {
			connection: 'broadband',
			history:    'stealth',
			useragent:  'stealth'
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/internet', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'internet': true
	}, (response) => {

		assert(response.payload['internet'], {
			connection: 'broadband',
			history:    'stealth',
			useragent:  'stealth'
		});

	});

});

describe('Settings.prototype.save()/beacons', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		beacons: [{
			domain: 'covert-two.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'meta[property="og:title"]',
				term:   'title'
			}, {
				path:   '/*',
				query:  null,
				select: 'article div,article figure,article p,article ul',
				term:   'article'
			}]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});


});

describe('Settings.prototype.read()/beacons', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		beacons: true
	}, (response) => {

		assert(isObject(response),                   true);
		assert(isObject(response.headers),           true);
		assert(isObject(response.payload),           true);
		assert(isArray(response.payload['beacons']), true);

		let beacon1 = response.payload['beacons'].find((b) => b.domain === 'covert.localdomain') || null;
		let beacon2 = response.payload['beacons'].find((b) => b.domain === 'covert-two.localdomain') || null;

		assert(beacon1, {
			domain: 'covert.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'article h1',
				term:   'title'
			}, {
				path:   '/news/*',
				query:  null,
				select: 'article p,article div',
				term:   'article'
			}]
		});

		assert(beacon2, {
			domain: 'covert-two.localdomain',
			beacons: [{
				path:   '/news/*',
				query:  null,
				select: 'meta[property="og:title"]',
				term:   'title'
			}, {
				path:   '/*',
				query:  null,
				select: 'article div,article figure,article p,article ul',
				term:   'article'
			}]
		});

	});

});

describe('Settings.prototype.save()/blockers', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'blockers': [{
			domain: 'malicious.example-two.com',
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/blockers', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'blockers': true
	}, (response) => {

		assert(isObject(response),                    true);
		assert(isObject(response.headers),            true);
		assert(isObject(response.payload),            true);
		assert(isArray(response.payload['blockers']), true);

		let blocker1 = response.payload['blockers'].find((b) => b.domain === 'malicious.example.com') || null;
		let blocker2 = response.payload['blockers'].find((b) => b.domain === 'malicious.example-two.com') || null;

		assert(blocker1, null);
		assert(blocker2, null);

	});

});

describe('Settings.prototype.save()/hosts', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'hosts': [{
			domain: 'covert-two.localdomain',
			hosts: [{
				ip:    '127.0.0.2',
				scope: 'private',
				type:  'v4'
			}]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/hosts', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'hosts': true,
	}, (response) => {

		assert(isObject(response),                 true);
		assert(isObject(response.headers),         true);
		assert(isObject(response.payload),         true);
		assert(isArray(response.payload['hosts']), true);

		let host1 = response.payload['hosts'].find((h) => h.domain === 'covert.localdomain') || null;
		let host2 = response.payload['hosts'].find((h) => h.domain === 'covert-two.localdomain') || null;

		assert(host1, {
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		});

		assert(host2, {
			domain: 'covert-two.localdomain',
			hosts: [{
				ip:    '127.0.0.2',
				scope: 'private',
				type:  'v4'
			}]
		});

	});

});

describe('Settings.prototype.save()/modes', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'modes': [{
			domain: 'covert-two.localdomain',
			mode: {
				text:  true,
				image: false,
				audio: true,
				video: false,
				other: true
			}
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/modes', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'modes': true,
	}, (response) => {

		assert(isObject(response),                 true);
		assert(isObject(response.headers),         true);
		assert(isObject(response.payload),         true);
		assert(isArray(response.payload['modes']), true);

		let mode1 = response.payload['modes'].find((m) => m.domain === 'covert.localdomain') || null;
		let mode2 = response.payload['modes'].find((m) => m.domain === 'covert-two.localdomain') || null;

		assert(mode1, {
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		});

		assert(mode2, {
			domain: 'covert-two.localdomain',
			mode: {
				text:  true,
				image: false,
				audio: true,
				video: false,
				other: true
			}
		});

	});

});

describe('Settings.prototype.save()/peers', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'peers': [{
			domain: 'covert-two.localdomain',
			peer:   {
				connection: 'peer'
			}
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/peers', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'peers': true,
	}, (response) => {

		assert(isObject(response),                 true);
		assert(isObject(response.headers),         true);
		assert(isObject(response.payload),         true);
		assert(isArray(response.payload['peers']), true);

		let peer1 = response.payload['peers'].find((p) => p.domain === 'covert.localdomain') || null;
		let peer2 = response.payload['peers'].find((p) => p.domain === 'covert-two.localdomain') || null;

		assert(peer1, {
			domain: 'covert.localdomain',
			peer:   {
				connection: 'mobile'
			}
		});

		assert(peer2, {
			domain: 'covert-two.localdomain',
			peer:   {
				connection: 'peer'
			}
		});

	});

});

describe('Settings.prototype.save()/policies', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'policies': [{
			domain:   'covert-two.localdomain',
			policies: [{
				path:  '/policy',
				query: 'q&search'
			}]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/policies', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'policies': true
	}, (response) => {

		assert(isObject(response),                    true);
		assert(isObject(response.headers),            true);
		assert(isObject(response.payload),            true);
		assert(isArray(response.payload['policies']), true);

		let policy1 = response.payload['policies'].find((p) => p.domain === 'covert.localdomain') || null;
		let policy2 = response.payload['policies'].find((p) => p.domain === 'covert-two.localdomain') || null;

		assert(policy1, {
			domain:   'covert.localdomain',
			policies: [{
				path:  '/policy',
				query: 'sort&type'
			}]
		});

		assert(policy2, {
			domain:   'covert-two.localdomain',
			policies: [{
				path:  '/policy',
				query: 'q&search'
			}]
		});

	});

});

describe('Settings.prototype.save()/redirects', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		'redirects': [{
			domain:    'covert-two.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    'foo=bar&qux=123',
				location: 'https://covert-two.localdomain/location.html'
			}]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Settings.prototype.read()/redirects', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		'redirects': true // private
	}, (response) => {

		assert(isObject(response),                     true);
		assert(isObject(response.headers),             true);
		assert(isObject(response.payload),             true);
		assert(isArray(response.payload['redirects']), true);

		let redirect1 = response.payload['redirects'].find((r) => r.domain === 'covert.localdomain') || null;
		let redirect2 = response.payload['redirects'].find((r) => r.domain === 'covert-two.localdomain') || null;

		assert(redirect1, {
			domain:   'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		});

		assert(redirect2, {
			domain:    'covert-two.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    'foo=bar&qux=123',
				location: 'https://covert-two.localdomain/location.html'
			}]
		});

	});

});

after(disconnect);


export default finish('stealth/server/service/Settings', {
	internet: false,
	network:  true
});

