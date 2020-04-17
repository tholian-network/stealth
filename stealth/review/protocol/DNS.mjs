
import { isFunction       } from '../../../base/index.mjs';
import { describe, finish } from '../../../covert/index.mjs';
import { IPV4, IPV6       } from '../../../covert/EXAMPLE.mjs';
import { DNS              } from '../../../stealth/source/protocol/DNS.mjs';



describe('DNS.resolve/cloudflare', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'cloudflare-dns.com') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.payload !== null);
		assert(response.payload.domain, 'example.com');
		assert(response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.payload.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, IPV4);
		assert(check6, IPV6);

	});

});

describe('DNS.resolve/google', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'dns.google') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.payload !== null);
		assert(response.payload.domain, 'example.com');
		assert(response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.payload.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, IPV4);
		assert(check6, IPV6);

	});

});

describe('DNS.resolve/quad9', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'dns.quad9.net') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.payload !== null);
		assert(response.payload.domain, 'example.com');
		assert(response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.payload.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, IPV4);
		assert(check6, IPV6);

	});

});

describe('DNS.resolve/securedns', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'doh.securedns.eu') || null;

	assert(DNS.SERVER !== null);
	assert(isFunction(DNS.resolve), true);

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.payload !== null);
		assert(response.payload.domain, 'example.com');
		assert(response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.payload.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, IPV4);
		assert(check6, IPV6);

	});

});


export default finish('stealth/protocol/DNS', {
	internet: true
});

