
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

after(disconnect_stealth);


export default finish('stealth/protocol/SOCKS', {
	internet: true
});

