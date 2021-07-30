
import { isArray, isFunction, isObject                                } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { Settings                                                     } from '../../../../stealth/source/client/service/Settings.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Settings()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.settings instanceof Settings, true);

});

describe('Settings.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.toJSON), true);

	assert(this.client.services.settings.toJSON(), {
		type: 'Settings Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Settings.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.info), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.info(null, (response) => {

		assert(response, {
			profile: defaults.profile,
			vendor:  defaults.vendor
		});

	});

});

describe('Settings.prototype.read()/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read(null, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/interface', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'interface': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/internet', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'internet': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/beacons', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'beacons': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/blockers', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'blockers': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/hosts', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'hosts': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/modes', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'modes': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/peers', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'peers': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/policies', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'policies': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/redirects', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'redirects': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.read()/sessions', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.client.services.settings.read({
		'sessions': true
	}, (response) => {

		assert(response, {
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
		});

	});

});

describe('Settings.prototype.save()/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
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
			domain:    'covert.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    null,
				location: 'https://covert.localdomain/location.html'
			}]
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Settings.prototype.read()/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
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

		assert(isObject(response), true);

		assert(response['interface'], {
			theme:   'light',
			enforce: true,
			opentab: 'stealth:search'
		});

		assert(response['internet'], {
			connection: 'mobile',
			history:    'week',
			useragent:  'stealth'
		});

		let beacon   = response['beacons'].find((b) => b.domain === 'covert.localdomain') || null;
		let blocker  = response['blockers'].find((b) => b.domain === 'malicious.example.com') || null;
		let host     = response['hosts'].find((h) => h.domain === 'covert.localdomain') || null;
		let mode     = response['modes'].find((h) => h.domain === 'covert.localdomain') || null;
		let policy   = response['policies'].find((p) => p.domain === 'covert.localdomain') || null;
		let redirect = response['redirects'].find((r) => r.domain === 'covert.localdomain') || null;

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

		assert(response['peers'], [{
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

		assert(response['sessions'], []);

	});

});

describe('Settings.prototype.save()/interface', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		'interface': {
			theme:   'dark',
			enforce: false,
			opentab: 'stealth:blank'
		}
	}, (response) => {

		assert(response, true);

	});

});

describe('Settings.prototype.read()/interface', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		'interface': true
	}, (response) => {

		assert(response['interface'], {
			theme:   'dark',
			enforce: false,
			opentab: 'stealth:blank'
		});

	});

});

describe('Settings.prototype.save()/internet', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save(null, (response) => {
		assert(response, false);
	});

	this.client.services.settings.save({
		'internet': {
			connection: 'broadband',
			history:    'stealth',
			useragent:  'stealth'
		}
	}, (response) => {

		assert(response, true);

	});

});

describe('Settings.prototype.read()/internet', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		'internet': true
	}, (response) => {

		assert(response['internet'], {
			connection: 'broadband',
			history:    'stealth',
			useragent:  'stealth'
		});

	});

});

describe('Settings.prototype.save()/beacons', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		'beacons': [{
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

		assert(response, true);

	});

});

describe('Settings.prototype.read()/beacons', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		'beacons': true
	}, (response) => {

		assert(isObject(response),           true);
		assert(isArray(response['beacons']), true);

		let beacon1 = response['beacons'].find((b) => b.domain === 'covert.localdomain') || null;
		let beacon2 = response['beacons'].find((b) => b.domain === 'covert-two.localdomain') || null;

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

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		'blockers': [{
			domain: 'malicious.example-two.com'
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Settings.prototype.read()/blockers', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		'blockers': true,
	}, (response) => {

		assert(isObject(response),            true);
		assert(isArray(response['blockers']), true);

		let blocker1 = response['blockers'].find((b) => b.domain === 'covert.localdomain') || null;
		let blocker2 = response['blockers'].find((b) => b.domain === 'covert-two.localdomain') || null;

		assert(blocker1, null);
		assert(blocker2, null);

	});

});

describe('Settings.prototype.save()/hosts', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		'hosts': [{
			domain: 'covert-two.localdomain',
			hosts: [{
				ip:    '127.0.0.2',
				scope: 'private',
				type:  'v4'
			}]
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Settings.prototype.read()/hosts', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		'hosts': true,
	}, (response) => {

		assert(isObject(response),         true);
		assert(isArray(response['hosts']), true);

		let host1 = response['hosts'].find((h) => h.domain === 'covert.localdomain') || null;
		let host2 = response['hosts'].find((h) => h.domain === 'covert-two.localdomain') || null;

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

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
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

		assert(response, true);

	});

});

describe('Settings.prototype.read()/modes', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		modes: true,
	}, (response) => {

		assert(isObject(response),         true);
		assert(isArray(response['modes']), true);

		let mode1 = response['modes'].find((m) => m.domain === 'covert.localdomain') || null;
		let mode2 = response['modes'].find((m) => m.domain === 'covert-two.localdomain') || null;

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

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		'peers': [{
			domain: 'covert-two.localdomain',
			peer:   {
				connection: 'peer'
			}
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Settings.prototype.read()/peers', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		peers: true,
	}, (response) => {

		assert(isObject(response),         true);
		assert(isArray(response['peers']), true);

		let peer1 = response['peers'].find((p) => p.domain === 'covert.localdomain') || null;
		let peer2 = response['peers'].find((p) => p.domain === 'covert-two.localdomain') || null;

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

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		'policies': [{
			domain:   'covert-two.localdomain',
			policies: [{
				path:  '/policy',
				query: 'q&search'
			}]
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Settings.prototype.read()/policies', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		'policies': true
	}, (response) => {

		assert(isObject(response),            true);
		assert(isArray(response['policies']), true);

		let policy1 = response['policies'].find((r) => r.domain === 'covert.localdomain') || null;
		let policy2 = response['policies'].find((r) => r.domain === 'covert-two.localdomain') || null;

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

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		'redirects': [{
			domain:    'covert-two.localdomain',
			redirects: [{
				path:     '/redirect',
				query:    'foo=bar&qux=123',
				location: 'https://covert-two.localdomain/location.html'
			}]
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Settings.prototype.read()/redirects', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		'redirects': true
	}, (response) => {

		assert(isObject(response),             true);
		assert(isArray(response['redirects']), true);

		let redirect1 = response['redirects'].find((r) => r.domain === 'covert.localdomain') || null;
		let redirect2 = response['redirects'].find((r) => r.domain === 'covert-two.localdomain') || null;

		assert(redirect1, {
			domain:    'covert.localdomain',
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

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Settings', {
	internet: false,
	network:  true
});

