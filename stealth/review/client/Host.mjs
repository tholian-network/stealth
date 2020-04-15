
import { DOMAIN                                                       } from '../../../covert/EXAMPLE.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { IP                                                           } from '../../../stealth/source/parser/IP.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
describe(connect_client);

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

describe(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Host', {
	internet: true
});

