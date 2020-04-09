
import { describe, finish } from '../../../covert/index.mjs';
import { DOMAIN           } from '../../../covert/EXAMPLE.mjs';
import { DNS              } from '../../source/protocol/DNS.mjs';



describe('DNS.resolve/cloudflare', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'cloudflare-dns.com') || null;

	assert(DNS.SERVER !== null);
	assert(typeof DNS.resolve === 'function');

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.headers !== null);
		assert(response !== null && response.payload !== null);

		assert(response.payload !== null && response.payload.domain === 'example.com');
		assert(response.payload !== null && response.payload.hosts.length > 0);

		let check4 = null;
		let check6 = null;

		if (response.payload !== null && response.payload.hosts.length > 0) {
			check4 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.A)    || null;
			check6 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.AAAA) || null;
		}

		assert(check4 !== null);
		assert(check6 !== null);

	});

});

describe('DNS.resolve/google', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'dns.google') || null;

	assert(DNS.SERVER !== null);
	assert(typeof DNS.resolve === 'function');

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.headers !== null);
		assert(response !== null && response.payload !== null);

		assert(response.payload !== null && response.payload.domain === 'example.com');
		assert(response.payload !== null && response.payload.hosts.length > 0);

		let check4 = null;
		let check6 = null;

		if (response.payload !== null && response.payload.hosts.length > 0) {
			check4 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.A)    || null;
			check6 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.AAAA) || null;
		}

		assert(check4 !== null);
		assert(check6 !== null);

	});

});

describe('DNS.resolve/quad9', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'dns.quad9.net') || null;

	assert(DNS.SERVER !== null);
	assert(typeof DNS.resolve === 'function');

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.headers !== null);
		assert(response !== null && response.payload !== null);

		assert(response.payload !== null && response.payload.domain === 'example.com');
		assert(response.payload !== null && response.payload.hosts.length > 0);

		let check4 = null;
		let check6 = null;

		if (response.payload !== null && response.payload.hosts.length > 0) {
			check4 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.A)    || null;
			check6 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.AAAA) || null;
		}

		assert(check4 !== null);
		assert(check6 !== null);

	});

});

describe('DNS.resolve/securedns', function(assert) {

	DNS.SERVER = DNS.SERVERS.find((server) => server.domain === 'doh.securedns.eu') || null;

	assert(DNS.SERVER !== null);
	assert(typeof DNS.resolve === 'function');

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.headers !== null);
		assert(response !== null && response.payload !== null);

		assert(response.payload !== null && response.payload.domain === 'example.com');
		assert(response.payload !== null && response.payload.hosts.length > 0);

		let check4 = null;
		let check6 = null;

		if (response.payload !== null && response.payload.hosts.length > 0) {
			check4 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.A)    || null;
			check6 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.AAAA) || null;
		}

		assert(check4 !== null);
		assert(check6 !== null);

	});

});


export default finish('stealth/protocol/DNS', {
	internet: true
});

