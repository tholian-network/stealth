
import { isArray, isFunction, isObject                                } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
describe(connect_client);

describe('client.services.settings.read/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read(null, (response) => {

		assert(response !== null);
		assert(isObject(response),          true);
		assert(isObject(response.internet), true);
		assert(response.blockers,           null);
		assert(isArray(response.filters),   true);
		assert(isArray(response.hosts),     true);
		assert(isArray(response.modes),     true);
		assert(isArray(response.peers),     true);
		assert(response.redirects,          null);
		assert(isArray(response.sessions),  true);

	});

});

describe('client.services.settings.read/internet', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		internet: true
	}, (response) => {

		assert(response !== null);
		assert(isObject(response),          true);
		assert(isObject(response.internet), true);
		assert(response.blockers,           null);
		assert(response.filters,            null);
		assert(response.hosts,              null);
		assert(response.modes,              null);
		assert(response.peers,              null);
		assert(response.redirects,          null);
		assert(response.sessions,           null);

	});

});

describe('client.services.settings.save/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save({
		internet: {
			connection: 'mobile',
			history:    'week',
			useragent:  'stealth'
		},
		filters: [{
			id:     'covert.localdomain|/prefix|null|.html',
			domain: 'covert.localdomain',
			filter: {
				prefix: '/prefix',
				midfix: null,
				suffix: '.html'
			}
		}],
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
		assert(response, true);
	});

});

describe('client.services.settings.read/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		internet:  true,
		blockers:  true, // private
		filters:   true,
		hosts:     true,
		modes:     true,
		peers:     true,
		redirects: true, // private
		sessions:  true  // private
	}, (response) => {

		assert(response !== null);
		assert(isObject(response),           true);
		assert(isObject(response.internet),  true);
		assert(response.internet.connection, 'mobile');
		assert(response.internet.history,    'week');
		assert(response.internet.useragent,  'stealth');

		assert(response.blockers, null);

		assert(response.filters, [{
			id:     'covert.localdomain|/prefix|null|.html',
			domain: 'covert.localdomain',
			filter: {
				prefix: '/prefix',
				midfix: null,
				suffix: '.html'
			}
		}]);

		let host = response.hosts.find((h) => h.domain === 'covert.localdomain') || null;

		assert(host, {
			domain: 'covert.localdomain',
			hosts: [{
				ip:    '127.0.0.1',
				scope: 'private',
				type:  'v4'
			}]
		});

		assert(response.modes, [{
			domain: 'covert.localdomain',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		}]);

		assert(response.peers, [{
			domain:     'covert.localdomain',
			connection: 'mobile'
		}]);

		assert(response.redirects, null);

		assert(response.sessions,  []);

	});

});

describe('client.services.settings.save/internet', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.save), true);

	this.client.services.settings.save(null, (response) => {
		assert(response, false);
	});

	this.client.services.settings.save({
		internet: {
			connection: 'broadband',
			history:    'stealth',
			useragent:  'stealth'
		}
	}, (response) => {
		assert(response, true);
	});

});

describe('client.services.settings.read/internet', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.settings.read), true);

	this.client.services.settings.read({
		internet: true
	}, (response) => {

		assert(response !== null);
		assert(isObject(response),           true);
		assert(isObject(response.internet),  true);
		assert(response.internet.connection, 'broadband');
		assert(response.internet.history,    'stealth');
		assert(response.internet.useragent,  'stealth');

	});

});

describe(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Settings');

