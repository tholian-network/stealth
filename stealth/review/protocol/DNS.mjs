
import { isFunction, isObject      } from '../../../base/index.mjs';
import { describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { DNS                       } from '../../../stealth/source/protocol/DNS.mjs';



describe('DNS.resolve()/cloudflare', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'cloudflare-dns.com') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isObject(response.payload), true);
		assert(response.payload.domain, 'example.com');
		assert(response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.payload.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});

describe('DNS.resolve()/dnssb', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'doh.dns.sb') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isObject(response.payload), true);
		assert(response.payload.domain, 'example.com');
		assert(response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.payload.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});

describe('DNS.resolve()/google', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'dns.google') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isObject(response.payload), true);
		assert(response.payload.domain, 'example.com');
		assert(response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.payload.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});

describe('DNS.resolve()/quad9', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'dns.quad9.net') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isObject(response.payload), true);
		assert(response.payload.domain, 'example.com');
		assert(response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.payload.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});


export default finish('stealth/protocol/DNS', {
	internet: true
});

