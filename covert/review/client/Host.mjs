
import { after, before, describe, finish } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.host.save', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.save === 'function');

	this.client.services.host.save({
		domain: 'ietf.org',
		ipv4:   '127.0.0.1',
		ipv6:   '::1'
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.host.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.read === 'function');

	this.client.services.host.read({
		domain: 'ietf.org'
	}, (response) => {

		assert(response !== null && response.domain === 'ietf.org');
		assert(response !== null && response.ipv4 === '127.0.0.1');
		assert(response !== null && response.ipv6 === '0000:0000:0000:0000:0000:0000:0000:0001');

	});

});

describe('client.services.host.refresh', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.refresh === 'function');

	this.client.services.host.refresh({
		domain: 'ietf.org'
	}, (response) => {

		assert(response !== null && response.domain === 'ietf.org');
		assert(response !== null && response.ipv4 === '4.31.198.44');
		assert(response !== null && response.ipv6 === '2001:1900:3001:0011:0000:0000:0000:002c');

	});

});

describe('client.services.host.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.read === 'function');

	this.client.services.host.read({
		domain: 'ietf.org'
	}, (response) => {

		assert(response !== null && response.domain === 'ietf.org');
		assert(response !== null && response.ipv4 === '4.31.198.44');
		assert(response !== null && response.ipv6 === '2001:1900:3001:0011:0000:0000:0000:002c');

	});

});

describe('client.services.host.remove', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.remove === 'function');

	this.client.services.host.remove({
		domain: 'ietf.org'
	}, (response) => {
		assert(response === true);
	});

});

describe(cli_disconnect);
after(srv_disconnect);


export default finish('client/Host');

