
import net from 'net';

import { Buffer, isFunction } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { IP                 } from '../../../stealth/source/parser/IP.mjs';
import { URL                } from '../../../stealth/source/parser/URL.mjs';
import { WS                 } from '../../../stealth/source/connection/WS.mjs';



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



describe('WS.connect()', function(assert) {

	assert(isFunction(WS.connect), true);


	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ] });
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

	assert(isFunction(WS.disconnect), true);


	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ] });
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

describe('WS.receive()/client', function(assert) {

	assert(isFunction(WS.receive), true);


	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ] });
	let connection = WS.connect(url);

	connection.once('@connect', () => {

		WS.receive(connection, mock_frame('client'), (request) => {

			assert(request, {
				headers: {
					service: 'service',
					method:  'method',
					event:   'event'
				},
				payload: Buffer.from('payload', 'utf8')
			});

			connection.disconnect();

		});

	});

});

describe('WS.receive()/server', function(assert) {

	assert(isFunction(WS.receive), true);


	let nonce = Buffer.alloc(16);
	for (let n = 0; n < 16; n++) {
		nonce[n] = Math.round(Math.random() * 0xff);
	}

	let connection = WS.upgrade(new net.Socket(), {
		headers: {
			'connection':             'upgrade',
			'upgrade':                'websocket',
			'sec-websocket-protocol': 'stealth',
			'sec-websocket-key':      nonce.toString('base64')
		}
	});

	connection.once('@connect', () => {

		WS.receive(connection, mock_frame('server'), (response) => {

			assert(response, {
				headers: {
					service: 'service',
					method:  'method',
					event:   'event'
				},
				payload: Buffer.from('payload', 'utf8')
			});

			connection.disconnect();

		});

	});

});

describe('WS.send()', function(assert) {

	assert(isFunction(WS.send), true);


	let url        = Object.assign(URL.parse('ws://echo.websocket.org:80'), { hosts: [ IP.parse('174.129.224.73') ] });
	let connection = WS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				service: 'service',
				event:   'event',
				method:  'method'
			},
			payload: Buffer.from('payload', 'utf8')
		});

	});

	connection.once('@connect', () => {

		WS.send(connection, {
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

describe('WS.upgrade()', function(assert) {

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
					service: 'service',
					event:   'event',
					method:  'method'
				},
				payload: Buffer.from('payload', 'utf8')
			});

		});

		connection.once('@disconnect', () => {
			assert(true);
		});

		socket.resume();

	});

	server.listen(13337, null);


	let url        = URL.parse('ws://localhost:13337');
	let connection = WS.connect(url);

	connection.once('@connect', () => {

		setTimeout(() => {

			WS.send(connection, {
				headers: {
					service: 'service',
					event:   'event',
					method:  'method'
				},
				payload: Buffer.from('payload', 'utf8')
			}, (result) => {

				assert(result, true);

			});

		}, 100);

		setTimeout(() => {
			assert(WS.disconnect(connection), true);
		}, 500);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

	setTimeout(() => {
		server.close();
		assert(true);
	}, 1000);

});


export default finish('stealth/connection/WS', {
	internet: true,
	network:  true,
	ports:    [ 80, 13337 ]
});

