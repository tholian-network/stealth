
import { isBuffer, isFunction, isObject  } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { ENVIRONMENT as SANDBOX          } from '../../../covert/index.mjs';
import { Client                          } from '../../../stealth/source/Client.mjs';
import { Stealth                         } from '../../../stealth/source/Stealth.mjs';



before('Peer #1 - (Client/Stealth).prototype.connect()', function(assert) {

	let client = new Client({
		host: '127.0.0.1'
	});

	let stealth = new Stealth({
		host:    '127.0.0.1',
		profile: SANDBOX.mktemp('stealth/peer/Cache')
	});

	client.once('connect', () => {

		this.peer1 = {
			client:  client,
			server:  stealth.server,
			stealth: stealth
		};

		assert(true);

	});

	stealth.once('connect', () => {

		setTimeout(() => {
			assert(client.connect());
		}, 100);

	});

	stealth.connect();

});

before('Peer #2 - (Client/Stealth).prototype.connect()', function(assert) {

	let client = new Client({
		host: '127.0.0.2'
	});

	let stealth = new Stealth({
		host:    '127.0.0.2',
		profile: SANDBOX.mktemp('stealth/peer/Cache')
	});

	client.once('connect', () => {

		this.peer2 = {
			client:  client,
			server:  stealth.server,
			stealth: stealth
		};

		assert(true);

	});

	stealth.once('connect', () => {

		setTimeout(() => {
			assert(client.connect());
		}, 100);

	});

	stealth.connect();

});

describe('Client #1 - Peer.prototype.save()', function(assert) {

	assert(this.peer1 !== null);
	assert(this.peer1.client !== null);
	assert(isFunction(this.peer1.client.services.peer.save), true);

	this.peer1.client.services.peer.save({
		host: '127.0.0.2',
		peer: {
			connection: 'peer'
		}
	}, (response) => {

		assert(response, true);

	});

});

describe('Client #2 - Peer.prototype.save()', function(assert) {

	assert(this.peer2 !== null);
	assert(this.peer2.client !== null);
	assert(isFunction(this.peer2.client.services.peer.save), true);

	this.peer2.client.services.peer.save({
		host: '127.0.0.1',
		peer: {
			connection: 'peer'
		}
	}, (response) => {

		assert(response, true);

	});

});

describe('Server #1 - Cache.prototype.save()', function(assert) {

	assert(this.peer1 !== null);
	assert(this.peer1.server !== null);
	assert(isFunction(this.peer1.server.services.cache.save), true);

	this.peer1.server.services.cache.save({
		domain: 'example.com',
		path:   '/review/peer/cache.json',
		headers: {
			'content-type': 'application/json'
		},
		payload: {
			foo: 'bar'
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Client #1 - Cache.prototype.read()', function(assert) {

	assert(this.peer1 !== null);
	assert(this.peer1.client !== null);
	assert(isFunction(this.peer1.client.services.cache.read), true);

	this.peer1.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['content-type'],   'application/json');
		assert(response.headers['content-length'], 17);

		let data = null;
		try {
			data = JSON.parse(response.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, { foo: 'bar' });

	});

});

describe('Client #2 - Peer.prototype.proxy()', function(assert) {

	assert(this.peer2 !== null);
	assert(this.peer2.client !== null);
	assert(isFunction(this.peer2.client.services.peer.proxy), true);

	this.peer2.client.services.peer.proxy({
		host: '127.0.0.1',
		headers: {
			service: 'cache',
			method:  'read'
		},
		payload: {
			domain: 'example.com',
			path:   '/review/peer/cache.json'
		}
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['content-type'],   'application/json');
		assert(response.headers['content-length'], 17);

		let data = null;
		try {
			data = JSON.parse(response.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, { foo: 'bar' });


		this.peer2.server.services.cache.save({
			domain:  'example.com',
			path:    '/review/peer/cache.json',
			headers: response.headers,
			payload: response.payload
		}, (response) => {

			assert(response, {
				headers: {
					service: 'cache',
					event:   'save'
				},
				payload: true
			});

		});

	});

});

describe('Client #2 - Cache.prototype.read()', function(assert) {

	assert(this.peer2.client !== null);
	assert(isFunction(this.peer2.client.services.cache.read), true);

	this.peer2.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['content-type'],   'application/json');
		assert(response.headers['content-length'], 17);

		let data = null;
		try {
			data = JSON.parse(response.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, { foo: 'bar' });

	});

});

describe('Server #1 - Cache.prototype.remove()', function(assert) {

	assert(this.peer1 !== null);
	assert(this.peer1.server !== null);
	assert(isFunction(this.peer1.server.services.cache.remove), true);

	this.peer1.server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Server #2 - Cache.prototype.remove()', function(assert) {

	assert(this.peer2 !== null);
	assert(this.peer2.server !== null);
	assert(isFunction(this.peer2.server.services.cache.remove), true);

	this.peer2.server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Client #1 - Cache.prototype.read()', function(assert) {

	assert(this.peer1 !== null);
	assert(this.peer1.client !== null);
	assert(isFunction(this.peer1.client.services.cache.read), true);

	this.peer1.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(response, null);

	});

});

describe('Client #2 - Cache.prototype.read()', function(assert) {

	assert(this.peer2 !== null);
	assert(this.peer2.client !== null);
	assert(isFunction(this.peer2.client.services.cache.read), true);

	this.peer2.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(response, null);

	});

});

after('Peer #1 - (Client/Stealth).prototype.disconnect()', function(assert) {

	assert(this.peer1 !== null);
	assert(this.peer1.client.disconnect());
	assert(this.peer1.stealth.disconnect());

	this.peer1 = null;

});

after('Peer #2 - (Client/Stealth).prototype.disconnect()', function(assert) {

	assert(this.peer2 !== null);
	assert(this.peer2.client.disconnect());
	assert(this.peer2.stealth.disconnect());

	this.peer2 = null;

});


export default finish('stealth/peer/Cache', {
	internet: false,
	network:  true
});

