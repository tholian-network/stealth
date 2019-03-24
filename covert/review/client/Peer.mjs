
import { after, before, describe, finish } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.peer.save', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.peer.save === 'function');

	this.client.services.peer.save({
		host:       '192.168.1.10',
		connection: 'mobile',
		status:     'online'
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.peer.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.peer.read === 'function');

	this.client.services.peer.read({
		host: '192.168.1.10'
	}, (response) => {

		assert(response !== null && response.domain === '192.168.1.10');
		assert(response !== null && response.connection === 'mobile');
		assert(response !== null && response.status === 'online');

	});

});

describe('client.services.peer.remove', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.peer.remove === 'function');

	this.client.services.peer.remove({
		host: '129.168.1.10'
	}, (response) => {
		assert(response === true);
	});

});

describe(cli_disconnect);
after(srv_disconnect);


export default finish('client/Peer');

