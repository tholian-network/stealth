
import { isFunction                      } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { IP                              } from '../../../../stealth/source/parser/IP.mjs';
import { Host                            } from '../../../../stealth/source/server/service/Host.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



before(connect);

describe('new Host()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.host instanceof Host, true);

});

describe('Host.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.host.toJSON), true);

	assert(this.server.services.host.toJSON(), {
		type: 'Host Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Host.isHost()', function(assert) {

	assert(isFunction(Host.isHost), true);

	assert(Host.isHost(null), false);
	assert(Host.isHost({}),   false);

	assert(Host.isHost({
		domain: 'example.com',
		hosts: [
			IP.parse('93.184.216.34'),
			IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
		]
	}), true);

});

describe('Host.toHost()', function(assert) {

	assert(isFunction(Host.toHost), true);

	assert(Host.toHost(null), null);
	assert(Host.toHost({}),   null);

	assert(Host.toHost({
		domain: 'example.com',
		hosts:  []
	}), {
		domain: 'example.com',
		hosts:  []
	});

	assert(Host.toHost({
		domain: 'example.com',
		hosts:  [
			IP.parse('93.184.216.34'),
			'another',
			IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946'),
			'value'
		]
	}), {
		domain: 'example.com',
		hosts:  [
			IP.parse('93.184.216.34'),
			IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
		]
	});

});

describe('Host.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.host.save), true);

	this.server.services.host.save({
		domain: 'example.com',
		hosts: [
			IP.parse('127.0.0.1'),
			IP.parse('::1')
		]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'host',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Host.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.host.read), true);

	this.server.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'host',
				event:   'read'
			},
			payload: {
				domain: 'example.com',
				hosts: [
					IP.parse('127.0.0.1'),
					IP.parse('::1')
				]
			}
		});

	});

});

describe('Host.prototype.resolve()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.host.resolve), true);

	this.server.services.host.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'host',
				event:   'resolve'
			},
			payload: {
				domain: 'example.com',
				hosts: [
					IP.parse('93.184.216.34'),
					IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
				]
			}
		});

	});

});

describe('Host.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.host.read), true);

	this.server.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'host',
				event:   'read'
			},
			payload: {
				domain: 'example.com',
				hosts: [
					IP.parse('93.184.216.34'),
					IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
				]
			}
		});

	});

});

describe('Host.prototype.remove()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.host.remove), true);

	this.server.services.host.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'host',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Host.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.host.read), true);

	this.server.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'host',
				event:   'read'
			},
			payload: {
				domain: 'example.com',
				hosts: [
					IP.parse('93.184.216.34'),
					IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
				]
			}
		});

	});

});

after(disconnect);


export default finish('stealth/server/service/Host', {
	internet: true,
	network:  true
});

