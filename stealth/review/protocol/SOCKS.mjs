
import { Buffer, isBuffer, isFunction, isObject                       } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE                     } from '../../../covert/index.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { HTTP                                                         } from '../../../stealth/source/protocol/HTTP.mjs';
import { HTTPS                                                        } from '../../../stealth/source/protocol/HTTPS.mjs';
import { SOCKS                                                        } from '../../../stealth/source/protocol/SOCKS.mjs';
import { WS                                                           } from '../../../stealth/source/protocol/WS.mjs';
import { WSS                                                          } from '../../../stealth/source/protocol/WSS.mjs';



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

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

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

		setTimeout(() => {
			assert(SOCKS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

// TODO: SOCKS.receive()/client
// TODO: SOCKS.receive()/server

describe('SOCKS.connect()/http', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(HTTP.send),     true);


	let ref        = Object.assign(EXAMPLE.ref('http://example.com/index.html'), { proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(ref);

	connection.once('@tunnel', (tunnel) => {

		tunnel.once('response', (response) => {

			assert(isObject(response),         true);
			assert(isObject(response.headers), true);
			assert(isBuffer(response.payload), true);

			assert(response.headers['@status'],          '200 OK');
			assert(response.headers['content-encoding'], 'gzip');
			assert(response.headers['content-type'],     'text/html; charset=UTF-8');
			assert(response.headers['vary'],             'Accept-Encoding');

			assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));

		});

		tunnel.once('@connect', () => {

			assert(HTTP.send(tunnel, {
				headers: {
					'@method':         'GET',
					'@url':            '/index.html',
					'host':            'example.com',
					'accept-encoding': 'gzip'
				},
				payload: null
			}), true);

		});

	});

});

describe('SOCKS.connect()/https', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(HTTPS.send),    true);


	let ref        = Object.assign(EXAMPLE.ref('https://example.com/index.html'), { proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(ref);

	connection.once('@tunnel', (tunnel) => {

		tunnel.once('response', (response) => {

			assert(isObject(response),         true);
			assert(isObject(response.headers), true);
			assert(isBuffer(response.payload), true);

			assert(response.headers['@status'],          '200 OK');
			assert(response.headers['content-encoding'], 'gzip');
			assert(response.headers['content-type'],     'text/html; charset=UTF-8');
			assert(response.headers['vary'],             'Accept-Encoding');

			assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));

		});

		tunnel.once('@connect', () => {

			assert(HTTPS.send(tunnel, {
				headers: {
					'@method':         'GET',
					'@url':            '/index.html',
					'host':            'example.com',
					'accept-encoding': 'gzip'
				},
				payload: null
			}), true);

		});

	});

});

describe('SOCKS.connect()/ws', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(WS.send),       true);


	let ref        = Object.assign(EXAMPLE.ref('ws://echo.websocket.org:80'), { proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(ref);

	connection.once('@tunnel', (tunnel) => {

		tunnel.once('response', (response) => {

			assert(response, {
				headers: {
					service: 'service',
					event:   'event',
					method:  'method'
				},
				payload: Buffer.from('payload', 'utf8')
			});

		});

		tunnel.once('@connect', () => {

			assert(WS.send(tunnel, {
				headers: {
					service: 'service',
					event:   'event',
					method:  'method'
				},
				payload: Buffer.from('payload', 'utf8')
			}), true);

		});

	});

});

describe('SOCKS.connect()/wss', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(WSS.send),      true);


	let ref        = Object.assign(EXAMPLE.ref('wss://echo.websocket.org:443'), { proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(ref);

	connection.once('@tunnel', (tunnel) => {

		tunnel.once('response', (response) => {

			assert(response, {
				headers: {
					service: 'service',
					event:   'event',
					method:  'method'
				},
				payload: Buffer.from('payload', 'utf8')
			});

		});

		tunnel.once('@connect', () => {

			assert(WSS.send(tunnel, {
				headers: {
					service: 'service',
					event:   'event',
					method:  'method'
				},
				payload: Buffer.from('payload', 'utf8')
			}), true);

		});

	});

});

after(disconnect_stealth);


export default finish('stealth/protocol/SOCKS', {
	internet: true
});

