
import { create } from '../../EXAMPLE.mjs';

import { after, before, describe, finish } from '../../source/Review.mjs';

import { WS } from '../../../stealth/source/protocol/WS.mjs';



before('WS.connect', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = create('ws://echo.websocket.org:80').ref;
	this.socket     = null;


	assert(typeof WS.connect === 'function');

	this.connection = WS.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

});

describe('WS.send', function(assert) {

	assert(typeof WS.send === 'function');
	assert(this.connection !== null);
	assert(this.socket !== null);


	this.connection.on('response', (response) => {

		assert(response.headers.service === 'mockup');
		assert(response.headers.method === 'method');
		assert(response.payload === 'payload');

	});

	WS.send(this.socket, {
		headers: {
			service: 'mockup',
			method:  'method'
		},
		payload: 'payload'
	});

});

after('WS.disconnect', function(assert) {

	if (this.socket !== null) {
		this.socket.end();
	}

	this.buffer     = null;
	this.connection = null;
	this.ref        = null;
	this.socket     = null;

	assert(this.buffer === null);
	assert(this.connection === null);
	assert(this.ref === null);
	assert(this.socket === null);

});



export default finish('protocol/WS', {
	internet: true
});

