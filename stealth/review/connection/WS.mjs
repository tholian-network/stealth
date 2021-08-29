
import net from 'net';

import { Buffer, isFunction } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { IP                 } from '../../../stealth/source/parser/IP.mjs';
import { URL                } from '../../../stealth/source/parser/URL.mjs';
import { WS                 } from '../../../stealth/source/connection/WS.mjs';



const PAYLOADS = {

	'CLOSE': {

		'RESPONSE': Buffer.from([
			128 + 0x08,
			0   + 0x02,
			(1000 >> 8) & 0xff,
			(1000 >> 0) & 0xff
		])

	},

	'ERROR': {

		'RESPONSE': Buffer.from([
			128 + 0x08,
			0   + 0x02,
			(1002 >> 8) & 0xff,
			(1002 >> 0) & 0xff
		])

	},

	'PINGPONG': {

		'REQUEST': Buffer.from([
			128 + 0x09,
			0   + 0x00
		]),

		'RESPONSE': Buffer.from([
			128 + 0x0a,
			0   + 0x00
		])

	},

	'SIMPLE': {

		'REQUEST': (() => {

			let headers = Buffer.from([
				128 + 0x01,
				128 + 64
			]);

			let mask = Buffer.alloc(4);

			mask[0] = (Math.random() * 0xff) | 0;
			mask[1] = (Math.random() * 0xff) | 0;
			mask[2] = (Math.random() * 0xff) | 0;
			mask[3] = (Math.random() * 0xff) | 0;

			let payload = Buffer.from('This sentence inside this utf-8 buffer is exactly 64 bytes long.', 'utf8');

			return Buffer.concat([
				headers,
				mask,
				payload.map((value, index) => value ^ mask[index % mask.length])
			]);

		})(),

		'RESPONSE': Buffer.concat([
			Buffer.from([
				128 + 0x01,
				0 + 64
			]),
			Buffer.from('This sentence inside this utf-8 buffer is exactly 64 bytes long.', 'utf8')
		])

	},

	'PARTIAL': {

		'REQUEST1': (() => {

			let headers = Buffer.from([
				128 + 0x01,
				128 + 64
			]);

			let mask = Buffer.alloc(4);

			mask[0] = (Math.random() * 0xff) | 0;
			mask[1] = (Math.random() * 0xff) | 0;
			mask[2] = (Math.random() * 0xff) | 0;
			mask[3] = (Math.random() * 0xff) | 0;

			let payload = Buffer.from('This sentence inside this utf-8 buffer is exactly 64 bytes long.', 'utf8');

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

			let payload = Buffer.from('This sentence inside this utf-8 buffer is exactly 64 bytes long.', 'utf8');

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

			let payload = Buffer.from('This sentence inside this utf-8 buffer is exactly 64 bytes long.', 'utf8');

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



const mock_frame = (type) => {

	let mask = [
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0,
		(Math.random() * 0xff) | 0
	];
	let temp = [];

	let payload = Buffer.from(JSON.stringify({
		headers: {
			service: 'service',
			method:  'method',
			event:   'event'
		},
		payload: Buffer.from('payload', 'utf8')
	}), 'utf8');

	if (type === 'client') {

		temp.push(128 + 0x01);
		temp.push(128 + 126);
		temp.push((payload.length >> 8) & 0xff);
		temp.push((payload.length >> 0) & 0xff);

		mask.forEach((value) => {
			temp.push(value);
		});

		payload.forEach((value, index) => {
			temp.push(value ^ mask[index % 4]);
		});

	} else {

		temp.push(128 + 0x01);
		temp.push(  0 + 126);
		temp.push((payload.length >> 8) & 0xff);
		temp.push((payload.length >> 0) & 0xff);

		payload.forEach((value) => {
			temp.push(value);
		});

	}

	return Buffer.from(temp);

};



describe('WS.receive()/client/close', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['CLOSE']['RESPONSE'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x08,
				'@status':   1000,
				'@transfer': {
					'encoding': null,
					'length':   null,
					'range':    [ 0, Infinity ]
				},
				'@type': 'response'
			},
			payload: null
		});

	});

});

describe('WS.receive()/client/error', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['ERROR']['RESPONSE'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x08,
				'@status':   1002,
				'@transfer': {
					'encoding': null,
					'length':   null,
					'range':    [ 0, Infinity ]
				},
				'@type': 'response'
			},
			payload: null
		});

	});

});

describe('WS.receive()/client/pingpong', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['PINGPONG']['RESPONSE'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x0a,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   null,
					'range':    [ 0, Infinity ]
				},
				'@type': 'response'
			},
			payload: null
		});

	});

});

describe('WS.receive()/client/simple', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['SIMPLE']['RESPONSE'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x01,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   64,
					'range':    [ 0, 63 ]
				},
				'@type': 'response'
			},
			payload: Buffer.from('This sentence inside this utf-8 buffer is exactly 64 bytes long.', 'utf8')
		});

	});

});

describe('WS.receive()/client/partial', function(assert) {

	// TODO: Partial Response

});

describe('WS.receive()/server/pingpong', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['PINGPONG']['REQUEST'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x09,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   null,
					'range':    [ 0, Infinity ]
				},
				'@type': 'request'
			},
			payload: null
		});

	});

});

