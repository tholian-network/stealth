
import { DOMAIN } from '../../EXAMPLE.mjs';

import { describe, finish } from '../../source/Review.mjs';

import { DNS } from '../../../stealth/source/protocol/DNS.mjs';



describe('DNS.resolve', function(assert) {

	assert(typeof DNS.resolve === 'function');

	DNS.resolve({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.headers !== null);
		assert(response !== null && response.payload !== null);

		assert(response.payload !== null && response.payload.domain === 'example.com');
		assert(response.payload !== null && response.payload.hosts.length > 0);

		let check4 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.A) || null;
		let check6 = response.payload.hosts.find((ip) => ip.ip === DOMAIN.AAAA) || null;

		assert(check4 !== null);
		assert(check6 !== null);

	});

});



export default finish('protocol/DNS', {
	internet: true
});

