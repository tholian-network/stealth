
import { isArray, isFunction, isObject                                } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Settings                                                     } from '../../../stealth/source/client/Settings.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



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
			'blockers':  null,
			'hosts':     defaults['hosts'],
			'modes':     defaults['modes'],
			'peers':     defaults['peers'],
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
			'redirects': null,
			'sessions':  null
		});

	});

});

describe('Settings.prototype.read()/blockers', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		'blockers': true
	}, (response) => {

		assert(response, {
			'interface': null,
			'internet':  null,
			'beacons':   null,
			'blockers':  null,
			'hosts':     null,
			'modes':     null,
			'peers':     null,
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
			path:   '/news/*',
			beacons: [{
				label:  'headline',
				select: [ '#header h1' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}, {
				label:  'article',
				select: [ '#article > p:nth-child(1)', '#article > p:nth-child(3)' ],
				mode:   {
					text:  true,
					image: true,
					audio: false,
					video: false,
					other: false
				}
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
			domain:     'covert.localdomain',
			connection: 'mobile'
		}],
		'redirects': [{
			domain:   'covert.localdomain',
			path:     '/redirect',
			location: 'https://covert.localdomain/location.html'
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
		'blockers':  true, // private
		'hosts':     true,
		'modes':     true,
		'peers':     true,
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

		let beacon = response['beacons'].find((b) => b.domain === 'covert.localdomain') || null;

		assert(beacon, {
			domain: 'covert.localdomain',
			path:    '/news/*',
			beacons: [{
				label:  'headline',
				select: [ '#header h1' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}, {
				label:  'article',
				select: [ '#article > p:nth-child(1)', '#article > p:nth-child(3)' ],
				mode:   {
					text:  true,
					image: true,
					audio: false,
					video: false,
					other: false
				}
			}]
		});

		assert(response['blockers'], null);

		let host = response['hosts'].find((h) => h.domain === 'covert.localdomain') || null;

		assert(host, {
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		});

		assert(response['modes'], [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}]);

		assert(response['peers'], [{
			domain:     'covert.localdomain',
			connection: 'mobile'
		}]);

		assert(response['redirects'], [{
			domain:   'covert.localdomain',
			path:     '/redirect',
			location: 'https://covert.localdomain/location.html'
		}]);

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
			path:   '*awesome-topic/',
			beacons: [{
				label:  'headline',
				select: [ '#header h3' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}, {
				label:  'article',
				select: [ 'article > p' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
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
			path:   '/news/*',
			beacons: [{
				label:  'headline',
				select: [ '#header h1' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}, {
				label:  'article',
				select: [ '#article > p:nth-child(1)', '#article > p:nth-child(3)' ],
				mode:   {
					text:  true,
					image: true,
					audio: false,
					video: false,
					other: false
				}
			}]
		});

		assert(beacon2, {
			domain: 'covert-two.localdomain',
			path:   '*awesome-topic/',
			beacons: [{
				label:  'headline',
				select: [ '#header h3' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}, {
				label:  'article',
				select: [ 'article > p' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		});

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
			domain:     'covert-two.localdomain',
			connection: 'peer'
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
			domain:     'covert.localdomain',
			connection: 'mobile'
		});

		assert(peer2, {
			domain:     'covert-two.localdomain',
			connection: 'peer'
		});

	});

});

describe('Settings.prototype.save()/redirects', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		'redirects': [{
			domain:   'covert-two.localdomain',
			path:     '/redirect',
			location: 'https://covert-two.localdomain/location.html'
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
			domain:   'covert.localdomain',
			path:     '/redirect',
			location: 'https://covert.localdomain/location.html'
		});

		assert(redirect2, {
			domain:   'covert-two.localdomain',
			path:     '/redirect',
			location: 'https://covert-two.localdomain/location.html'
		});

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Settings');

