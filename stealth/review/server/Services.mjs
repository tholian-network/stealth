
import { Buffer, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { after, before, describe, finish        } from '../../../covert/index.mjs';
import { HTTP as PACKET                         } from '../../../stealth/source/packet/HTTP.mjs';
import { WS                                     } from '../../../stealth/source/connection/WS.mjs';
import { URL                                    } from '../../../stealth/source/parser/URL.mjs';
import { connect, disconnect                    } from '../../../stealth/review/Stealth.mjs';



const Connection = function(type) {
	this.type = type;
};

Connection.prototype = {
	[Symbol.toStringTag]: 'Connection'
};



before(connect);

describe('Services.prototype.can()', function(assert) {

	assert(isFunction(this.stealth.server.services.can), true);

	let connection = new Connection('client');

	let buffer1 = PACKET.encode(connection, {
		headers: {
			'@method':              'GET',
			'Connection':           'Upgrade',
			'Upgrade':              'WebSocket',
			'Sec-WebSocket-Key':     Buffer.from('1337', 'utf8').toString('base64'),
			'Sec-WebSocket-Version': 13
		},
		payload: Buffer.from('', 'utf8')
	});
	let buffer2 = PACKET.encode(connection, {
		headers: {
			'@method':    'GET',
			'Connection': 'Upgrade',
			'Upgrade':    'WebSocket',
		},
		payload: Buffer.from('', 'utf8')
	});

	assert(this.stealth.server.services.can(buffer1), true);
	assert(this.stealth.server.services.can(buffer2), false);

});

describe('Services.prototype.upgrade()/success', function(assert) {

	assert(isFunction(this.stealth.server.services.upgrade), true);
	assert(isFunction(WS.connect),                           true);
	assert(isFunction(WS.send),                              true);

	let defaults   = this.stealth.settings.toJSON().data;
	let url        = URL.parse('ws://localhost:65432');
	let connection = WS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		WS.send(connection, {
			headers: {
				'@operator': 0x01,
				'@type':     'request'
			},
			payload: Buffer.from(JSON.stringify({
				headers: {
					'service': 'settings',
					'method':  'read'
				},
				payload: {
					'internet': true
				}
			}, null, '\t'), 'utf8')
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['@type'],     'response');
		assert(response.headers['@operator'], 0x01);
		assert(response.headers['@transfer'], {
			'encoding': null,
			'length':   351,
			'range':    [ 0, 350 ]
		});


		let data = null;

		try {
			data = JSON.parse(response.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, {
			headers: {
				'service': 'settings',
				'event':   'read'
			},
			payload: {
				'interface': null,
				'internet':  defaults.internet,
				'beacons':   null,
				'blockers':  null,
				'hosts':     null,
				'modes':     null,
				'peers':     null,
				'policies':  null,
				'redirects': null,
				'sessions':  null
			}
		});

		setTimeout(() => {
			assert(WS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('Services.prototype.upgrade()/failure', function(assert) {

	assert(isFunction(this.stealth.server.services.upgrade), true);
	assert(isFunction(WS.connect),                           true);
	assert(isFunction(WS.send),                              true);

	setTimeout(() => {

		let connection1 = WS.connect(URL.parse('ws://localhost:65432'));
		let response1   = false;

		connection1.once('@connect', () => {

			assert(true);

			WS.send(connection1, {
				headers: {
					'@operator': 0x01,
					'@type':     'request'
				},
				payload: Buffer.from(JSON.stringify({
					headers: {
						'service': 'stealth',
						'method':  'open'
					},
					payload: URL.parse('https://malware.example.com/download.exe')
				}, null, '\t'), 'utf8')
			}, (result) => {
				assert(result, true);
			});

		});

		connection1.once('response', () => {
			response1 = true;
		});

		connection1.once('@disconnect', () => {
			assert(response1, false);
		});

	}, 0);

	setTimeout(() => {

		let connection2 = WS.connect(URL.parse('ws://localhost:65432'));
		let response2   = false;

		connection2.once('@connect', () => {

			assert(true);

			WS.send(connection2, {
				headers: {
					'@operator': 0x01,
					'@type':     'request'
				},
				payload: Buffer.from(JSON.stringify({
					headers: {
						'service': '__state',
						'method':  'connections'
					},
					payload: null
				}, null, '\t'), 'utf8')
			}, (result) => {
				assert(result, true);
			});

		});

		connection2.once('response', () => {
			response2 = true;
		});

		connection2.once('@disconnect', () => {
			assert(response2, false);
		});

	}, 500);

	setTimeout(() => {

		let connection3 = WS.connect(URL.parse('ws://localhost:65432'));
		let response3   = false;

		connection3.once('@connect', () => {

			assert(true);

			WS.send(connection3, {
				headers: {
					'@operator': 0x01,
					'@type':     'request'
				},
				payload: Buffer.from(JSON.stringify({
					headers: {
						'service': 'doesnt-exist',
						'event':   'malicious'
					},
					payload: null
				}, null, '\t'), 'utf8')
			}, (result) => {
				assert(result, true);
			});

			setTimeout(() => {
				assert(WS.disconnect(connection3), true);
			}, 500);

		});

		connection3.once('response', () => {
			response3 = true;
		});

		connection3.once('@disconnect', () => {
			assert(response3, false);
		});

	}, 500);

});

after(disconnect);


export default finish('stealth/server/Services', {
	internet: false,
	network:  true
});

