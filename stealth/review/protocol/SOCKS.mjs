
import { isBuffer, isFunction, isObject  } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { create, PAYLOAD, REQUEST        } from '../../../covert/EXAMPLE.mjs';
import { SOCKS                           } from '../../../stealth/source/protocol/SOCKS.mjs';



before('SOCKS.connect()', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.proxy      = { host: '127.0.0.3', port: 1080 };
	this.ref        = Object.assign(create('https://example.com/index.html').ref, { proxy: this.proxy });
	this.socket     = null;

	assert(isFunction(SOCKS.connect), true);

	this.connection = SOCKS.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

});

describe('SOCKS.send()', function(assert) {

	assert(isFunction(SOCKS.send), true);
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

	SOCKS.send(this.socket, REQUEST);

});

describe('SOCKS.receive()', function(assert) {

	assert(isFunction(SOCKS.receive), true);
	assert(this.buffer !== null);
	assert(this.socket !== null);

	SOCKS.receive(this.socket, PAYLOAD, (response) => {

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

after('SOCKS.disconnect()', function(assert) {

	if (this.socket !== null) {
		this.socket.end();
	}

	this.buffer     = null;
	this.connection = null;
	this.proxy      = null;
	this.ref        = null;
	this.socket     = null;

	assert(this.buffer,     null);
	assert(this.connection, null);
	assert(this.proxy,      null);
	assert(this.ref,        null);
	assert(this.socket,     null);

});


export default finish('stealth/protocol/SOCKS', {
	internet: true
});

