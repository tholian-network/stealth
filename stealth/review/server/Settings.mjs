
import { isArray, isFunction, isObject   } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { Settings                        } from '../../../stealth/source/server/Settings.mjs';
import { connect, disconnect             } from '../Server.mjs';



before(connect);

describe('new Settings()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.settings instanceof Settings, true);

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
				internet:  defaults.internet,
				blockers:  null,
				hosts:     defaults.hosts,
				modes:     defaults.modes,
				peers:     defaults.peers,
				redirects: defaults.redirects,
				sessions:  defaults.sessions
			}
		});

	});

});

describe('Settings.prototype.read()/internet', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		internet: true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				internet:  defaults.internet,
				blockers:  null,
				hosts:     null,
				modes:     null,
				peers:     null,
				redirects: null,
				sessions:  null
			}
		});

	});

});

describe('Settings.prototype.read()/blockers', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		blockers: true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				internet:  null,
				blockers:  null,
				hosts:     null,
				modes:     null,
				peers:     null,
				redirects: null,
				sessions:  null
			}
		});

	});

});

describe('Settings.prototype.read()/hosts', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		hosts: true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				internet:  null,
				blockers:  null,
				hosts:     defaults.hosts,
				modes:     null,
				peers:     null,
				redirects: null,
				sessions:  null
			}
		});

	});

});

describe('Settings.prototype.read()/modes', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		modes: true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				internet:  null,
				blockers:  null,
				hosts:     null,
				modes:     defaults.modes,
				peers:     null,
				redirects: null,
				sessions:  null
			}
		});

	});

});

describe('Settings.prototype.read()/peers', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		peers: true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				internet:  null,
				blockers:  null,
				hosts:     null,
				modes:     null,
				peers:     defaults.peers,
				redirects: null,
				sessions:  null
			}
		});

	});

});

describe('Settings.prototype.read()/redirects', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	this.server.services.settings.read({
		redirects: true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				internet:  null,
				blockers:  null,
				hosts:     null,
				modes:     null,
				peers:     null,
				redirects: null,
				sessions:  null
			}
		});

	});

});

describe('Settings.prototype.read()/sessions', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.read), true);

	let defaults = this.stealth.settings.toJSON().data;

	this.server.services.settings.read({
		sessions: true
	}, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'read'
			},
			payload: {
				internet:  null,
				blockers:  null,
				hosts:     null,
				modes:     null,
				peers:     null,
				redirects: null,
				sessions:  defaults.sessions
			}
		});

	});

});

describe('Settings.prototype.save()/all', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		internet: {
			connection: 'mobile',
			history:    'week',
			useragent:  'stealth'
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
		redirects: [{
			domain:   'covert.localdomain',
			path:     '/redirect',
			location: 'https://covert.localdomain/location.html'
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
		internet:  true,
		blockers:  true, // private
		hosts:     true,
		modes:     true,
		peers:     true,
		redirects: true, // private
		sessions:  true  // private
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isObject(response.payload), true);

		assert(response.headers, {
			service: 'settings',
			event:   'read'
		});

		assert(response.payload.internet, {
			connection: 'mobile',
			history:    'week',
			useragent:  'stealth'
		});

		assert(response.payload.blockers, null);

		let host = response.payload.hosts.find((h) => h.domain === 'covert.localdomain') || null;

		assert(host, {
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		});

		assert(response.payload.modes, [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}]);

		assert(response.payload.peers, [{
			domain:     'covert.localdomain',
			connection: 'mobile'
		}]);

		assert(response.payload.redirects, null);

		assert(response.payload.sessions, []);

	});

});

describe('Settings.prototype.save()/internet', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save(null, (response) => {

		assert(response, {
			headers: {
				service: 'settings',
				event:   'save'
			},
			payload: false
		});

	});

	this.server.services.settings.save({
		internet: {
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
		internet: true
	}, (response) => {

		assert(response.payload.internet, {
			connection: 'broadband',
			history:    'stealth',
			useragent:  'stealth'
		});

	});

});

describe('Settings.prototype.save()/hosts', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		hosts: [{
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
		hosts: true,
	}, (response) => {

		assert(isObject(response),              true);
		assert(isObject(response.headers),      true);
		assert(isObject(response.payload),      true);
		assert(isArray(response.payload.hosts), true);

		let host1 = response.payload.hosts.find((h) => h.domain === 'covert.localdomain') || null;
		let host2 = response.payload.hosts.find((h) => h.domain === 'covert-two.localdomain') || null;

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
		modes: [{
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
		modes: true,
	}, (response) => {

		assert(isObject(response),              true);
		assert(isObject(response.headers),      true);
		assert(isObject(response.payload),      true);
		assert(isArray(response.payload.modes), true);

		let mode1 = response.payload.modes.find((m) => m.domain === 'covert.localdomain') || null;
		let mode2 = response.payload.modes.find((m) => m.domain === 'covert-two.localdomain') || null;

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
		peers: [{
			domain:     'covert-two.localdomain',
			connection: 'peer'
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
		peers: true,
	}, (response) => {

		assert(isObject(response),              true);
		assert(isObject(response.headers),      true);
		assert(isObject(response.payload),      true);
		assert(isArray(response.payload.peers), true);

		let peer1 = response.payload.peers.find((p) => p.domain === 'covert.localdomain') || null;
		let peer2 = response.payload.peers.find((p) => p.domain === 'covert-two.localdomain') || null;

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

	assert(this.server !== null);
	assert(isFunction(this.server.services.settings.save), true);

	this.server.services.settings.save({
		redirects: [{
			domain:   'covert-two.localdomain',
			path:     '/redirect',
			location: 'https://covert-two.localdomain/location.html'
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
		redirects: true // private
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isObject(response.payload), true);
		assert(response.payload.redirects, null);

	});

});

after(disconnect);


export default finish('stealth/server/Settings');

