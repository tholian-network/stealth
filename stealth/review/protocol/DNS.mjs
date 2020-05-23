
import { isFunction                } from '../../../base/index.mjs';
import { describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { DNS                       } from '../../../stealth/source/protocol/DNS.mjs';



describe('DNS.resolve()/google', function(assert) {

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

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});

describe('DNS.resolve()/securedns', function(assert) {

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

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});


export default finish('stealth/protocol/DNS', {
	internet: true
});

