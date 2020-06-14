
import { isBuffer, isFunction, isObject           } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { HTTPS                                    } from '../../../stealth/source/protocol/HTTPS.mjs';



before('HTTPS.connect()', function(assert) {

	this.connection = null;
	this.ref        = EXAMPLE.ref('https://example.com:443/index.html');

	assert(isFunction(HTTPS.connect), true);

	this.connection = HTTPS.connect(this.ref);

	this.connection.on('@connect', () => {
		assert(true);
	});

});

describe('HTTPS.send()', function(assert) {

	assert(isFunction(HTTPS.send), true);
	assert(this.connection !== null);

	this.connection.on('response', (response) => {

		assert(isObject(response), true);

		assert(isObject(response.headers),  true);
		assert(response.headers['@status'], '200 OK');

		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('<html>'));
		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));
		assert(response.payload.toString('utf8').includes('</html>'));

	});

	HTTPS.send(this.connection, EXAMPLE.request);

});

describe('HTTPS.receive()', function(assert) {

	assert(isFunction(HTTPS.receive), true);
	assert(this.connection !== null);

	HTTPS.receive(this.connection, EXAMPLE.payload, (response) => {

		assert(isObject(response), true);

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

	assert(this.connection !== null);

	this.connection.once('@disconnect', () => {
		assert(true);
	});

	this.connection.disconnect();

	this.connection = null;
	this.ref        = null;

	assert(this.connection, null);
	assert(this.ref,        null);

});


export default finish('stealth/protocol/HTTPS', {
	internet: true
});

