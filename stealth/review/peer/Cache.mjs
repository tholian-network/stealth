
import { isFunction                      } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { ENVIRONMENT as SANDBOX          } from '../../../covert/index.mjs';
import { Client                          } from '../../../stealth/source/Client.mjs';
import { Stealth                         } from '../../../stealth/source/Stealth.mjs';



before('peers[].connect', function(assert) {

	this.peers = [];


	let client1  = new Client();
	let stealth1 = new Stealth({
		host:    '127.0.0.1',
		profile: SANDBOX.mktemp('stealth/peer/Cache'),
		root:    SANDBOX.root
	});

	let client2  = new Client();
	let stealth2 = new Stealth({
		host:    '127.0.0.2',
		profile: SANDBOX.mktemp('stealth/peer/Cache'),
		root:    SANDBOX.root
	});


	stealth1.once('connect', () => {

		assert(true);

		client1.connect('127.0.0.1', (result) => {

			assert(result);

			if (result === true) {
				this.peers.push({
					client:  client1,
					server:  stealth1.server,
					stealth: stealth1
				});
			} else {
				stealth1.disconnect();
			}

		});

	});

	stealth2.once('connect', () => {

		assert(true);

		client2.connect('127.0.0.2', (result) => {

			assert(result);

			if (result === true) {
				this.peers.push({
					client:  client2,
					server:  stealth2.server,
					stealth: stealth2
				});
			} else {
				stealth2.disconnect();
			}

		});

	});

	stealth1.connect();
	stealth2.connect();

});

describe('peers[0].client.services.peer.save', function(assert) {

	assert(this.peers[0].client !== null);
	assert(isFunction(this.peers[0].client.services.peer.save), true);

	this.peers[0].client.services.peer.save({
		host:       '127.0.0.2',
		connection: 'peer'
	}, (response) => {
		assert(response, true);
	});

});

describe('peers[1].client.services.peer.save', function(assert) {

	assert(this.peers[1].client !== null);
	assert(isFunction(this.peers[1].client.services.peer.save), true);

	this.peers[1].client.services.peer.save({
		host:       '127.0.0.1',
		connection: 'peer'
	}, (response) => {
		assert(response, true);
	});

});

describe('peers[0].server.services.cache.save', function(assert) {

	assert(this.peers[0].server !== null);
	assert(isFunction(this.peers[0].client.services.cache.save), true);

	this.peers[0].server.services.cache.save({
		domain: 'example.com',
		path:   '/review/peer/cache.json',
		headers: {
			'content-type': 'application/json'
		},
		payload: {
			foo: 'bar'
		}
	}, (response) => {

		assert(response !== null);
		assert(response.payload, true);

	});

});

describe('peers[0].client.services.cache.read', function(assert) {

	assert(this.peers[0].client !== null);
	assert(isFunction(this.peers[0].client.services.cache.read), true);

	this.peers[0].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.headers['content-type'], 'application/json');
		assert(response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null);
		assert(data, { foo: 'bar' });

	});

});

describe('peers[1].client.services.peer.proxy/server', function(assert) {

	assert(this.peers[1].client !== null);
	assert(isFunction(this.peers[1].client.services.peer.proxy), true);

	this.peers[1].client.services.peer.proxy({
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

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.headers['content-type'], 'application/json');
		assert(response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null);
		assert(data, { foo: 'bar' });

		this.peers[1].server.services.cache.save({
			domain:  'example.com',
			path:    '/review/peer/cache.json',
			headers: response.headers,
			payload: response.payload
		}, (response) => {

			assert(response !== null);
			assert(response.payload, true);

		});

	});

});

describe('peers[1].client.services.cache.read', function(assert) {

	assert(this.peers[1].client !== null);
	assert(isFunction(this.peers[1].client.services.cache.read), true);

	this.peers[1].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.headers['content-type'], 'application/json');
		assert(response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null);
		assert(data, { foo: 'bar' });

	});

});

describe('peers[0].server.services.cache.remove', function(assert) {

	assert(this.peers[0].server !== null);
	assert(isFunction(this.peers[0].server.services.cache.remove), true);

	this.peers[0].server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(response !== null);
		assert(response.payload, true);

	});

});

describe('peers[1].server.services.cache.remove', function(assert) {

	assert(this.peers[1].server !== null);
	assert(isFunction(this.peers[1].server.services.cache.remove), true);

	this.peers[1].server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {

		assert(response !== null);
		assert(response.payload, true);

	});

});

describe('peers[0].client.services.cache.read', function(assert) {

	assert(this.peers[0].client !== null);
	assert(isFunction(this.peers[0].client.services.cache.read), true);

	this.peers[0].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {
		assert(response, null);
	});

});

describe('peers[1].client.services.cache.read', function(assert) {

	assert(this.peers[1].client !== null);
	assert(isFunction(this.peers[1].client.services.cache.read), true);

	this.peers[1].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peer/cache.json'
	}, (response) => {
		assert(response, null);
	});

});

after('peers[].disconnect', function(assert) {

	assert(this.peers.length, 2);

	assert(this.peers[0].client.disconnect());
	assert(this.peers[0].stealth.disconnect());
	this.peers.splice(0, 1);

	assert(this.peers[0].client.disconnect());
	assert(this.peers[0].stealth.disconnect());
	this.peers.splice(0, 1);

	assert(this.peers.length, 0);

});


export default finish('stealth/peer/Cache');

