
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE                     } from '../../../covert/index.mjs';
import { IP                                                           } from '../../../stealth/source/parser/IP.mjs';
import { Host                                                         } from '../../../stealth/source/client/Host.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



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

describe('Host.prototype.refresh()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.refresh), true);

	this.client.services.host.refresh({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain: 'example.com',
			hosts: [
				EXAMPLE.ipv4,
				EXAMPLE.ipv6
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
				EXAMPLE.ipv4,
				EXAMPLE.ipv6
			]
		});

	});

});

describe('Host.prototype.remove()/success', function(assert) {

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
				EXAMPLE.ipv4,
				EXAMPLE.ipv6
			]
		});

	});

});

describe('Host.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.remove), true);

	this.client.services.host.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, true);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Host', {
	internet: true
});

