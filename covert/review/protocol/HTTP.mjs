
import { create, PAYLOAD, REQUEST } from '../../EXAMPLE.mjs';

import { after, before, describe, finish } from '../../source/Review.mjs';

import { HTTP } from '../../../stealth/source/protocol/HTTP.mjs';



before('HTTP.connect', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = create('http://example.com:80/index.html').ref;
	this.socket     = null;


	assert(typeof HTTP.connect === 'function');


	this.connection = HTTP.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

});

describe('HTTP.send', function(assert) {

	assert(typeof HTTP.send === 'function');
	assert(this.connection !== null);
	assert(this.socket !== null);


	this.connection.on('response', (response) => {

		let html = (response.payload || '').toString('utf8');

		assert(response.payload !== null && html.includes('<html>'));
		assert(response.payload !== null && html.includes('<title>Example Domain</title>'));
		assert(response.payload !== null && html.includes('</html>'));

	});


	HTTP.send(this.socket, REQUEST);

});

describe('HTTP.receive', function(assert) {

	assert(typeof HTTP.receive === 'function');
	assert(this.buffer !== null);


	HTTP.receive(this.socket, PAYLOAD, (response) => {

		assert(response !== null);
		assert(response.headers['@status'] === '200 OK');
		assert(response.headers['content-length'] === '' + response.payload.length);

		let html = (response.payload || '').toString('utf8');

		assert(response.payload !== null && html.includes('<html>'));
		assert(response.payload !== null && html.includes('<title>Example Domain</title>'));
		assert(response.payload !== null && html.includes('</html>'));

	});

});

after('HTTP.disconnect', function(assert) {

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



export default finish('protocol/HTTP', {
	internet: true
});

