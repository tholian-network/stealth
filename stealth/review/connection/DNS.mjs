
import { Buffer, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish                       } from '../../../covert/index.mjs';
import { DNS                                    } from '../../../stealth/source/connection/DNS.mjs';
import { URL                                    } from '../../../stealth/source/parser/URL.mjs';



describe('DNS.connect()', function(assert) {

	assert(isFunction(DNS.connect), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNS.disconnect()', function(assert) {

	assert(isFunction(DNS.disconnect), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNS.receive()/client', function(assert) {

	// TODO: Test A, AAAA, CNAME
	// TODO: Test TXT, SRV and others
	assert(false);

});

describe('DNS.send()', function(assert) {

	assert(isFunction(DNS.send), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		console.log(response);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@type': 'request'
			},
			payload: {
				questions: [{
					name: 'example.com',
					type: 'A'
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});



export default finish('stealth/connection/DNS', {
	internet: true,
	network:  true
});

