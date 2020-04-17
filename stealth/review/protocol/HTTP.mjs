
import { isBuffer, isFunction, isObject  } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { create, PAYLOAD, REQUEST        } from '../../../covert/EXAMPLE.mjs';
import { HTTP                            } from '../../../stealth/source/protocol/HTTP.mjs';



before('HTTP.connect', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = create('http://example.com:80/index.html').ref;
	this.socket     = null;

	assert(isFunction(HTTP.connect), true);

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

	assert(isFunction(HTTP.send), true);
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

	HTTP.send(this.socket, REQUEST);

});

describe('HTTP.receive', function(assert) {

	assert(isFunction(HTTP.receive), true);
	assert(this.buffer !== null);

	HTTP.receive(this.socket, PAYLOAD, (response) => {

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

after('HTTP.disconnect', function(assert) {

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


export default finish('stealth/protocol/HTTP', {
	internet: true
});

