
import { isBuffer, isFunction, isObject                               } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE                     } from '../../../covert/index.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { HTTPS                                                        } from '../../../stealth/source/protocol/HTTPS.mjs';
import { SOCKS                                                        } from '../../../stealth/source/protocol/SOCKS.mjs';



before(connect_stealth);

describe('SOCKS.connect()', function(assert) {

	assert(isFunction(SOCKS.connect), true);


	let ref        = Object.assign(EXAMPLE.ref('https://example.com/index.html'), { proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(ref);

	connection.once('@connect', () => {
		assert(true);
	});

	connection.once('@tunnel', () => {
		assert(true);
	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		connection.disconnect();
	}, 500);

});

describe('SOCKS.disconnect()', function(assert) {

	assert(isFunction(SOCKS.disconnect), true);


	let ref        = Object.assign(EXAMPLE.ref('https://example.com/index.html'), { proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(ref);

	connection.once('@connect', () => {
		assert(true);
	});

	connection.once('@tunnel', () => {
		assert(true);
	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		assert(SOCKS.disconnect(connection), true);
	}, 500);

});

describe('SOCKS.receive()', function(assert) {

	assert(isFunction(SOCKS.receive), true);


});

describe('SOCKS.send()', function(assert, console) {

	assert(isFunction(SOCKS.send), true);


	let ref        = Object.assign(EXAMPLE.ref('https://example.com/index.html'), { proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(ref);

	connection.once('@connect', () => {
		assert(true);
	});

	connection.once('@tunnel', () => {

		assert(true);

		connection.once('@connect', () => {

			assert(true);

			connection.once('response', (response) => {

				console.log(response);

			});

			assert(HTTPS.send(connection, EXAMPLE.request), true);

		});

		HTTPS.connect(ref, connection);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		assert(SOCKS.disconnect(connection), true);
	}, 500);

});


// describe('SOCKS.send()', function(assert) {
//
//
// 	this.connection.on('response', (response) => {
//
// 		assert(response !== null);
// 		assert(response.headers !== null);
// 		assert(response.payload !== null);
//
// 		assert(isBuffer(response.payload), true);
// 		assert(response.payload.toString('utf8').includes('<html>'));
// 		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));
// 		assert(response.payload.toString('utf8').includes('</html>'));
//
// 	});
//
// 	SOCKS.send(this.connection, EXAMPLE.request);
//
// });
//
// describe('SOCKS.receive()', function(assert) {
//
// 	assert(isFunction(SOCKS.receive), true);
// 	assert(this.connection !== null);
//
// 	SOCKS.receive(this.connection, EXAMPLE.payload, (response) => {
//
// 		assert(response !== null);
// 		assert(response.headers !== null);
// 		assert(response.payload !== null);
//
// 		assert(isObject(response.headers),         true);
// 		assert(response.headers['@status'],        '200 OK');
// 		assert(response.headers['content-length'], '' + response.payload.length);
//
// 		assert(isBuffer(response.payload), true);
// 		assert(response.payload.toString('utf8').includes('<html>'));
// 		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));
// 		assert(response.payload.toString('utf8').includes('</html>'));
//
// 	});
//
// });
//
// after('SOCKS.disconnect()', function(assert) {
//
// 	assert(this.connection !== null);
//
// 	this.connection.once('@disconnect', () => {
// 		assert(true);
// 	});
//
// 	this.connection.disconnect();
//
// 	this.connection = null;
// 	this.proxy      = null;
// 	this.ref        = null;
//
// 	assert(this.connection, null);
// 	assert(this.proxy,      null);
// 	assert(this.ref,        null);
//
// });

after(disconnect_stealth);


export default finish('stealth/protocol/SOCKS', {
	internet: true
});