describe('WS.receive()/server/simple', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['SIMPLE']['REQUEST'], (request) => {

		assert(request, {
			headers: {
				'@operator': 0x01,
				'@status':   null,
				'@transfer': {
					'encoding': null,
					'length':   64,
					'range':    [ 0, 63 ]
				},
				'@type': 'request'
			},
			payload: Buffer.from('This sentence inside this utf-8 buffer is exactly 64 bytes long.', 'utf8')
		});

	});

});

// describe('WS.connect()', function(assert) {
//
// 	assert(isFunction(WS.connect), true);
//
//
// 	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ] });
// 	let connection = WS.connect(url);
//
// 	connection.once('@connect', () => {
//
// 		assert(true);
//
// 		setTimeout(() => {
// 			connection.disconnect();
// 		}, 0);
//
// 	});
//
// 	connection.once('@disconnect', () => {
// 		assert(true);
// 	});
//
// });
//
// describe('WS.disconnect()', function(assert) {
//
// 	assert(isFunction(WS.disconnect), true);
//
//
// 	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ] });
// 	let connection = WS.connect(url);
//
// 	connection.once('@connect', () => {
//
// 		assert(true);
//
// 		setTimeout(() => {
// 			assert(WS.disconnect(connection), true);
// 		}, 0);
//
// 	});
//
// 	connection.once('@disconnect', () => {
// 		assert(true);
// 	});
//
// });
//
// describe('WS.receive()/client', function(assert) {
//
// 	assert(isFunction(WS.receive), true);
//
//
// 	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ] });
// 	let connection = WS.connect(url);
//
// 	connection.once('@connect', () => {
//
// 		WS.receive(connection, mock_frame('client'), (request) => {
//
// 			assert(request, {
// 				headers: {
// 					service: 'service',
// 					method:  'method',
// 					event:   'event'
// 				},
// 				payload: Buffer.from('payload', 'utf8')
// 			});
//
// 			connection.disconnect();
//
// 		});
//
// 	});
//
// });
//
// describe('WS.receive()/server', function(assert) {
//
// 	assert(isFunction(WS.receive), true);
//
//
// 	let nonce = Buffer.alloc(16);
// 	for (let n = 0; n < 16; n++) {
// 		nonce[n] = Math.round(Math.random() * 0xff);
// 	}
//
// 	let connection = WS.upgrade(new net.Socket(), {
// 		headers: {
// 			'connection':             'upgrade',
// 			'upgrade':                'websocket',
// 			'sec-websocket-protocol': 'stealth',
// 			'sec-websocket-key':      nonce.toString('base64')
// 		}
// 	});
//
// 	connection.once('@connect', () => {
//
// 		WS.receive(connection, mock_frame('server'), (response) => {
//
// 			assert(response, {
// 				headers: {
// 					service: 'service',
// 					method:  'method',
// 					event:   'event'
// 				},
// 				payload: Buffer.from('payload', 'utf8')
// 			});
//
// 			connection.disconnect();
//
// 		});
//
// 	});
//
// });
//
// describe('WS.send()', function(assert) {
//
// 	assert(isFunction(WS.send), true);
//
//
// 	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ] });
// 	let connection = WS.connect(url);
//
// 	connection.once('response', (response) => {
//
// 		assert(response, {
// 			headers: {
// 				service: 'service',
// 				event:   'event',
// 				method:  'method'
// 			},
// 			payload: Buffer.from('payload', 'utf8')
// 		});
//
// 	});
//
// 	connection.once('@connect', () => {
//
// 		WS.send(connection, {
// 			headers: {
// 				service: 'service',
// 				event:   'event',
// 				method:  'method'
// 			},
// 			payload: Buffer.from('payload', 'utf8')
// 		}, (result) => {
//
// 			assert(result, true);
//
// 		});
//
// 	});
//
// });
//
// describe('WS.upgrade()', function(assert) {
//
// 	let server = new net.Server({
// 		allowHalfOpen:  true,
// 		pauseOnConnect: true
// 	});
//
// 	server.once('connection', (socket) => {
//
// 		let connection = WS.upgrade(socket);
//
// 		connection.once('@connect', () => {
// 			assert(true);
// 		});
//
// 		connection.once('request', (request) => {
//
// 			assert(request, {
// 				headers: {
// 					service: 'service',
// 					event:   'event',
// 					method:  'method'
// 				},
// 				payload: Buffer.from('payload', 'utf8')
// 			});
//
// 		});
//
// 		connection.once('@disconnect', () => {
// 			assert(true);
// 		});
//
// 		socket.resume();
//
// 	});
//
// 	server.listen(13337, null);
//
//
// 	let url        = URL.parse('ws://localhost:13337');
// 	let connection = WS.connect(url);
//
// 	connection.once('@connect', () => {
//
// 		setTimeout(() => {
//
// 			WS.send(connection, {
// 				headers: {
// 					service: 'service',
// 					event:   'event',
// 					method:  'method'
// 				},
// 				payload: Buffer.from('payload', 'utf8')
// 			}, (result) => {
//
// 				assert(result, true);
//
// 			});
//
// 		}, 100);
//
// 		setTimeout(() => {
// 			assert(WS.disconnect(connection), true);
// 		}, 500);
//
// 	});
//
// 	connection.once('@disconnect', () => {
// 		assert(true);
// 	});
//
// 	setTimeout(() => {
// 		server.close();
// 		assert(true);
// 	}, 1000);
//
// });


export default finish('stealth/connection/WS', {
	internet: true,
	network:  true,
	ports:    [ 80, 13337 ]
});

