
import net from 'net';

import { Buffer, isFunction } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
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

const PACKETS = {

	'SIMPLE': {

		'REQUEST': {
			headers: {
				'@operator': 0x01,
				'@type':     'request'
			},
			payload: Buffer.from('{"status":1337}', 'utf8')
		}

	}

};



describe('WS.connect()', function(assert) {

	assert(isFunction(WS.connect), true);
	assert(isFunction(WS.upgrade), true);

	let server = new net.Server({
		allowHalfOpen:  true,
		pauseOnConnect: true
	});

	server.once('connection', (socket) => {

		let connection = WS.upgrade(socket);

		connection.once('@connect', () => {
			assert(true);
		});

		connection.once('@disconnect', () => {
			assert(true);
		});

		socket.resume();

	});

	server.once('close', () => {
		assert(true);
	});

	server.listen(13337, null);


	let url        = URL.parse('ws://localhost:13337');
	let connection = WS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			connection.disconnect();
		}, 500);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {

		server.close(() => {
			assert(true);
		});

	}, 1000);

});

describe('WS.disconnect()', function(assert) {

	assert(isFunction(WS.connect),    true);
	assert(isFunction(WS.disconnect), true);
	assert(isFunction(WS.upgrade),    true);

	let server = new net.Server({
		allowHalfOpen:  true,
		pauseOnConnect: true
	});

	server.once('connection', (socket) => {

		let connection = WS.upgrade(socket);

		connection.once('@connect', () => {

			assert(true);

			setTimeout(() => {
				assert(WS.disconnect(connection), true);
			}, 500);

		});

		connection.once('@disconnect', () => {
			assert(true);
		});

		socket.resume();

	});

	server.once('close', () => {
		assert(true);
	});

	server.listen(13337, null);


	let url        = URL.parse('ws://localhost:13337');
	let connection = WS.connect(url);

	connection.once('@connect', () => {
		assert(true);
	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {

		server.close(() => {
			assert(true);
		});

	}, 1000);

});

describe('WS.receive()/client/close', function(assert) {

	assert(isFunction(WS.receive), true);

	WS.receive(null, PAYLOADS['CLOSE']['RESPONSE'], (response) => {

		assert(response, {
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

	WS.receive(null, PAYLOADS['ERROR']['RESPONSE'], (response) => {

		assert(response, {
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

	WS.receive(null, PAYLOADS['PINGPONG']['RESPONSE'], (response) => {

		assert(response, {
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

	WS.receive(null, PAYLOADS['SIMPLE']['RESPONSE'], (response) => {

		assert(response, {
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

describe('WS.send()/server/simple', function(assert) {

	assert(isFunction(WS.upgrade), true);
	assert(isFunction(WS.send),    true);

	let server = new net.Server({
		allowHalfOpen:  true,
		pauseOnConnect: true
	});

	server.once('connection', (socket) => {

		let connection = WS.upgrade(socket);

		connection.once('@connect', () => {
			assert(true);
		});

		connection.once('request', (request) => {

			assert(request, {
				headers: {
					'@operator': 0x01,
					'@status':   null,
					'@transfer': {
						'encoding': null,
						'length':   15,
						'range':    [ 0, 14 ]
					},
					'@type': 'request'
				},
				payload: Buffer.from('{"status":1337}', 'utf8')
			});

		});

		connection.once('@disconnect', () => {
			assert(true);
		});

		socket.resume();

	});

	server.once('close', () => {
		assert(true);
	});

	server.listen(13337, null);


	let url        = URL.parse('ws://localhost:13337');
	let connection = WS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		WS.send(connection, PACKETS['SIMPLE']['REQUEST'], (result) => {
			assert(result, true);
		});

		setTimeout(() => {
			assert(WS.disconnect(connection), true);
		}, 500);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {

		server.close(() => {
			assert(true);
		});

	}, 1000);

});



export default finish('stealth/connection/WS', {
	internet: false,
	network:  true,
	ports:    [ 13337 ]
});

