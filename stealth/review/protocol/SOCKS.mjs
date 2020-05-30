
import { isBuffer, isFunction, isObject           } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { SOCKS                                    } from '../../../stealth/source/protocol/SOCKS.mjs';



before('SOCKS.connect()', function(assert) {

	this.connection = null;
	this.proxy      = { host: '127.0.0.3', port: 1080 };
	this.ref        = Object.assign(EXAMPLE.ref('https://example.com/index.html'), { proxy: this.proxy });

	assert(isFunction(SOCKS.connect), true);

	this.connection = SOCKS.connect(this.ref);

	this.connection.once('@connect', () => {
		assert(true);
	});

});

describe('SOCKS.send()', function(assert) {

	assert(isFunction(SOCKS.send), true);
	assert(this.connection !== null);

	this.connection.on('response', (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.payload !== null);

		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('<html>'));
		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));
		assert(response.payload.toString('utf8').includes('</html>'));

	});

	SOCKS.send(this.connection, EXAMPLE.request);

});

describe('SOCKS.receive()', function(assert) {

	assert(isFunction(SOCKS.receive), true);
	assert(this.connection !== null);

	SOCKS.receive(this.connection, EXAMPLE.payload, (response) => {

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

	assert(this.connection !== null);

	this.connection.once('@disconnect', () => {
		assert(true);
	});

	this.connection.disconnect();

	this.connection = null;
	this.proxy      = null;
	this.ref        = null;

	assert(this.connection, null);
	assert(this.proxy,      null);
	assert(this.ref,        null);

});


export default finish('stealth/protocol/SOCKS', {
	internet: true
});

