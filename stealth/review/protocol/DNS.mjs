
import { isFunction                } from '../../../base/index.mjs';
import { describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { DNS                       } from '../../../stealth/source/protocol/DNS.mjs';



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
				hosts:  EXAMPLE.hosts
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
				hosts:  EXAMPLE.hosts
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
				hosts:  EXAMPLE.hosts
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
				hosts:  EXAMPLE.hosts
			}
		});

	});

});


export default finish('stealth/protocol/DNS', {
	internet: true
});

