
import net from 'net';

import { Buffer, isFunction } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { IP                 } from '../../../stealth/source/parser/IP.mjs';
import { URL                } from '../../../stealth/source/parser/URL.mjs';
import { WSS                } from '../../../stealth/source/connection/WSS.mjs';



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



describe('WSS.connect()', function(assert) {

	assert(isFunction(WSS.connect), true);


	let url        = Object.assign(URL.parse('wss://echo.websocket.org:443'), { hosts: [ IP.parse('174.129.224.73') ] });
	let connection = WSS.connect(url);

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

describe('WSS.disconnect()', function(assert) {

	assert(isFunction(WSS.disconnect), true);


	let url        = Object.assign(URL.parse('wss://echo.websocket.org:443'), { hosts: [ IP.parse('174.129.224.73') ] });
	let connection = WSS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(WSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('WSS.receive()/client', function(assert) {

	assert(isFunction(WSS.receive), true);


	let url        = Object.assign(URL.parse('wss://echo.websocket.org:443'), { hosts: [ IP.parse('174.129.224.73') ] });
	let connection = WSS.connect(url);

	connection.once('@connect', () => {

		WSS.receive(connection, mock_frame('client'), (request) => {

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

describe('WSS.receive()/server', function(assert) {

	assert(isFunction(WSS.receive), true);


	let nonce = Buffer.alloc(16);
	for (let n = 0; n < 16; n++) {
		nonce[n] = Math.round(Math.random() * 0xff);
	}

	let connection = WSS.upgrade(new net.Socket(), {
		headers: {
			'connection':             'upgrade',
			'upgrade':                'websocket',
			'sec-websocket-protocol': 'stealth',
			'sec-websocket-key':      nonce.toString('base64')
		}
	});

	connection.once('@connect', () => {

		WSS.receive(connection, mock_frame('server'), (response) => {

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

describe('WSS.send()', function(assert) {

	assert(isFunction(WSS.send), true);


	let url        = Object.assign(URL.parse('wss://echo.websocket.org:443'), { hosts: [ IP.parse('174.129.224.73') ] });
	let connection = WSS.connect(url);

	connection.on('response', (response) => {

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

		WSS.send(connection, {
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


export default finish('stealth/connection/WSS', {
	internet: true,
	network:  true,
	ports:    [ 443 ]
});

