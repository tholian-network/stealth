
import { isFunction, isObject                     } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { WSS                                      } from '../../../stealth/source/protocol/WSS.mjs';



before('WSS.connect()', function(assert) {

	this.connection = null;
	this.ref        = EXAMPLE.ref('wss://echo.websocket.org:443');

	assert(isFunction(WSS.connect), true);

	this.connection = WSS.connect(this.ref);

	this.connection.once('@connect', () => {
		assert(true);
	});

});

describe('WSS.send()', function(assert) {

	assert(isFunction(WSS.send), true);
	assert(this.connection !== null);

	this.connection.on('response', (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers), true);
		assert(response.headers.service,   'mockup');
		assert(response.headers.method,    'method');
		assert(response.payload,           'payload');

	});

	WSS.send(this.connection, {
		headers: {
			service: 'mockup',
			method:  'method'
		},
		payload: 'payload'
	});

});

describe('WSS.receive()', function(assert) {
});

after('WSS.disconnect()', function(assert) {

	assert(this.connection !== null);

	this.connection.once('@disconnect', () => {
		assert(true);
	});

	this.connection.disconnect();

	this.connection = null;
	this.ref        = null;

	assert(this.connection, null);
	assert(this.ref,        null);

});


export default finish('stealth/protocol/WSS', {
	internet: true
});

