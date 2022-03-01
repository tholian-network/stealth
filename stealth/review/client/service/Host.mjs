
import { isFunction                                                   } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { IP                                                           } from '../../../../stealth/source/parser/IP.mjs';
import { Host                                                         } from '../../../../stealth/source/client/service/Host.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Host()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.host instanceof Host, true);

});

describe('Host.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.toJSON), true);

	assert(this.client.services.host.toJSON(), {
		type: 'Host Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Host.prototype.save()', function(assert) {

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

describe('Host.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.read), true);

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain: 'example.com',
			hosts: [
				IP.parse('127.0.0.1'),
				IP.parse('::1')
			]
		});

	});

});

describe('Host.prototype.resolve()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.resolve), true);

	this.client.services.host.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain: 'example.com',
			hosts: [
				IP.parse('93.184.216.34'),
				IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
			]
		});

	});

});

describe('Host.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.read), true);

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain: 'example.com',
			hosts: [
				IP.parse('93.184.216.34'),
				IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
			]
		});

	});

});

describe('Host.prototype.remove()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.remove), true);

	this.client.services.host.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, true);

	});

});

describe('Host.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.read), true);

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain: 'example.com',
			hosts: [
				IP.parse('93.184.216.34'),
				IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
			]
		});

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Host', {
	internet: true,
	network:  true
});

