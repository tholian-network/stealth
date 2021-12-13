
import { isFunction                      } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { DNS                             } from '../../../stealth/source/connection/DNS.mjs';
import { IP                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../../../stealth/review/Stealth.mjs';



before(connect);

describe('Router.prototype.can()', function(assert) {

	assert(isFunction(this.stealth.server.router.can), true);

	let packet1 = {
		headers: {
			'@type': 'request'
		},
		payload: {
			questions: [{
				domain: 'example.com',
				type:   'A',
				value:  null
			}],
			answers: []
		}
	};
	let packet2 = {
		headers: {
			'@type': 'request'
		},
		payload: {
			questions: [{
				domain: 'example.com',
				type:   'AAAA',
				value:  null
			}],
			answers: []
		}
	};

	assert(this.stealth.server.router.can(packet1), true);
	assert(this.stealth.server.router.can(packet2), true);

});

describe('Router.prototype.receive()/A', function(assert) {

	assert(isFunction(this.stealth.server.router.receive), true);
	assert(isFunction(DNS.connect),                        true);
	assert(isFunction(DNS.send),                           true);

	let url        = URL.parse('dns://127.0.0.1:65432');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'A',
					value:  null
				}],
				answers: [{
					domain: 'example.com',
					type:   'A',
					value:  IP.parse('93.184.216.34')
				}]
			}
		});

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'A',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

});

describe('Router.prototype.receive()/AAAA', function(assert) {

	assert(isFunction(this.stealth.server.router.receive), true);
	assert(isFunction(DNS.connect),                        true);
	assert(isFunction(DNS.send),                           true);

	let url        = URL.parse('dns://127.0.0.1:65432');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  null
				}],
				answers: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  IP.parse('2606:2800:220:1:248:1893:25c8:1946')
				}]
			}
		});

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

});

describe('Router.prototype.resolve()', function(assert) {

	assert(isFunction(this.stealth.server.router.resolve), true);
	assert(this.stealth.settings.internet.connection,      'mobile');

	this.stealth.server.router.resolve({
		domain:    null,
		subdomain: null
	}, (host) => {
		assert(host, null);
	});

	this.stealth.server.router.resolve({
		domain:    null,
		subdomain: 'www'
	}, (host) => {
		assert(host, null);
	});

	this.stealth.server.router.resolve({
		domain:    'example.com',
		subdomain: null
	}, (host) => {

		assert(host, {
			domain: 'example.com',
			hosts:  [
				IP.parse('93.184.216.34'),
				IP.parse('2606:2800:220:1:248:1893:25c8:1946')
			]
		});

	});

	this.stealth.server.router.resolve({
		domain:    'example.com',
		subdomain: 'www'
	}, (host) => {

		assert(host, {
			domain: 'www.example.com',
			hosts:  [
				IP.parse('93.184.216.34'),
				IP.parse('2606:2800:220:1:248:1893:25c8:1946')
			]
		});

	});

});

after(disconnect);


export default finish('stealth/server/Router', {
	internet: true,
	network:  true
});

