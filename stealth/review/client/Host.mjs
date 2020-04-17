
import { isFunction                                                   } from '../../../base/index.mjs';
import { IPV4, IPV6                                                   } from '../../../covert/EXAMPLE.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { IP                                                           } from '../../../stealth/source/parser/IP.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
describe(connect_client);

describe('client.services.host.save', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.save), true);

	this.client.services.host.save({
		domain: 'example.com',
		hosts:  [
			IP.parse('127.0.0.1'),
			IP.parse('::1')
		]
	}, (response) => {
		assert(response, true);
	});

});

describe('client.services.host.read', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.read), true);

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.domain, 'example.com');
		assert(response.hosts[0], IP.parse('127.0.0.1'));
		assert(response.hosts[1], IP.parse('::1'));

	});

});

describe('client.services.host.refresh', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.refresh), true);

	this.client.services.host.refresh({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.domain, 'example.com');
		assert(response.hosts.length > 0);

		let check4 = response.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, IPV4);
		assert(check6, IPV6);

	});

});

describe('client.services.host.read', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.read), true);

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.domain, 'example.com');
		assert(response.hosts.length > 0);

		let check4 = response.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, IPV4);
		assert(check6, IPV6);

	});

});

describe('client.services.host.remove', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.remove), true);

	this.client.services.host.remove({
		domain: 'example.com'
	}, (response) => {
		assert(response, true);
	});

});

describe(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Host', {
	internet: true
});

