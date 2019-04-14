
import { RAW as EXAMPLE_RAW, REQUEST as EXAMPLE_REQUEST, URL as EXAMPLE_URL } from '../../EXAMPLE.mjs';

import { after, before, describe, finish } from '../../source/Review.mjs';

import { HTTPS } from '../../../stealth/source/protocol/HTTPS.mjs';



before('HTTPS.connect', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = Object.assign({}, EXAMPLE_URL, { port: 443, protocol: 'https' });
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

});

describe('HTTPS.send', function(assert) {

	assert(typeof HTTPS.send === 'function');
	assert(this.connection !== null);
	assert(this.socket !== null);


	this.connection.on('response', (response) => {

		let html = (response.payload || '').toString('utf8');

		assert(response.payload !== null && html.includes('Example Domain'));

	});

	HTTPS.send(this.socket, EXAMPLE_REQUEST);

});

describe('HTTPS.receive', function(assert) {

	assert(typeof HTTPS.receive === 'function');
	assert(this.buffer !== null);


	HTTPS.receive(this.socket, EXAMPLE_RAW, (response) => {

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

