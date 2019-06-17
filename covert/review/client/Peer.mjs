
import { after, before, describe, finish } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.peer.save', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.peer.save === 'function');

	this.client.services.peer.save({
		host:       '127.0.0.3',
		connection: 'mobile'
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.peer.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.peer.read === 'function');

	this.client.services.peer.read({
		host: '127.0.0.3'
	}, (response) => {

		assert(response !== null && response.domain === '127.0.0.3');
		assert(response !== null && response.connection === 'mobile');

	});

});

describe('client.services.peer.proxy', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.peer.proxy === 'function');

	this.client.services.peer.proxy({
		host: '127.0.0.3',
		headers: {
			service: 'settings',
			method:  'read'
		},
		payload: {
			internet: true
		}
	}, (response) => {

		assert(response !== null && response.internet !== null);
		assert(response.internet.connection === 'mobile');
		assert(response.internet.history === 'stealth');
		assert(response.internet.useragent === 'stealth');

	});

});

describe('client.services.peer.refresh', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.peer.refresh === 'function');

	this.client.services.peer.refresh({
		host: '127.0.0.3'
	}, (response) => {

		assert(response !== null && response.domain === '127.0.0.3');
		assert(response !== null && response.connection === 'mobile');

	});

});

describe('client.services.peer.remove', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.peer.remove === 'function');

	this.client.services.peer.remove({
		host: '127.0.0.3'
	}, (response) => {
		assert(response === true);
	});

});

describe(cli_disconnect);
after(srv_disconnect);


export default finish('client/Peer');

