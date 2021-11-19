
import { isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish               } from '../../../covert/index.mjs';
import { HTTPS                          } from '../../../stealth/source/connection/HTTPS.mjs';
import { IP                             } from '../../../stealth/source/parser/IP.mjs';
import { URL                            } from '../../../stealth/source/parser/URL.mjs';



describe('HTTPS.connect()', function(assert) {

	assert(isFunction(HTTPS.connect), true);


	let url        = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
	let connection = HTTPS.connect(url);

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

describe('HTTPS.disconnect()', function(assert) {

	assert(isFunction(HTTPS.disconnect), true);


	let url        = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
	let connection = HTTPS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(HTTPS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('HTTPS.send()/client/200', function(assert) {

	assert(isFunction(HTTPS.send), true);

	let url        = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
	let connection = HTTPS.connect(url);

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['@status'],   200);
		assert(response.headers['@transfer'], {
			'encoding': 'gzip',
			'length':   648,
			'range':    [ 0, 647 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   1256);
		assert(response.headers['content-type'],     'text/html; charset=UTF-8');
		assert(response.headers['vary'],             'Accept-Encoding');

		setTimeout(() => {
			assert(HTTPS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		HTTPS.send(connection, {
			headers: {
				'@method':         'GET',
				'@url':            '/index.html',
				'accept-encoding': 'gzip',
				'host':            'example.com',
			},
			payload: null
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});


export default finish('stealth/connection/HTTPS', {
	internet: true,
	network:  true,
	ports:    [ 443 ]
});

