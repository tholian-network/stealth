
import net from 'net';

import { Buffer, isFunction, isObject    } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';
import { WS                              } from '../../../stealth/source/connection/WS.mjs';



const PAYLOADS = {

	'PARTIAL': {

		'REQUEST1': (() => {

			let headers = Buffer.from([
				0 + 0x01,
				128 + 64
			]);

			let mask = Buffer.alloc(4);

			mask[0] = (Math.random() * 0xff) | 0;
			mask[1] = (Math.random() * 0xff) | 0;
			mask[2] = (Math.random() * 0xff) | 0;
			mask[3] = (Math.random() * 0xff) | 0;

			let payload = Buffer.from('The sentence #1 inside the big buffer is exactly 64 bytes long.\n', 'utf8');

			return Buffer.concat([
				headers,
				mask,
				payload.map((value, index) => value ^ mask[index % mask.length])
			]);

		})(),

		'REQUEST2': (() => {

			let headers = Buffer.from([
				0 + 0x00,
				128 + 64
			]);

			let mask = Buffer.alloc(4);

			mask[0] = (Math.random() * 0xff) | 0;
			mask[1] = (Math.random() * 0xff) | 0;
			mask[2] = (Math.random() * 0xff) | 0;
			mask[3] = (Math.random() * 0xff) | 0;

			let payload = Buffer.from('The sentence #2 inside the big buffer is exactly 64 bytes long.\n', 'utf8');

			return Buffer.concat([
				headers,
				mask,
				payload.map((value, index) => value ^ mask[index % mask.length])
			]);

		})(),

		'REQUEST3': (() => {

			let headers = Buffer.from([
				128 + 0x00,
				128 + 64
			]);

			let mask = Buffer.alloc(4);

			mask[0] = (Math.random() * 0xff) | 0;
			mask[1] = (Math.random() * 0xff) | 0;
			mask[2] = (Math.random() * 0xff) | 0;
			mask[3] = (Math.random() * 0xff) | 0;

			let payload = Buffer.from('The sentence #3 inside the big buffer is exactly 64 bytes long.\n', 'utf8');

			return Buffer.concat([
				headers,
				mask,
				payload.map((value, index) => value ^ mask[index % mask.length])
			]);

		})(),

		'RESPONSE1': Buffer.concat([
			Buffer.from([
				0 + 0x01,
				0 + 64
			]),
			Buffer.from('The sentence #1 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		]),

		'RESPONSE2': Buffer.concat([
			Buffer.from([
				0 + 0x00,
				0 + 64
			]),
			Buffer.from('The sentence #2 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		]),

		'RESPONSE3': Buffer.concat([
			Buffer.from([
				128 + 0x00,
				0 + 64
			]),
			Buffer.from('The sentence #3 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		])

	}

};



before('WS.upgrade()', function(assert) {

	this.server = new net.Server({
		allowHalfOpen:  true,
		pauseOnConnect: true
	});

	this.server.on('connection', (socket) => {

		this.connection = WS.upgrade(socket);

		socket.resume();

	});

	let handle = this.server.listen(13337, null);

	assert(isObject(handle),         true);
	assert(isObject(handle._handle), true);

});

describe('WS.connect()', function(assert) {

	assert(isFunction(WS.connect), true);

	let url        = URL.parse('ws://127.0.0.1:13337');
	let connection = WS.connect(url);

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

describe('WS.disconnect()', function(assert) {

	assert(isFunction(WS.connect),    true);
	assert(isFunction(WS.disconnect), true);

	let url        = URL.parse('ws://127.0.0.1:13337');
	let connection = WS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(WS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('WS.send()/CONTINUE', function(assert) {

	// TODO: Test Partial Frames (Continue Frame)

	// XXX: First Frame
	// WS.send(connection, {
	//   headers: {
	//     '@operator': 0x01,
	//     '@transfer': {
	//         'range': [ 0, 128 ] // if range[1] is lower than payload.length
	//     }
	//   },
	//   payload: Buffer.from('the complete payload with more than 256 bytes', 'utf8')
	// });
	//
	// XXX: Second Frame
	// WS.send(connection, {
	//   headers: {
	//     '@operator': 0x00,
	//     '@transfer': {
	//       'range': [ 128, 256 ]
	//     }
	//   },
	//   payload: Buffer.from('the complete payload with more than 256 bytes', 'utf8')
	// });
	//
	//
	// XXX: Receiving side gets range = [ 0, Infinity ] for all Continuation Frames
	// XXX: Last Continuation Frame is range = [ 0, length ]

});

describe('WS.send()/TEXT', function(assert) {

	assert(isFunction(WS.connect),    true);
	assert(isFunction(WS.disconnect), true);
	assert(isFunction(WS.send),       true);

	let url        = URL.parse('ws://127.0.0.1:13337');
	let connection = WS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@operator': 0x01,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   27,
					'range':    [ 0, 26 ]
				},
				'@type': 'response'
			},
			payload: Buffer.from('This is another text frame.', 'utf8')
		});

		setTimeout(() => {
			assert(WS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		setTimeout(() => {

			this.connection.once('request', (request) => {

				assert(request, {
					headers: {
						'@operator': 0x01,
						'@status':   null,
						'@transfer': {
							'encoding': null,
							'length':   21,
							'range':    [ 0, 20 ]
						},
						'@type': 'request'
					},
					payload: Buffer.from('This is a text frame.', 'utf8')
				});

				WS.send(this.connection, {
					headers: {
						'@operator': 0x01,
						'@type':     'response'
					},
					payload: Buffer.from('This is another text frame.', 'utf8')
				});

			});

		}, 0);

		setTimeout(() => {

			WS.send(connection, {
				headers: {
					'@operator': 0x01,
					'@type':     'request'
				},
				payload: Buffer.from('This is a text frame.', 'utf8')
			}, (result) => {
				assert(result, true);
			});

		}, 500);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('WS.send()/BINARY', function(assert) {

	assert(isFunction(WS.connect),    true);
	assert(isFunction(WS.disconnect), true);
	assert(isFunction(WS.send),       true);

	let buffer1 = Buffer.from([
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0
	]);

	let buffer2 = Buffer.from([
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0
	]);

	let url        = URL.parse('ws://127.0.0.1:13337');
	let connection = WS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@operator': 0x02,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   buffer2.length,
					'range':    [ 0, buffer2.length - 1 ]
				},
				'@type': 'response'
			},
			payload: buffer2
		});

		setTimeout(() => {
			assert(WS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		setTimeout(() => {

			this.connection.once('request', (request) => {

				assert(request, {
					headers: {
						'@operator': 0x02,
						'@status':   null,
						'@transfer': {
							'encoding': null,
							'length':   buffer1.length,
							'range':    [ 0, buffer1.length - 1 ]
						},
						'@type': 'request'
					},
					payload: buffer1
				});

				WS.send(this.connection, {
					headers: {
						'@operator': 0x02,
						'@type':     'response'
					},
					payload: buffer2
				});

			});

		}, 0);

		setTimeout(() => {

			WS.send(connection, {
				headers: {
					'@operator': 0x02,
					'@type':     'request'
				},
				payload: buffer1
			}, (result) => {
				assert(result, true);
			});

		}, 500);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});























describe('WS.receive()/client/partial', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['PARTIAL']['RESPONSE1'], (response) => {

		assert(response, {
			headers: {
				'@operator': 0x01,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   Infinity,
					'range':    [ 0, Infinity ]
				},
				'@type': 'response'
			},
			payload: Buffer.from('The sentence #1 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		});

	});

	WS.receive(null, PAYLOADS['PARTIAL']['RESPONSE2'], (response) => {

		assert(response, {
			headers: {
				'@operator': 0x00,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   Infinity,
					'range':    [ 0, Infinity ]
				},
				'@type': 'response'
			},
			payload: Buffer.from('The sentence #2 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		});

	});

	WS.receive(null, PAYLOADS['PARTIAL']['RESPONSE3'], (response) => {

		assert(response, {
			headers: {
				'@operator': 0x00,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   64,
					'range':    [ 0, 63 ]
				},
				'@type': 'response'
			},
			payload: Buffer.from('The sentence #3 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		});

	});

});

describe('WS.receive()/server/partial', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['PARTIAL']['REQUEST1'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x01,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   Infinity,
					'range':    [ 0, Infinity ]
				},
				'@type': 'request'
			},
			payload: Buffer.from('The sentence #1 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		});

	});

	WS.receive(null, PAYLOADS['PARTIAL']['REQUEST2'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x00,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   Infinity,
					'range':    [ 0, Infinity ]
				},
				'@type': 'request'
			},
			payload: Buffer.from('The sentence #2 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		});

	});

	WS.receive(null, PAYLOADS['PARTIAL']['REQUEST3'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x00,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   64,
					'range':    [ 0, 63 ]
				},
				'@type': 'request'
			},
			payload: Buffer.from('The sentence #3 inside the big buffer is exactly 64 bytes long.\n', 'utf8')
		});

	});

});




export default finish('stealth/connection/WS', {
	internet: false,
	network:  true,
	ports:    [ 13337 ]
});

