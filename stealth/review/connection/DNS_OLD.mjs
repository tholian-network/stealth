
import { isFunction       } from '../../../base/index.mjs';
import { describe, finish } from '../../../covert/index.mjs';
import { DNS              } from '../../../stealth/source/connection/DNS.mjs';
import { IP               } from '../../../stealth/source/parser/IP.mjs';



describe('DNS.resolve()/cloudflare', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'cloudflare-dns.com') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {},
			payload: {
				domain: 'example.com',
				hosts:  [
					IP.parse('93.184.216.34'),
					IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
				]
			}
		});

	});

});

describe('DNS.resolve()/dnssb', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'doh.dns.sb') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {},
			payload: {
				domain: 'example.com',
				hosts:  [
					IP.parse('93.184.216.34'),
					IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
				]
			}
		});

	});

});

describe('DNS.resolve()/google', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'dns.google') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {},
			payload: {
				domain: 'example.com',
				hosts:  [
					IP.parse('93.184.216.34'),
					IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
				]
			}
		});

	});

});

describe('DNS.resolve()/quad9', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'dns.quad9.net') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {},
			payload: {
				domain: 'example.com',
				hosts:  [
					IP.parse('93.184.216.34'),
					IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
				]
			}
		});

	});

});


export default finish('stealth/connection/DNS', {
	internet: true,
	network:  false
});

