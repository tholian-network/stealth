
import { create, PAYLOAD, REQUEST        } from '../../EXAMPLE.mjs';
import { after, before, describe, finish } from '../../source/Review.mjs';
import { SOCKS                           } from '../../../stealth/source/protocol/SOCKS.mjs';



before('SOCKS.connect', function(assert) {

	this.buffer     = {};
	this.connection = null;
	this.proxy      = { host: '127.0.0.3', port: 1080 };
	this.ref        = Object.assign(create('https://example.com/index.html').ref, { proxy: this.proxy });
	this.socket     = null;


	assert(typeof SOCKS.connect === 'function');


	this.connection = SOCKS.connect(this.ref, this.buffer);

	this.connection.on('@connect', (socket) => {
		this.socket = socket;
		assert(this.socket !== null);
	});

	this.connection.on('@disconnect', () => {
		this.socket = null;
	});

});

describe('SOCKS.send', function(assert) {

	assert(typeof SOCKS.send === 'function');
	assert(this.connection !== null);
	assert(this.socket !== null);


	this.connection.on('response', (response) => {

		let html = (response.payload || '').toString('utf8');

		assert(response.payload !== null && html.includes('Example Domain'));

	});


	SOCKS.send(this.socket, REQUEST);

});

describe('SOCKS.receive', function(assert) {

	assert(typeof SOCKS.receive === 'function');
	assert(this.buffer !== null);


	SOCKS.receive(this.socket, PAYLOAD, (response) => {

		assert(response !== null);
		assert(response.headers['@status'] === '200 OK');
		assert(response.headers['content-length'] === '' + response.payload.length);

		let html = (response.payload || '').toString('utf8');

		assert(response.payload !== null && html.includes('Example Domain'));

	});

});

after('SOCKS.disconnect', function(assert) {

	if (this.socket !== null) {
		this.socket.end();
	}

	this.buffer     = null;
	this.connection = null;
	this.proxy      = null;
	this.ref        = null;
	this.socket     = null;

	assert(this.buffer === null);
	assert(this.connection === null);
	assert(this.proxy === null);
	assert(this.ref === null);
	assert(this.socket === null);

});


export default finish('protocol/SOCKS', {
	internet: true
});

