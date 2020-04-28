
import { isBuffer, isFunction, isObject  } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { create, PAYLOAD, REQUEST        } from '../../../covert/EXAMPLE.mjs';
import { HTTPS                           } from '../../../stealth/source/protocol/HTTPS.mjs';



before('HTTPS.connect()', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = create('https://example.com:443/index.html').ref;
	this.socket     = null;

	assert(isFunction(HTTPS.connect), true);

	this.connection = HTTPS.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

});

describe('HTTPS.send()', function(assert) {

	assert(isFunction(HTTPS.send), true);
	assert(this.connection !== null);
	assert(this.socket !== null);

	this.connection.on('response', (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.payload !== null);

		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('<html>'));
		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));
		assert(response.payload.toString('utf8').includes('</html>'));

	});

	HTTPS.send(this.socket, REQUEST);

});

describe('HTTPS.receive()', function(assert) {

	assert(isFunction(HTTPS.receive), true);
	assert(this.buffer !== null);

	HTTPS.receive(this.socket, PAYLOAD, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.payload !== null);

		assert(isObject(response.headers),         true);
		assert(response.headers['@status'],        '200 OK');
		assert(response.headers['content-length'], '' + response.payload.length);

		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('<html>'));
		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));
		assert(response.payload.toString('utf8').includes('</html>'));

	});

});

after('HTTPS.disconnect()', function(assert) {

	if (this.socket !== null) {
		this.socket.end();
	}

	this.buffer     = null;
	this.connection = null;
	this.ref        = null;
	this.socket     = null;

	assert(this.buffer,     null);
	assert(this.connection, null);
	assert(this.ref,        null);
	assert(this.socket,     null);

});


export default finish('stealth/protocol/HTTPS', {
	internet: true
});

