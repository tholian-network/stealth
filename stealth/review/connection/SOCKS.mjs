
import net from 'net';

import { Buffer, isBuffer, isFunction, isObject                       } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { DNSS                                                         } from '../../../stealth/source/connection/DNSS.mjs';
import { HTTP                                                         } from '../../../stealth/source/connection/HTTP.mjs';
import { HTTPS                                                        } from '../../../stealth/source/connection/HTTPS.mjs';
import { IP                                                           } from '../../../stealth/source/parser/IP.mjs';
import { SOCKS                                                        } from '../../../stealth/source/connection/SOCKS.mjs';
import { URL                                                          } from '../../../stealth/source/parser/URL.mjs';
import { WS                                                           } from '../../../stealth/source/connection/WS.mjs';
import { WSS                                                          } from '../../../stealth/source/connection/WSS.mjs';



before(connect_stealth);

describe('SOCKS.connect()', function(assert) {

	assert(isFunction(SOCKS.connect), true);


	let url        = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ], proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(url);

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


	let url        = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ], proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(url);

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

describe('SOCKS.connect()/dnss', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(DNSS.send),     true);


	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com'), { hosts: [ IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111'), IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001') ], proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(url);

	connection.once('@tunnel', (tunnel) => {

		tunnel.once('response', (response) => {

			assert(response, {
				headers: {
					'@id':   13337,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'A',
						value:  null
					}],
					answers: [{
						domain: 'example.com',
						type:   'A',
						value:  IP.parse('93.184.216.34')
					}]
				}
			});

		});

		tunnel.once('@connect', () => {

			DNSS.send(tunnel, {
				headers: {
					'@id': 13337
				},
				payload: {
					questions: [{
						domain: 'example.com',
						type:   'A',
						value:  null
					}]
				}
			}, (result) => {

				assert(result, true);

			});

		});

	});

});

describe('SOCKS.connect()/http', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(HTTP.send),     true);


	let url        = Object.assign(URL.parse('http://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ], proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(url);

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

			HTTP.send(tunnel, {
				headers: {
					'@method':         'GET',
					'@url':            '/index.html',
					'host':            'example.com',
					'accept-encoding': 'gzip'
				},
				payload: null
			}, (result) => {

				assert(result, true);

			});

		});

	});

});

describe('SOCKS.connect()/https', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(HTTPS.send),    true);


	let url        = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ], proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(url);

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

			HTTPS.send(tunnel, {
				headers: {
					'@method':         'GET',
					'@url':            '/index.html',
					'host':            'example.com',
					'accept-encoding': 'gzip'
				},
				payload: null
			}, (result) => {

				assert(result, true);

			});

		});

	});

});

describe('SOCKS.connect()/ws', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(WS.send),       true);


	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ], proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(url);

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

			WS.send(tunnel, {
				headers: {
					service: 'service',
					event:   'event',
					method:  'method'
				},
				payload: Buffer.from('payload', 'utf8')
			}, (result) => {

				assert(result, true);

			});

		});

	});

});

describe('SOCKS.connect()/wss', function(assert) {

	assert(isFunction(SOCKS.connect), true);
	assert(isFunction(WSS.send),      true);


	let url        = Object.assign(URL.parse('wss://echo.websocket.org:443'), { hosts: [ IP.parse('174.129.224.73') ], proxy: { host: '127.0.0.1', port: 65432 }});
	let connection = SOCKS.connect(url);

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

			WSS.send(tunnel, {
				headers: {
					service: 'service',
					event:   'event',
					method:  'method'
				},
				payload: Buffer.from('payload', 'utf8')
			}, (result) => {

				assert(result, true);

			});

		});

	});

});

describe('SOCKS.upgrade()', function(assert) {

	let server = new net.Server({
		allowHalfOpen:  true,
		pauseOnConnect: true
	});

	server.once('connection', (socket) => {

		let connection = SOCKS.upgrade(socket);

		connection.once('@connect', () => {
			assert(true);
		});

		connection.once('@connect-tunnel', (request, callback) => {

			let url    = request.payload;
			let tunnel = null;

			try {

				tunnel = net.connect({
					host: url.hosts[0].ip,
					port: url.port
				}, () => {

					let host = URL.toHost(url);
					let port = url.port || null;

					if (host !== null && port !== null) {
						callback('success', URL.parse(host + ':' + port), tunnel);
					} else {
						callback('error-host', null);
					}

				});

			} catch (err) {
				tunnel = null;
			}

			if (tunnel === null) {
				callback('error-connection', null);
			}

		});

		connection.once('@disconnect', () => {
			assert(true);
		});

		socket.resume();

	});

	server.listen(13337, null);


	let url        = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ], proxy: { host: '127.0.0.1', port: 13337 }});
	let connection = SOCKS.connect(url);

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

			SOCKS.send(connection, {
				headers: {
					'@method':         'GET',
					'@url':            '/index.html',
					'host':            'example.com',
					'accept-encoding': 'gzip'
				},
				payload: null
			}, (result) => {

				assert(result, true);

			});

		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		server.close();
		assert(true);
	}, 3000);

});

after(disconnect_stealth);


export default finish('stealth/connection/SOCKS', {
	internet: true,
	network:  true
});

