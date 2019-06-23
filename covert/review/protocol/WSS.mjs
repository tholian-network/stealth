
import { create } from '../../EXAMPLE.mjs';

import { describe, finish } from '../../source/Review.mjs';

import { WSS } from '../../../stealth/source/protocol/WSS.mjs';



describe('WSS.connect', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = create('wss://echo.websocket.org:443').ref;
	this.socket     = null;


	assert(typeof WSS.connect === 'function');

	this.connection = WSS.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

}, {
	internet: true
});

describe('WSS.send', function(assert) {

	assert(typeof WSS.send === 'function');
	assert(this.connection !== null);
	assert(this.socket !== null);


	this.connection.on('response', (response) => {

		assert(response.headers.service === 'mockup');
		assert(response.headers.method === 'method');
		assert(response.payload === 'payload');

	});

	WSS.send(this.socket, {
		headers: {
			service: 'mockup',
			method:  'method'
		},
		payload: 'payload'
	});

}, {
	internet: true
});



export default finish('protocol/WSS');

