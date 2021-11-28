
import { isBuffer, isFunction, isObject  } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { ENVIRONMENT                     } from '../../../stealth/source/ENVIRONMENT.mjs';
import { SOCKS                           } from '../../../stealth/source/connection/SOCKS.mjs';
import { SOCKS as PACKET                 } from '../../../stealth/source/packet/SOCKS.mjs';
import { IP                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../../../stealth/review/Stealth.mjs';



const Connection = function(type) {
	this.type = type;
};

Connection.prototype = {
	[Symbol.toStringTag]: 'Connection'
};



before(connect);

describe('Proxy.prototype.can()', function(assert) {

	assert(isFunction(this.stealth.server.proxy.can), true);

	let connection = new Connection('client');

	let buffer1 = PACKET.encode(connection, {
		headers: {
			'@auth': [ 'none' ]
		},
		payload: null
	});
	let buffer2 = PACKET.encode(connection, {
		headers: {
			'@auth': [ 'none', 'login' ]
		},
		payload: null
	});
	let buffer3 = PACKET.encode(connection, {
		headers: {
			'@auth': [ 'login' ]
		},
		payload: null
	});

	assert(this.stealth.server.proxy.can(buffer1), true);
	assert(this.stealth.server.proxy.can(buffer2), true);
	assert(this.stealth.server.proxy.can(buffer3), false);

});

describe('Proxy.prototype.upgrade()/CONNECT/domain', function(assert) {

	assert(isFunction(this.stealth.server.proxy.upgrade), true);
	assert(isFunction(SOCKS.connect),                     true);
	assert(isFunction(SOCKS.send),                        true);

	let url        = Object.assign(URL.parse('https://example.com/index.html'), { proxy: { host: '127.0.0.2', port: 65432 }});
	let connection = SOCKS.connect(url);

	connection.once('@connect', () => {

		assert(true);

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
		assert(response.headers['content-type'],     'text/html; charset=UTF-8');
		assert(response.headers['vary'],             'Accept-Encoding');

		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('Proxy.prototype.upgrade()/CONNECT/ipv4', function(assert) {

	assert(isFunction(this.stealth.server.proxy.upgrade), true);
	assert(isFunction(SOCKS.connect),                     true);
	assert(isFunction(SOCKS.send),                        true);

	let ipv4s      = IP.sort(ENVIRONMENT.ips.filter((ip) => ip.type === 'v4'));
	let url        = Object.assign(URL.parse('http://does-not-exist.com:65432/browser/index.html'), { host: IP.render(ipv4s[0]), hosts: [ ipv4s[0] ], proxy: { host: '127.0.0.2', port: 65432 }});
	let connection = SOCKS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		SOCKS.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/browser/index.html',
				'host':    'does-not-exist.com',
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
			'length':   4001,
			'range':    [ 0, 4000 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   4001);
		assert(response.headers['content-type'],     'text/html');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    4001);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('Proxy.prototype.upgrade()/CONNECT/ipv6', function(assert) {

	assert(isFunction(this.stealth.server.proxy.upgrade), true);
	assert(isFunction(SOCKS.connect),                     true);
	assert(isFunction(SOCKS.send),                        true);

	let ipv6s      = IP.sort(ENVIRONMENT.ips.filter((ip) => ip.type === 'v6'));
	let url        = Object.assign(URL.parse('http://does-not-exist.com:65432/browser/index.html'), { host: IP.render(ipv6s[0]), hosts: [ ipv6s[0] ], proxy: { host: '127.0.0.2', port: 65432 }});
	let connection = SOCKS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		SOCKS.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/browser/index.html',
				'host':    'does-not-exist.com',
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
			'length':   4001,
			'range':    [ 0, 4000 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   4001);
		assert(response.headers['content-type'],     'text/html');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    4001);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

after(disconnect);


export default finish('stealth/server/Proxy', {
	internet: true,
	network:  true
});

