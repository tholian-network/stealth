
import { isFunction, isObject            } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { create                          } from '../../../covert/EXAMPLE.mjs';
import { WS                              } from '../../../stealth/source/protocol/WS.mjs';



before('WS.connect()', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = create('ws://echo.websocket.org:80').ref;
	this.socket     = null;

	assert(isFunction(WS.connect), true);

	this.connection = WS.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

});

describe('WS.send()', function(assert) {

	assert(isFunction(WS.send), true);
	assert(this.connection !== null);
	assert(this.socket !== null);

	this.connection.on('response', (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers), true);
		assert(response.headers.service,   'mockup');
		assert(response.headers.method,    'method');
		assert(response.payload,           'payload');

	});

	WS.send(this.socket, {
		headers: {
			service: 'mockup',
			method:  'method'
		},
		payload: 'payload'
	});

});

describe('WS.receive()', function(assert) {
});

after('WS.disconnect()', function(assert) {

	if (this.socket !== null) {
		this.socket.end();
	}

	this.buffer     = null;
	this.connection = null;
	this.ref        = null;
	this.socket     = null;

	assert(this.buffer,     null);
	assert(this.connection, null);
	assert(this.ref,        null);
	assert(this.socket,     null);

});


export default finish('stealth/protocol/WS', {
	internet: true
});

