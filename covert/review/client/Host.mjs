
import { DOMAIN } from '../../EXAMPLE.mjs';

import { after, before, describe, finish } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';

import { IP } from '../../../stealth/source/parser/IP.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.host.save', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.save === 'function');

	this.client.services.host.save({
		domain: 'example.com',
		hosts:  [
			IP.parse('127.0.0.1'),
			IP.parse('::1')
		]
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.host.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.read === 'function');

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.domain === 'example.com');
		assert(response !== null && response.hosts.length === 2);
		assert(response !== null && response.hosts[0].ip === '127.0.0.1');
		assert(response !== null && response.hosts[1].ip === '0000:0000:0000:0000:0000:0000:0000:0001');

	});

});

describe('client.services.host.refresh', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.refresh === 'function');

	this.client.services.host.refresh({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.domain === 'example.com');
		assert(response !== null && response.hosts.length > 0);

		let check4 = response.hosts.find((ip) => ip.ip === DOMAIN.A) || null;
		let check6 = response.hosts.find((ip) => ip.ip === DOMAIN.AAAA) || null;

		assert(response !== null && check4 !== null);
		assert(response !== null && check6 !== null);

	});

});

describe('client.services.host.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.read === 'function');

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.domain === 'example.com');
		assert(response !== null && response.hosts.length > 0);

		let check4 = response.hosts.find((ip) => ip.ip === DOMAIN.A) || null;
		let check6 = response.hosts.find((ip) => ip.ip === DOMAIN.AAAA) || null;

		assert(response !== null && check4 !== null);
		assert(response !== null && check6 !== null);

	});

});

describe('client.services.host.remove', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.host.remove === 'function');

	this.client.services.host.remove({
		domain: 'example.com'
	}, (response) => {
		assert(response === true);
	});

});

describe(cli_disconnect);
after(srv_disconnect);



export default finish('client/Host', {
	internet: true
});

