
import { Buffer, isBuffer, isObject      } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { ENVIRONMENT                     } from '../../../stealth/source/ENVIRONMENT.mjs';
import { HTTP                            } from '../../../stealth/source/connection/HTTP.mjs';
import { HTTPS                           } from '../../../stealth/source/connection/HTTPS.mjs';
import { IP                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../../../stealth/review/Stealth.mjs';



before(connect);

describe('Webproxy.prototype.upgrade()/CONNECT', function(assert) {

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'CONNECT',
				'host':    'example.com:443'
			},
			payload: null
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['@status'],   200);
		assert(response.headers['@transfer'], {
			'encoding': 'identity',
			'length':   0,
			'range':    [ 0, 0 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   0);


		let url    = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
		let tunnel = HTTPS.connect(url, connection);

		tunnel.once('@connect', () => {

			assert(true);

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

		tunnel.once('response', (response) => {

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
				assert(HTTPS.disconnect(tunnel), true);
			}, 0);

		});

		tunnel.once('@disconnect', () => {
			assert(true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('Webproxy.prototype.upgrade()/GET', function(assert, console) {

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    'https://example.com/index.html'
			},
			payload: null
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('response', (response) => {

		console.log(response);

		assert(false);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});


// TODO: HTTP Proxy usage with GET http://url
// TODO: GET /stealth/ usage with :tabid:
// TODO: GET /stealth/ usage with :tabid: and flags
// TODO: GET /stealth/ usage without any flags

after(disconnect);


export default finish('stealth/server/Webproxy', {
	internet: false,
	network:  true
});

