
import { isBuffer, isFunction, isObject           } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { HTTP                                     } from '../../../stealth/source/protocol/HTTP.mjs';



before('HTTP.connect()', function(assert) {

	assert(isFunction(HTTP.connect), true);


	let ref        = EXAMPLE.ref('http://example.com:80/index.html');
	let connection = HTTP.connect(ref);

	connection.once('@connect', () => {
		assert(true);
	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		connection.disconnect();
	}, 500);

});

after('HTTP.disconnect()', function(assert) {

	assert(isFunction(HTTP.disconnect), true);


	let ref        = EXAMPLE.ref('http://example.com:80/index.html');
	let connection = HTTP.connect(ref);

	connection.once('@connect', () => {
		assert(true);
	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		assert(HTTP.disconnect(connection), true);
	}, 500);

});

describe('HTTP.receive()', function(assert) {

	assert(isFunction(HTTP.receive), true);


	HTTP.receive(null, EXAMPLE.payload, (response) => {

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

describe('HTTP.send()', function(assert) {

	assert(isFunction(HTTP.send), true);


	let ref        = EXAMPLE.ref('http://example.com:80/index.html');
	let connection = HTTP.connect(ref);

	connection.on('response', (response) => {

		assert(isObject(response), true);

		assert(isObject(response.headers),  true);
		assert(response.headers['@status'], '200 OK');

		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('<html>'));
		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));
		assert(response.payload.toString('utf8').includes('</html>'));

	});

	connection.once('@connect', () => {
		assert(HTTP.send(connection, EXAMPLE.request), true);
	});

});


export default finish('stealth/protocol/HTTP', {
	internet: true
});

