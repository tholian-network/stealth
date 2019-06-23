
import process from 'process';

import { after, before, describe, finish } from '../source/Review.mjs';

import { Client  } from '../../stealth/source/Client.mjs';
import { Stealth } from '../../stealth/source/Stealth.mjs';


before('peers[].connect', function(assert) {

	this.peers = [];


	let client1  = new Client();
	let stealth1 = new Stealth({
		profile: '/tmp/covert-peer-0',
		root:    process.env.PWD
	});

	let client2  = new Client();
	let stealth2 = new Stealth({
		profile: '/tmp/covert-peer-1',
		root:    process.env.PWD
	});


	stealth1.connect('127.0.0.1', (result) => {

		assert(result);

		client1.connect('127.0.0.1', (result) => {

			if (result === true) {
				this.peers.push({
					client:  client1,
					server:  stealth1.server,
					stealth: stealth1
				});
			} else {
				stealth1.disconnect();
			}

			assert(result);

		});

	});

	stealth2.connect('127.0.0.2', (result) => {

		assert(result);

		client2.connect('127.0.0.2', (result) => {

			if (result === true) {
				this.peers.push({
					client:  client2,
					server:  stealth2.server,
					stealth: stealth2
				});
			} else {
				stealth2.disconnect();
			}

			assert(result);

		});

	});

});

describe('peers[0].client.services.peer.save', function(assert) {

	assert(this.peers[0].client !== null);
	assert(typeof this.peers[0].client.services.peer.save === 'function');

	this.peers[0].client.services.peer.save({
		host:       '127.0.0.2',
		connection: 'peer'
	}, (response) => {
		assert(response === true);
	});

});

describe('peers[1].client.services.peer.save', function(assert) {

	assert(this.peers[1].client !== null);
	assert(typeof this.peers[1].client.services.peer.save === 'function');

	this.peers[1].client.services.peer.save({
		host:       '127.0.0.1',
		connection: 'peer'
	}, (response) => {
		assert(response === true);
	});

});

describe('peers[0].server.services.cache.save', function(assert) {

	assert(this.peers[0].server !== null);
	assert(typeof this.peers[0].server.services.cache.save === 'function');

	this.peers[0].server.services.cache.save({
		domain: 'example.com',
		path:   '/review/peers/cache.json',
		headers: {
			'x-test': 'save'
		},
		payload: {
			foo: 'bar'
		}
	}, (response) => {
		assert(response !== null && response.payload === true);
	});

});

describe('peers[0].client.services.cache.read', function(assert) {

	assert(this.peers[0].client !== null);
	assert(typeof this.peers[0].client.services.cache.read === 'function');

	this.peers[0].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peers/cache.json'
	}, (response) => {

		assert(response !== null && response.headers['x-test'] === 'save');
		assert(response !== null && response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null && typeof data === 'object');
		assert(data !== null && data.foo === 'bar');

	});

});

describe('peers[1].client.services.peer.proxy/server', function(assert) {

	assert(this.peers[1].client !== null);
	assert(typeof this.peers[1].client.services.peer.proxy === 'function');

	this.peers[1].client.services.peer.proxy({
		host: '127.0.0.1',
		headers: {
			service: 'cache',
			method:  'read'
		},
		payload: {
			domain: 'example.com',
			path:   '/review/peers/cache.json'
		}
	}, (response) => {

		assert(response !== null && response.headers['x-test'] === 'save');
		assert(response !== null && response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null && typeof data === 'object');
		assert(data !== null && data.foo === 'bar');


		this.peers[1].server.services.cache.save({
			domain:  'example.com',
			path:    '/review/peers/cache.json',
			headers: response.headers,
			payload: response.payload
		}, (response) => {
			assert(response !== null && response.payload === true);
		});

	});

});

describe('peers[1].client.services.cache.read', function(assert) {

	assert(this.peers[1].client !== null);
	assert(typeof this.peers[1].client.services.cache.read === 'function');

	this.peers[1].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peers/cache.json'
	}, (response) => {

		assert(response !== null && response.headers['x-test'] === 'save');
		assert(response !== null && response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null && typeof data === 'object');
		assert(data !== null && data.foo === 'bar');

	});

});


describe('peers[1].server.services.cache.remove', function(assert) {

	assert(this.peers[1].server !== null);
	assert(typeof this.peers[1].server.services.cache.remove === 'function');

	this.peers[1].server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/peers/cache.json'
	}, (response) => {
		assert(response !== null && response.payload === true);
	});

});

describe('peers[1].client.services.peer.proxy/client', function(assert) {

	assert(this.peers[1].client !== null);
	assert(typeof this.peers[1].client.services.peer.proxy === 'function');

	this.peers[1].client.services.peer.proxy({
		host: '127.0.0.1',
		headers: {
			service: 'cache',
			method:  'read'
		},
		payload: {
			domain: 'example.com',
			path:   '/review/peers/cache.json'
		}
	}, (response) => {

		assert(response !== null && response.headers['x-test'] === 'save');
		assert(response !== null && response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null && typeof data === 'object');
		assert(data !== null && data.foo === 'bar');


		this.peers[1].client.services.cache.save({
			domain:  'example.com',
			path:    '/review/peers/cache.json',
			headers: response.headers,
			payload: response.payload
		}, (response) => {
			assert(response === true);
		});

	});

});

describe('peers[1].client.services.cache.read', function(assert) {

	assert(this.peers[1].client !== null);
	assert(typeof this.peers[1].client.services.cache.read === 'function');

	this.peers[1].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peers/cache.json'
	}, (response) => {

		assert(response !== null && response.headers['x-test'] === 'save');
		assert(response !== null && response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null && typeof data === 'object');
		assert(data !== null && data.foo === 'bar');

	});

});

describe('peers[0].server.services.cache.remove', function(assert) {

	assert(this.peers[0].server !== null);
	assert(typeof this.peers[0].server.services.cache.remove === 'function');

	this.peers[0].server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/peers/cache.json'
	}, (response) => {
		assert(response !== null && response.payload === true);
	});

});

describe('peers[1].server.services.cache.remove', function(assert) {

	assert(this.peers[1].server !== null);
	assert(typeof this.peers[1].server.services.cache.remove === 'function');

	this.peers[1].server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/peers/cache.json'
	}, (response) => {
		assert(response !== null && response.payload === true);
	});

});

describe('peers[0].client.services.cache.read', function(assert) {

	assert(this.peers[0].client !== null);
	assert(typeof this.peers[0].client.services.cache.read === 'function');

	this.peers[0].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peers/cache.json'
	}, (response) => {
		assert(response === null);
	});

});

describe('peers[1].client.services.cache.read', function(assert) {

	assert(this.peers[1].client !== null);
	assert(typeof this.peers[1].client.services.cache.read === 'function');

	this.peers[1].client.services.cache.read({
		domain: 'example.com',
		path:   '/review/peers/cache.json'
	}, (response) => {
		assert(response === null);
	});

});

after('peers[].disconnect', function(assert) {

	assert(this.peers.length === 2);

	assert(this.peers[0].client.disconnect());
	assert(this.peers[0].stealth.disconnect());
	this.peers.splice(0, 1);

	assert(this.peers[0].client.disconnect());
	assert(this.peers[0].stealth.disconnect());
	this.peers.splice(0, 1);

	assert(this.peers.length === 0);

});


export default finish('Peers');

