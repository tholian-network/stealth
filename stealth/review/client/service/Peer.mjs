
import { isFunction                                                   } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { ENVIRONMENT                                                  } from '../../../../stealth/source/ENVIRONMENT.mjs';
import { Peer                                                         } from '../../../../stealth/source/client/service/Peer.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Peer()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.peer instanceof Peer, true);

});

describe('Peer.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.peer.toJSON), true);

	assert(this.client.services.peer.toJSON(), {
		type: 'Peer Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Peer.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.peer.save), true);

	this.client.services.peer.save({
		host: '127.0.0.3',
		peer: {
			connection: 'mobile'
		}
	}, (response) => {

		assert(response, true);

	});

});

describe('Peer.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.peer.info), true);

	this.client.services.peer.info({
		host: '127.0.0.3'
	}, (response) => {

		assert(response, {
			domain: ENVIRONMENT.hostname,
			peer:   {
				connection: 'mobile'
			}
		});

	});

});

describe('Peer.prototype.read()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.peer.read), true);

	this.client.services.peer.read({
		host: '127.0.0.3'
	}, (response) => {

		assert(response, {
			domain: '127.0.0.3',
			peer:   {
				connection: 'mobile'
			}
		});

	});

});

describe('Peer.prototype.proxy()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.peer.proxy), true);

	this.client.services.peer.proxy({
		host: '127.0.0.3',
		headers: {
			service: 'settings',
			method:  'read'
		},
		payload: {
			internet: true
		}
	}, (response) => {

		assert(response, {
			'interface': null,
			'internet': {
				connection: 'mobile',
				history:    'stealth',
				useragent:  'stealth'
			},
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

describe('Peer.prototype.refresh()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.peer.refresh), true);

	this.client.services.peer.refresh({
		host: '127.0.0.3'
	}, (response) => {

		assert(response, {
			domain: '127.0.0.3',
			peer: {
				connection: 'mobile'
			}
		});

	});

});

describe('Peer.prototype.remove()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.peer.remove), true);

	this.client.services.peer.remove({
		host: '127.0.0.3'
	}, (response) => {

		assert(response, true);

	});

});

describe('Peer.prototype.proxy()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.peer.proxy), true);

	this.client.services.peer.proxy({
		host: '127.0.0.3',
		headers: {
			service: 'settings',
			method:  'read'
		},
		payload: {
			internet: true
		}
	}, (response) => {

		assert(response, null);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Peer', {
	internet: false,
	network:  true
});

