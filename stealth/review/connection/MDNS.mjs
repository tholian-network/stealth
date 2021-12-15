
import { Buffer, isFunction              } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { MDNS                            } from '../../../stealth/source/connection/MDNS.mjs';
import { IP                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';



const PAYLOADS = {

	'DNS-SD': {

		'REQUEST': Buffer.from([

			0x00, 0x29, 0x01, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,

			// question: PTR for _stealth._wss.tholian.local
			0x08, 0x5f, 0x73, 0x74, 0x65, 0x61, 0x6c, 0x74, 0x68,
			0x04, 0x5f, 0x77, 0x73, 0x73,
			0x07, 0x74, 0x68, 0x6f, 0x6c, 0x69, 0x61, 0x6e,
			0x05, 0x6c, 0x6f, 0x63, 0x61, 0x6c,
			0x00, 0x00, 0x0c, 0x00, 0x01,

			// question: PTR for _stealth._ws.tholian.local
			0x08, 0x5f, 0x73, 0x74, 0x65, 0x61, 0x6c, 0x74, 0x68,
			0x03, 0x5f, 0x77, 0x73,
			0x07, 0x74, 0x68, 0x6f, 0x6c, 0x69, 0x61, 0x6e,
			0x05, 0x6c, 0x6f, 0x63, 0x61, 0x6c,
			0x00, 0x00, 0x0c, 0x00, 0x01

		]),

		'RESPONSE': Buffer.from([

			0x00, 0x29, 0x81, 0x00, 0x00, 0x02, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00,

			// question: PTR for _stealth._wss.tholian.local
			0x08, 0x5f, 0x73, 0x74, 0x65, 0x61, 0x6c, 0x74, 0x68,
			0x04, 0x5f, 0x77, 0x73, 0x73,
			0x07, 0x74, 0x68, 0x6f, 0x6c, 0x69, 0x61, 0x6e,
			0x05, 0x6c, 0x6f, 0x63, 0x61, 0x6c,
			0x00, 0x00, 0x0c, 0x00, 0x01,

			// question: PTR for _stealth._ws.tholian.local
			0x08, 0x5f, 0x73, 0x74, 0x65, 0x61, 0x6c, 0x74, 0x68,
			0x03, 0x5f, 0x77, 0x73,
			0x07, 0x74, 0x68, 0x6f, 0x6c, 0x69, 0x61, 0x6e,
			0x05, 0x6c, 0x6f, 0x63, 0x61, 0x6c,
			0x00, 0x00, 0x0c, 0x00, 0x01,

			// answer: PTR for _stealth._ws.tholian.local with tinky
			0xc0, 0x2d,
			0x00, 0x0c,
			0x00, 0x01,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x07,
			0x05, 0x74, 0x69, 0x6e, 0x6b, 0x79, 0x00,

			// answer: SRV for _stealth._ws.tholian.local with tinky:65432
			0xc0, 0x2d,
			0x00, 0x21,
			0x00, 0x01,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x0d,
			0x00, 0x00, 0x00, 0x00,
			0xff, 0x98,
			0x05, 0x74, 0x69, 0x6e, 0x6b, 0x79, 0x00,

			// answer: TXT for tinky with version=X0:2021-08-18
			0x05, 0x74, 0x69, 0x6e, 0x6b, 0x79, 0x00,
			0x00, 0x10,
			0x00, 0x01,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x16, 0x15,
			0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x3d, 0x58, 0x30, 0x3a, 0x32, 0x30, 0x32, 0x31, 0x2d, 0x30, 0x38, 0x2d, 0x31, 0x38,

			// answer: A for tinky with 192.168.0.12
			0x05, 0x74, 0x69, 0x6e, 0x6b, 0x79, 0x00,
			0x00, 0x01,
			0x00, 0x01,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x04, 0xc0, 0xa8, 0x00, 0x0c,

			// answer: AAAA for tinky with 2a02:8071:0b99:aa00::4209
			0x05, 0x74, 0x69, 0x6e, 0x6b, 0x79, 0x00,
			0x00, 0x1c,
			0x00, 0x01,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x10, 0x2a, 0x02, 0x80, 0x71, 0x0b, 0x99, 0xaa, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x42, 0x09,

			// answer: AAAA for tinky with 2a02:8071:0b99:aa00:b002:736e:e131:7202
			0x05, 0x74, 0x69, 0x6e, 0x6b, 0x79, 0x00,
			0x00, 0x1c,
			0x00, 0x01,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x10, 0x2a, 0x02, 0x80, 0x71, 0x0b, 0x99, 0xaa, 0x00, 0xb0, 0x02, 0x73, 0x6e, 0xe1, 0x31, 0x72, 0x02

		])

	}

};



before('MDNS.upgrade()', function(assert) {

	assert(isFunction(MDNS.upgrade), true);

	this.connection = MDNS.upgrade(null, URL.parse('mdns://224.0.0.251:13337'));

	this.connection.once('@connect', () => {
		assert(true);
	});

});

describe('MDNS.connect()', function(assert) {

	assert(isFunction(MDNS.connect), true);

	let url        = URL.parse('mdns://224.0.0.251:13337');
	let connection = MDNS.connect(url);

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

describe('MDNS.disconnect()', function(assert) {

	assert(isFunction(MDNS.connect),    true);
	assert(isFunction(MDNS.disconnect), true);

	let url        = URL.parse('mdns://224.0.0.251:13337');
	let connection = MDNS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(MDNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('MDNS.receive()/client/DNS-SD', function(assert) {

	assert(isFunction(MDNS.connect),    true);
	assert(isFunction(MDNS.disconnect), true);
	assert(isFunction(MDNS.receive),    true);

	let url        = URL.parse('mdns://224.0.0.251:13337');
	let connection = MDNS.connect(url);

	connection.once('@connect', () => {

		MDNS.receive(connection, PAYLOADS['DNS-SD']['RESPONSE'], (response) => {

			assert(response, {
				headers: {
					'@id':   41,
					'@type': 'response'
				},
				payload: {
					questions: [{
						domain: null,
						type:   'PTR',
						value:  '_stealth._wss.tholian.local'
					}, {
						domain: null,
						type:   'PTR',
						value:  '_stealth._ws.tholian.local'
					}],
					answers: [{
						domain: 'tinky',
						type:   'PTR',
						value:  '_stealth._ws.tholian.local'
					}, {
						domain: 'tinky',
						type:   'TXT',
						value:  [
							Buffer.from('version=X0:2021-08-18', 'utf8')
						]
					}, {
						domain: '_stealth._ws.tholian.local',
						type:   'SRV',
						value:  'tinky',
						weight: 0,
						port:   65432
					}, {
						domain: 'tinky',
						type:   'A',
						value:  IP.parse('192.168.0.12')
					}, {
						domain: 'tinky',
						type:   'AAAA',
						value:  IP.parse('2a02:8071:0b99:aa00::4209')
					}, {
						domain: 'tinky',
						type:   'AAAA',
						value:  IP.parse('2a02:8071:0b99:aa00:b002:736e:e131:7202')
					}]
				}
			});

		});

		setTimeout(() => {
			assert(MDNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('MDNS.receive()/server/DNS-SD', function(assert) {

	assert(isFunction(MDNS.connect),    true);
	assert(isFunction(MDNS.disconnect), true);
	assert(isFunction(MDNS.receive),    true);

	let url        = URL.parse('mdns://224.0.0.251:13337');
	let connection = MDNS.connect(url);

	connection.once('@connect', () => {

		MDNS.receive(connection, PAYLOADS['DNS-SD']['REQUEST'], (request) => {

			assert(request, {
				headers: {
					'@id':   41,
					'@type': 'request'
				},
				payload: {
					questions: [{
						domain: null,
						type:   'PTR',
						value:  '_stealth._wss.tholian.local'
					}, {
						domain: null,
						type:   'PTR',
						value:  '_stealth._ws.tholian.local'
					}],
					answers: []
				}
			});

		});

		setTimeout(() => {
			assert(MDNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('MDNS.send()/server/DNS-SD', function(assert, console) {

	assert(isFunction(MDNS.connect),    true);
	assert(isFunction(MDNS.disconnect), true);
	assert(isFunction(MDNS.send),       true);

	this.connection.once('request', (request) => {

		// TODO: This event does not fire
		console.warn('REQUEST', request);

		assert(request, {
			headers: {
				'@id':    12345,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  '_stealth._wss.tholian.local'
				}, {
					domain: null,
					type:   'PTR',
					value:  '_stealth._ws.tholian.local'
				}],
				answers: []
			}
		});

		MDNS.send(this.connection, {
			headers: {
				'@id':    12345,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  '_stealth._wss.tholian.local'
				}, {
					domain: null,
					type:   'PTR',
					value:  '_stealth._ws.tholian.local'
				}],
				answers: [{
					domain: 'covert.local',
					type:   'PTR',
					value:  '_stealth._ws.tholian.local'
				}, {
					domain: 'covert.local',
					type:   'TXT',
					value:  [
						Buffer.from('version=X0:1337', 'utf8')
					]
				}, {
					domain: '_stealth._ws.tholian.local',
					type:   'SRV',
					value:  'covert.local',
					weight: 0,
					port:   65432
				}, {
					domain: 'covert.local',
					type:   'A',
					value:  IP.parse('1.3.3.7')
				}, {
					domain: 'covert.local',
					type:   'AAAA',
					value:  IP.parse('fe80::1337')
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('mdns://224.0.0.251:13337');
	let connection = MDNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':    12345,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  '_stealth._wss.tholian.local'
				}, {
					domain: null,
					type:   'PTR',
					value:  '_stealth._ws.tholian.local'
				}],
				answers: [{
					domain: 'covert.local',
					type:   'PTR',
					value:  '_stealth._ws.tholian.local'
				}, {
					domain: 'covert.local',
					type:   'TXT',
					value:  [
						Buffer.from('version=X0:1337', 'utf8')
					]
				}, {
					domain: '_stealth._ws.tholian.local',
					type:   'SRV',
					value:  'covert.local',
					weight: 0,
					port:   65432
				}, {
					domain: 'covert.local',
					type:   'A',
					value:  IP.parse('1.3.3.7')
				}, {
					domain: 'covert.local',
					type:   'AAAA',
					value:  IP.parse('fe80::1337')
				}]
			}
		});

		setTimeout(() => {
			assert(MDNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		MDNS.send(connection, {
			headers: {
				'@id':    12345,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  '_stealth._wss.tholian.local'
				}, {
					domain: null,
					type:   'PTR',
					value:  '_stealth._ws.tholian.local'
				}],
				answers: []
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

after('MDNS.disconnect()', function(assert) {

	assert(isFunction(MDNS.disconnect), true);

	this.connection.once('@disconnect', () => {
		assert(true);
	});

	assert(MDNS.disconnect(this.connection), true);

	this.connection = null;

});


export default finish('stealth/connection/MDNS', {
	internet: true,
	network:  false,
	ports:    [ 13337 ]
});

