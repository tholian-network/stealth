
import { after, before, describe, finish                      } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.settings.read/all', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.settings.read === 'function');

	this.client.services.settings.read(null, (response) => {

		assert(response !== null && response instanceof Object);
		assert(response !== null && response.internet instanceof Object);
		assert(response !== null && response.blockers === null);
		assert(response !== null && response.filters instanceof Array);
		assert(response !== null && response.hosts instanceof Array);
		assert(response !== null && response.modes instanceof Array);
		assert(response !== null && response.peers instanceof Array);
		assert(response !== null && response.redirects === null);
		assert(response !== null && response.sessions instanceof Array);

	});

});

describe('client.services.settings.read/internet', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.settings.read === 'function');

	this.client.services.settings.read({
		internet: true
	}, (response) => {

		assert(response !== null && response instanceof Object);
		assert(response !== null && response.internet instanceof Object);
		assert(response !== null && response.blockers === null);
		assert(response !== null && response.filters === null);
		assert(response !== null && response.hosts === null);
		assert(response !== null && response.modes === null);
		assert(response !== null && response.peers === null);
		assert(response !== null && response.redirects === null);
		assert(response !== null && response.sessions === null);

	});

});

describe('client.services.settings.save/all', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.settings.save === 'function');

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
		assert(response === true);
	});

});

describe('client.services.settings.read/all', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.settings.read === 'function');

	this.client.services.settings.read({
		internet:  true,
		blockers:  true, // XXX: private
		filters:   true,
		hosts:     true,
		modes:     true,
		peers:     true,
		redirects: true, // XXX: private
		sessions:  true  // XXX: private
	}, (response) => {

		assert(response !== null && response instanceof Object);
		assert(response !== null && response.internet instanceof Object);
		assert(response !== null && response.internet.connection === 'mobile');
		assert(response !== null && response.internet.history === 'week');
		assert(response !== null && response.internet.useragent === 'stealth');

		let filter   = response.filters.find((f) => f.domain === 'covert.localdomain') || null;
		let host     = response.hosts.find((h) => h.domain === 'covert.localdomain') || null;
		let mode     = response.modes.find((m) => m.domain === 'covert.localdomain') || null;
		let peer     = response.peers.find((p) => p.domain === 'covert.localdomain') || null;

		assert(response !== null && response.blockers === null);
		assert(response !== null && filter !== null);
		assert(response !== null && host !== null);
		assert(response !== null && mode !== null);
		assert(response !== null && peer !== null);
		assert(response !== null && response.redirects === null);
		assert(response !== null && response.sessions instanceof Array);

	});

});

describe('client.services.settings.save/internet', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.settings.save === 'function');

	this.client.services.settings.save(null, (response) => {
		assert(response === false);
	});

	this.client.services.settings.save({
		internet: {
			connection: 'broadband',
			history:    'stealth',
			useragent:  'stealth'
		}
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.settings.read/internet', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.settings.read === 'function');

	this.client.services.settings.read({
		internet: true
	}, (response) => {

		assert(response !== null && response instanceof Object);
		assert(response !== null && response.internet instanceof Object);
		assert(response !== null && response.internet.connection === 'broadband');
		assert(response !== null && response.internet.history === 'stealth');
		assert(response !== null && response.internet.useragent === 'stealth');

	});

});

describe(cli_disconnect);
after(srv_disconnect);



export default finish('client/Settings');

