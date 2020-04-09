
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { sketch                          } from '../../../covert/EXAMPLE.mjs';
import { Client                          } from '../../source/Client.mjs';
import { Stealth                         } from '../../source/Stealth.mjs';



const FILE = sketch('cache/payload/example.com/file.html');



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

describe('peers[0].client.services.cache.save', function(assert) {

	assert(this.peers[0].client !== null);
	assert(typeof this.peers[0].client.services.cache.save === 'function');

	this.peers[0].client.services.cache.save({
		domain: 'example.com',
		path:   '/file.html',
		headers: {
			'content-type': 'text/html'
		},
		payload: FILE.payload
	}, (response) => {
		assert(response === true);
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


export default finish('stealth/peer/Cache');

