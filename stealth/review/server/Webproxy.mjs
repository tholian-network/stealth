
import { isBuffer, isFunction, isObject  } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { HTTP                            } from '../../../stealth/source/connection/HTTP.mjs';
import { HTTP as PACKET                  } from '../../../stealth/source/packet/HTTP.mjs';
import { HTTPS                           } from '../../../stealth/source/connection/HTTPS.mjs';
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

describe('Webproxy.prototype.can()/CONNECT', function(assert) {

	assert(isFunction(this.stealth.server.webproxy.can), true);

	let connection = new Connection('client');

	let buffer1 = PACKET.encode(connection, {
		headers: {
			'@method': 'CONNECT',
			'host':    'example.com:80'
		},
		payload: null
	});
	let buffer2 = PACKET.encode(connection, {
		headers: {
			'@method': 'CONNECT',
			'host':    'example.com:443'
		},
		payload: null
	});

	assert(this.stealth.server.webproxy.can(buffer1), true);
	assert(this.stealth.server.webproxy.can(buffer2), true);

});

describe('Webproxy.prototype.upgrade()/CONNECT', function(assert) {

	assert(isFunction(this.stealth.server.webproxy.upgrade), true);
	assert(isFunction(HTTP.connect),                         true);
	assert(isFunction(HTTP.send),                            true);

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

describe('Webproxy.prototype.can()/GET', function(assert) {

	assert(isFunction(this.stealth.server.webproxy.can), true);

	let connection = new Connection('client');

	let buffer1 = PACKET.encode(connection, {
		headers: {
			'@method': 'GET',
			'@url':    'https://example.com/index.html'
		},
		payload: null
	});
	let buffer2 = PACKET.encode(connection, {
		headers: {
			'@method': 'GET',
			'@url':    '/stealth/https://example.com/index.html'
		},
		payload: null
	});

	assert(this.stealth.server.webproxy.can(buffer1), true);
	assert(this.stealth.server.webproxy.can(buffer2), true);

});

describe('Webproxy.prototype.upgrade()/GET/failure', function(assert) {

	assert(isFunction(this.stealth.server.webproxy.upgrade), true);
	assert(isFunction(HTTP.connect),                         true);
	assert(isFunction(HTTP.send),                            true);

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

	connection.once('error', (err) => {

		assert(err, {
			code:  403,
			type:  'connection',
			cause: 'headers'
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('Mode.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.mode.save), true);

	this.server.services.mode.save({
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'mode',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Webproxy.prototype.upgrade()/GET/success', function(assert) {

	assert(isFunction(this.stealth.server.webproxy.upgrade), true);
	assert(isFunction(HTTP.connect),                         true);
	assert(isFunction(HTTP.send),                            true);

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method':         'GET',
				'@url':            'https://example.com/index.html',
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
		assert(response.headers['content-length'],   1256);
		assert(response.headers['content-type'],     'text/html');

		setTimeout(() => {
			assert(HTTP.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('Webproxy.prototype.upgrade()/GET/webview', function(assert) {

	assert(isFunction(this.stealth.server.webproxy.upgrade), true);
	assert(isFunction(HTTP.connect),                         true);
	assert(isFunction(HTTP.send),                            true);

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    '/stealth/https://example.com/index.html',
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
			'length':   1256,
			'range':    [ 0, 1255 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   1256);
		assert(response.headers['content-type'],     'text/html');

		setTimeout(() => {
			assert(HTTP.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

after(disconnect);


export default finish('stealth/server/Webproxy', {
	internet: false,
	network:  true
});

