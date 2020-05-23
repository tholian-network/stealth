
import { isBuffer, isFunction, isObject           } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { HTTP                                     } from '../../../stealth/source/protocol/HTTP.mjs';



before('HTTP.connect()', function(assert) {

	this.connection = null;
	this.ref        = EXAMPLE.ref('http://example.com:80/index.html');

	assert(isFunction(HTTP.connect), true);

	this.connection = HTTP.connect(this.ref);

	this.connection.once('@connect', () => {
		assert(true);
	});

});

describe('HTTP.send()', function(assert) {

	assert(isFunction(HTTP.send), true);
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

	HTTP.send(this.connection, EXAMPLE.request);

});

describe('HTTP.receive()', function(assert) {

	assert(isFunction(HTTP.receive), true);
	assert(this.connection !== null);

	HTTP.receive(this.connection, EXAMPLE.payload, (response) => {

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

after('HTTP.disconnect()', function(assert) {

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


export default finish('stealth/protocol/HTTP', {
	internet: true
});

