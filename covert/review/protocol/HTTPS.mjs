
import { create, PAYLOAD, REQUEST } from '../../EXAMPLE.mjs';

import { after, before, describe, finish } from '../../source/Review.mjs';

import { HTTPS } from '../../../stealth/source/protocol/HTTPS.mjs';



before('HTTPS.connect', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = create('https://example.com:443/index.html').ref;
	this.socket     = null;


	assert(typeof HTTPS.connect === 'function');


	this.connection = HTTPS.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

}, {
	internet: true
});

describe('HTTPS.send', function(assert) {

	assert(typeof HTTPS.send === 'function');
	assert(this.connection !== null);
	assert(this.socket !== null);


	this.connection.on('response', (response) => {

		let html = (response.payload || '').toString('utf8');

		assert(response.payload !== null && html.includes('Example Domain'));

	});


	HTTPS.send(this.socket, REQUEST);

}, {
	internet: true
});

describe('HTTPS.receive', function(assert) {

	assert(typeof HTTPS.receive === 'function');
	assert(this.buffer !== null);


	HTTPS.receive(this.socket, PAYLOAD, (response) => {

		assert(response !== null);
		assert(response.headers['@status'] === '200 OK');
		assert(response.headers['content-length'] === '' + response.payload.length);

		let html = (response.payload || '').toString('utf8');

		assert(response.payload !== null && html.includes('Example Domain'));

	});

});

after('HTTPS.disconnect', function(assert) {

	if (this.socket !== null) {
		this.socket.end();
	}

	this.buffer     = null;
	this.connection = null;
	this.ref        = null;
	this.socket     = null;

	assert(this.buffer === null);
	assert(this.connection === null);
	assert(this.ref === null);
	assert(this.socket === null);

});


export default finish('protocol/HTTPS');

