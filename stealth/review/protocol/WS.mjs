
import { isFunction, isObject                     } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { WS                                       } from '../../../stealth/source/protocol/WS.mjs';



before('WS.connect()', function(assert) {

	this.connection = null;
	this.ref        = EXAMPLE.ref('ws://echo.websocket.org:80');

	assert(isFunction(WS.connect), true);

	this.connection = WS.connect(this.ref);

	this.connection.once('@connect', () => {
		assert(true);
	});

});

describe('WS.send()', function(assert) {

	assert(isFunction(WS.send), true);
	assert(this.connection !== null);

	this.connection.on('response', (response) => {

		assert(response !== null);
		assert(response.headers !== null);

		assert(isObject(response.headers), true);
		assert(response.headers.service,   'mockup');
		assert(response.headers.method,    'method');
		assert(response.payload,           'payload');

	});

	WS.send(this.connection, {
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


export default finish('stealth/protocol/WS', {
	internet: true
});

