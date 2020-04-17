
import { isFunction, isObject            } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { create                          } from '../../../covert/EXAMPLE.mjs';
import { WSS                             } from '../../../stealth/source/protocol/WSS.mjs';



before('WSS.connect', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.ref        = create('wss://echo.websocket.org:443').ref;
	this.socket     = null;

	assert(isFunction(WSS.connect), true);

	this.connection = WSS.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

});

describe('WSS.send', function(assert) {

	assert(isFunction(WSS.send), true);
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

	WSS.send(this.socket, {
		headers: {
			service: 'mockup',
			method:  'method'
		},
		payload: 'payload'
	});

});

describe('WSS.receive', function(assert) {
});

after('WSS.disconnect', function(assert) {

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


export default finish('stealth/protocol/WSS', {
	internet: true
});

